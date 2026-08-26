"""
LLM utility - wraps Google Gemini for use across all planets.
Uses gemini-2.5-flash (the model available on this account).

Resilience (planets must actually work):
- Every call is retried with exponential backoff + jitter, so transient
  rate limits (429) and server hiccups (5xx, timeouts) don't kill a planet.
- When Google returns a "Please retry in Xs" hint (per-minute free-tier
  window), the call waits exactly that long and retries — the planet keeps
  working instead of giving up.
- Only the genuinely dead FREE-TIER DAILY quota (no short retry hint) arms
  a fail-fast cooldown, so missions don't hammer a dead API. The flag
  clears automatically the moment a call succeeds again (after the daily
  reset), so planets resume real LLM work without a restart.
- Calls are globally serialized with a minimum spacing so a mission's burst
  stays under the free-tier per-minute request window.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import settings
import json
import re
import asyncio
import random
import time

# Hard timeout per LLM call (seconds) — AIRA must never hang waiting on a model.
LLM_TIMEOUT_SECONDS = 45

# Retry policy — exponential backoff with jitter for transient failures.
RETRY_ATTEMPTS = 3
RETRY_BASE_DELAY = 2.0   # seconds; doubles each attempt
RETRY_MAX_DELAY = 10.0

# Minimum gap between the START of two LLM calls (keeps bursts under the
# free-tier per-minute request window, e.g. ~10–20 req/min).
MIN_CALL_INTERVAL = 2.0

# The model available on this account
DEFAULT_MODEL = "gemini-2.5-flash"

# Google's prefix for BOTH the transient per-minute window AND the dead
# daily quota. We distinguish them by the "Please retry in Xs" hint below.
DAILY_QUOTA_MARKER = "exceeded your current quota"

# Google tells us exactly how long to wait, e.g. "Please retry in 41.54s".
RETRY_HINT_RE = re.compile(r"please retry in ([\d.]+)\s*s", re.IGNORECASE)

# A retry hint longer than this means the daily quota (hours away), not a
# transient window — fail fast instead of sleeping forever.
MAX_TRANSIENT_RETRY_DELAY = 30.0  # cap the Google 'retry in Xs' hint at 30s max

# Once the daily quota error is seen (no short retry hint), calls fail fast
# for this window, then one call retries the API (quota may have reset).
DAILY_QUOTA_COOLDOWN = 60  # 1 minute cooldown before trying again
_DAILY_QUOTA_SINCE: float | None = None  # time.monotonic() timestamp

# Global serialization + spacing so missions stay within the per-minute window.
_call_lock: asyncio.Lock | None = None
_last_call_start = 0.0


def _get_call_lock() -> asyncio.Lock:
    global _call_lock
    if _call_lock is None:
        _call_lock = asyncio.Lock()
    return _call_lock


def get_llm(temperature: float = 0.7, model: str = DEFAULT_MODEL) -> ChatGoogleGenerativeAI:
    """Return a configured Gemini LLM instance."""
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        convert_system_message_to_human=True,
    )


def _retry_hint(err: Exception) -> float | None:
    """Return the seconds Google suggests waiting, or None if not present."""
    msg = str(err).lower()
    m = RETRY_HINT_RE.search(msg)
    if not m:
        return None
    try:
        delay = float(m.group(1))
    except ValueError:
        return None
    if delay > MAX_TRANSIENT_RETRY_DELAY:
        return None  # daily quota — hours away, don't sleep forever
    return delay


def _is_daily_quota(err: Exception) -> bool:
    """True only when the FREE-TIER DAILY quota is exhausted.

    The transient per-minute window ALSO starts with "You exceeded your
    current quota" but includes a short "Please retry in Xs" hint. If that
    hint is present, the call can recover quickly — it is NOT the daily
    quota, so it must NOT arm the fail-fast flag.
    """
    if DAILY_QUOTA_MARKER not in str(err).lower():
        return False
    return _retry_hint(err) is None


def _is_retryable(err: Exception) -> bool:
    """True for transient failures worth retrying (429/5xx/network/timeout)."""
    # Google API errors expose .status_code / .code (e.g. 429, 503)
    for attr in ("status_code", "code"):
        try:
            code = int(getattr(err, attr))
            if code in (408, 429, 500, 502, 503, 504):
                return True
            if code < 500:
                # 400 INVALID_ARGUMENT, 401/403 auth, 404 model missing — no retry
                return False
        except (TypeError, ValueError, AttributeError):
            pass
    msg = str(err).lower()
    # Never retry permanent config errors
    non_retryable = (
        "api key not valid", "invalid argument", "permission denied",
        "not found", "model not", "does not exist",
    )
    if any(m in msg for m in non_retryable):
        return False
    # Default: assume transient (network drop, timeout, serialization)
    return True


async def llm_call(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    """Make a simple LLM call and return text response (bounded by a timeout)."""
    global _DAILY_QUOTA_SINCE, _last_call_start
    if _DAILY_QUOTA_SINCE is not None:
        # Fail fast inside the cooldown window; try the API again once it passes.
        if time.monotonic() - _DAILY_QUOTA_SINCE < DAILY_QUOTA_COOLDOWN:
            raise RuntimeError(
                "Gemini daily free-tier quota is exhausted. Missions complete via "
                "AIRA fallbacks; planets resume real LLM work automatically after "
                "the quota resets."
            )
        _DAILY_QUOTA_SINCE = None  # cooldown passed — attempt the API again

    llm = get_llm(temperature=temperature)
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    last_err: Exception | None = None
    async with _get_call_lock():
        for attempt in range(RETRY_ATTEMPTS):
            # Space calls out so a mission burst stays under the per-minute window.
            gap = MIN_CALL_INTERVAL - (time.monotonic() - _last_call_start)
            if gap > 0:
                await asyncio.sleep(gap)
            _last_call_start = time.monotonic()
            try:
                response = await asyncio.wait_for(llm.ainvoke(messages), timeout=LLM_TIMEOUT_SECONDS)
                # A successful call means quota recovered (e.g. daily reset).
                _DAILY_QUOTA_SINCE = None
                return response.content
            except Exception as e:
                last_err = e
                if _is_daily_quota(e):
                    _DAILY_QUOTA_SINCE = time.monotonic()
                    raise  # daily quota gone — fail fast, don't retry
                if not _is_retryable(e):
                    raise
                # Honor Google's explicit "retry in Xs" when present (transient
                # per-minute window); otherwise exponential backoff + jitter.
                hint = _retry_hint(e)
                if hint is not None:
                    delay = min(RETRY_MAX_DELAY, min(hint, MAX_TRANSIENT_RETRY_DELAY) + 1.0) * (0.9 + 0.2 * random.random())
                else:
                    delay = min(RETRY_MAX_DELAY, RETRY_BASE_DELAY * (2 ** attempt)) * (0.5 + random.random())
                await asyncio.sleep(delay)

    assert last_err is not None
    raise last_err


def extract_json(text: str) -> dict:
    """Extract JSON from LLM response that may contain markdown code blocks."""
    # Try to find JSON in code blocks first
    pattern = r"```(?:json)?\s*([\s\S]*?)```"
    match = re.search(pattern, text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try raw JSON
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in text
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    return {"raw": text}


async def llm_json_call(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> dict:
    """Make an LLM call and return parsed JSON."""
    full_system = system_prompt + "\n\nIMPORTANT: Always respond with valid JSON only. No extra text outside JSON."
    response = await llm_call(full_system, user_prompt, temperature)
    return extract_json(response)
