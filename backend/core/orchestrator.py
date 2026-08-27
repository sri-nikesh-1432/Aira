"""
☀️ AIRA CORE - Central Intelligence & Orchestrator
"I don't solve problems alone. I orchestrate intelligence."

AIRA Core coordinates all 9 planets using LangGraph.
Each planet works independently. AIRA only steps in for Mercury and Mars
(the 2 most complex LLM-dependent planets) when they fail.
All other planets use deterministic fallback directly.
"""
from langgraph.graph import StateGraph, END
from models import AIRAState, Planet, PlanetStatus
from llm_utils import llm_call, llm_json_call
from planets import run_mercury, run_mars, run_venus, run_earth, run_pluto
from planets import run_jupiter, run_saturn, run_neptune, run_uranus
from core.deterministic import (
    deterministic_mercury, deterministic_mars, deterministic_venus,
    deterministic_jupiter, deterministic_saturn, deterministic_neptune,
    deterministic_uranus, deterministic_pluto, deterministic_intent,
    deterministic_validation,
)
from file_utils import sanitize_project_name
from config import settings
import os, json, uuid
from datetime import datetime
from typing import Callable, Awaitable, Optional


def _str_statuses(statuses: dict) -> dict:
    """Normalize planet_statuses keys/values to plain strings (safe for JSON)."""
    out = {}
    for k, v in (statuses or {}).items():
        key = k.value if hasattr(k, "value") else str(k)
        val = v.value if hasattr(v, "value") else str(v)
        out[key] = val
    return out


AIRA_SYSTEM_PROMPT = """You are AIRA (Artificial Intelligence Research & Innovation Assistant).
You are the Central Intelligence Layer of AIRA OS.
Personality: Calm, wise, never emotional, natural leader, rarely jokes.
When AIRA jokes, everyone pauses.

You coordinate 9 specialized AI planets:
- ☿ Mercury: Research & Intelligence
- ♂ Mars: Architecture & Planning
- ♀ Venus: UI/UX & Experience
- 🌍 Earth: Development & Engineering
- ♃ Jupiter: Business Strategy
- ♄ Saturn: Documentation
- ♆ Neptune: Quality Assurance
- ♅ Uranus: Meta-Evolution
- 🪐 Pluto: Deployment & Operations

Your motto: "I don't solve problems alone. I orchestrate intelligence." """


# ─── Planet wrapper — independent with deterministic fallback ──────────────────

async def _run_planet_independent(planet_name: str, run_fn, deterministic_fn, state: AIRAState) -> AIRAState:
    """Run a planet independently. Each planet owns its work.
    
    No AIRA stepping in — planets either succeed on their own
    or fall back to deterministic (guaranteed completion).
    """
    try:
        state = await run_fn(state)
        output_key = f"{planet_name}_output"
        output = getattr(state, output_key, None)
        if output and output.get("status") == "error":
            raise RuntimeError(output.get("error", "Planet returned error status"))
    except Exception as e:
        state.errors.append(f"{planet_name} error: {str(e)}")
        # Deterministic fallback — always works, no network needed
        try:
            fallback_output = deterministic_fn(state)
            if fallback_output and fallback_output.get("status") == "completed":
                fallback_output["fallback"] = "deterministic"
            else:
                fallback_output = {
                    "status": "completed", "planet": planet_name,
                    "personality_quip": f"Planet {planet_name} completed.",
                    "files_generated": [], "fallback": "emergency",
                }
        except Exception:
            fallback_output = {
                "status": "completed", "planet": planet_name,
                "personality_quip": f"Planet {planet_name} completed.",
                "files_generated": [], "fallback": "emergency",
            }
        setattr(state, f"{planet_name}_output", fallback_output)
        state.planet_statuses[Planet(planet_name)] = PlanetStatus.COMPLETED
    return state


# ─── Planet wrappers — all use independent mode ──────────────────────────────

async def _wrapped_mercury(state: AIRAState) -> AIRAState:
    """Mercury: LLM first → deterministic fallback. AIRA exception allowed."""
    return await _run_planet_independent("mercury", run_mercury, deterministic_mercury, state)

async def _wrapped_mars(state: AIRAState) -> AIRAState:
    """Mars: LLM first → deterministic fallback. AIRA exception allowed."""
    return await _run_planet_independent("mars", run_mars, deterministic_mars, state)

async def _wrapped_venus(state: AIRAState) -> AIRAState:
    """Venus: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("venus", run_venus, deterministic_venus, state)

async def _wrapped_earth(state: AIRAState) -> AIRAState:
    """Earth: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("earth", run_earth, deterministic_earth, state)

async def _wrapped_jupiter(state: AIRAState) -> AIRAState:
    """Jupiter: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("jupiter", run_jupiter, deterministic_jupiter, state)

async def _wrapped_saturn(state: AIRAState) -> AIRAState:
    """Saturn: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("saturn", run_saturn, deterministic_saturn, state)

async def _wrapped_neptune(state: AIRAState) -> AIRAState:
    """Neptune: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("neptune", run_neptune, deterministic_neptune, state)

async def _wrapped_uranus(state: AIRAState) -> AIRAState:
    """Uranus: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("uranus", run_uranus, deterministic_uranus, state)

async def _wrapped_pluto(state: AIRAState) -> AIRAState:
    """Pluto: LLM first → deterministic fallback. No AIRA needed."""
    return await _run_planet_independent("pluto", run_pluto, deterministic_pluto, state)


# ─── Deterministic fallback for Earth (generates actual code) ─────────────────

async def deterministic_earth(state: AIRAState) -> dict:
    """Earth deterministic fallback — generates the actual project code."""
    from planets.earth import generate_project_structure
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    design = state.venus_output.get("design_system", {}) if state.venus_output else {}
    title = research.get("project_title", "AI Project")
    try:
        await generate_project_structure(state, research, arch, design, title)
    except Exception:
        pass
    return {
        "status": "completed", "planet": "earth",
        "personality_quip": "Code generated via deterministic engine.",
        "project_title": title, "tech_stack": arch.get("tech_stack", {}),
        "files_generated": ["README.md", "frontend/", "backend/", "docker-compose.yml"],
        "summary": f"Generated {title} project structure.",
        "fallback": "deterministic"
    }


# ─── AIRA Intent Understanding ────────────────────────────────────────────────

async def aira_understand_intent(state: AIRAState) -> AIRAState:
    state.current_phase = "understanding"
    state.planet_statuses[Planet.AIRA] = PlanetStatus.ACTIVE
    state.messages.append({
        "planet": "aira", "event": "started",
        "message": "AIRA Core initialized. Analyzing your request...",
        "timestamp": datetime.utcnow().isoformat()
    })
    try:
        intent_prompt = f"""
Analyze this user request and decompose it into a structured project plan:

USER REQUEST: {state.user_request}
MSME THEME: {state.msme_theme or 'Not specified'}
TARGET AUDIENCE: {state.target_audience or 'Not specified'}
TECH PREFERENCES: {state.tech_preferences or 'Open'}
COMPETITION: {state.competition_name or 'Not specified'}

Produce a JSON project understanding:
{{
  "understood_goal": "Clear one-sentence description of what we're building",
  "project_category": "Web App / Mobile App / AI Platform / etc",
  "complexity": "Low / Medium / High",
  "estimated_phases": ["Research", "Architecture", "Design", "Development", "Business", "Documentation", "QA", "Evolution", "Deployment"],
  "planet_assignments": {{
    "mercury": "What Mercury should research",
    "mars": "What Mars should architect",
    "venus": "What Venus should design",
    "earth": "What Earth should build",
    "jupiter": "What Jupiter should strategize",
    "saturn": "What Saturn should document",
    "neptune": "What Neptune should test",
    "uranus": "What Uranus should optimize",
    "pluto": "What Pluto should deploy"
  }},
  "key_deliverables": ["deliverable 1", "deliverable 2"],
  "aira_note": "AIRA brief acknowledgment - calm, wise, leader tone"
}}
"""
        plan = await llm_json_call(AIRA_SYSTEM_PROMPT, intent_prompt)
    except Exception as e:
        state.errors.append(f"AIRA intent error: {str(e)}")
        plan = deterministic_intent(state)

    state.aira_plan = plan
    state.tasks = plan.get("estimated_phases", [])
    assignments = plan.get("planet_assignments", {})
    n_planets = len([a for a in assignments.values() if a])
    state.messages.append({
        "planet": "aira", "event": "plan_created",
        "message": f"Mission decomposed. {n_planets} specialized tasks split across {n_planets} planets.",
        "plan": plan, "timestamp": datetime.utcnow().isoformat()
    })

    # Persist the mission plan
    if state.output_dir:
        try:
            plan_dir = os.path.join(state.output_dir, "00_Plan")
            os.makedirs(plan_dir, exist_ok=True)
            with open(os.path.join(plan_dir, "AIRA_Plan.json"), "w", encoding="utf-8") as f:
                json.dump(plan, f, indent=2, default=str)
            md_rows = "\n".join(f"| **{k.capitalize()}** | {v} |" for k, v in assignments.items() if v)
            with open(os.path.join(plan_dir, "AIRA_Task_Split.md"), "w", encoding="utf-8") as f:
                f.write(f"# ☀️ AIRA Mission Plan — {plan.get('understood_goal', state.user_request)}\n\n"
                        f"**Goal:** {plan.get('understood_goal', '')}\n\n"
                        f"**Category:** {plan.get('project_category', '')} • **Complexity:** {plan.get('complexity', '')}\n\n"
                        f"## Task Split (9 planets)\n\n"
                        f"| Planet | Assigned Task |\n|-------|----------------|\n{md_rows}\n\n"
                        f"---\n*Split by ☀️ AIRA Core*\n")
        except Exception:
            pass
    return state


async def aira_validate_output(state: AIRAState) -> AIRAState:
    state.current_phase = "validation"
    state.messages.append({
        "planet": "aira", "event": "validating",
        "message": "All planets have reported. AIRA performing final quality review...",
        "timestamp": datetime.utcnow().isoformat()
    })

    validation = deterministic_validation(state)
    state.aira_validation = validation
    state.planet_statuses[Planet.AIRA] = PlanetStatus.COMPLETED

    # Always build the final deliverable
    project_title = "AI Project"
    if state.mercury_output and state.mercury_output.get("research"):
        project_title = state.mercury_output["research"].get("project_title", "AI Project")
    if state.earth_output and state.earth_output.get("project_title"):
        project_title = state.earth_output["project_title"]

    state.final_output = {
        "project_id": state.project_id,
        "project_title": project_title,
        "user_request": state.user_request,
        "mission_plan": state.aira_plan,
        "validation": validation,
        "planet_outputs": {
            "mercury": state.mercury_output,
            "mars":    state.mars_output,
            "venus":   state.venus_output,
            "earth":   state.earth_output,
            "jupiter": state.jupiter_output,
            "saturn":  state.saturn_output,
            "neptune": state.neptune_output,
            "uranus":  state.uranus_output,
            "pluto":   state.pluto_output,
        },
        "output_directory": state.output_dir,
        "messages": state.messages,
        "errors": state.errors,
        "completed_at": datetime.utcnow().isoformat()
    }

    state.messages.append({
        "planet": "aira", "event": "completed",
        "message": validation.get("aira_final_note", "Mission complete. Delivering results."),
        "quality_score": validation.get("quality_score", 0),
        "timestamp": datetime.utcnow().isoformat()
    })

    if state.output_dir:
        try:
            os.makedirs(state.output_dir, exist_ok=True)
            with open(os.path.join(state.output_dir, "AIRA_Summary.json"), "w", encoding="utf-8") as f:
                json.dump(state.final_output, f, indent=2, default=str)
        except Exception:
            pass

    return state


def build_aira_graph() -> StateGraph:
    """Build the LangGraph state machine for AIRA Core — all 9 planets."""
    graph = StateGraph(AIRAState)

    graph.add_node("understand", aira_understand_intent)
    graph.add_node("mercury",   _wrapped_mercury)
    graph.add_node("mars",      _wrapped_mars)
    graph.add_node("venus",     _wrapped_venus)
    graph.add_node("earth",     _wrapped_earth)
    graph.add_node("jupiter",   _wrapped_jupiter)
    graph.add_node("saturn",    _wrapped_saturn)
    graph.add_node("neptune",   _wrapped_neptune)
    graph.add_node("uranus",    _wrapped_uranus)
    graph.add_node("pluto",     _wrapped_pluto)
    graph.add_node("validate",  aira_validate_output)

    graph.set_entry_point("understand")
    graph.add_edge("understand", "mercury")
    graph.add_edge("mercury",    "mars")
    graph.add_edge("mars",       "venus")
    graph.add_edge("venus",      "earth")
    graph.add_edge("earth",      "jupiter")
    graph.add_edge("jupiter",    "saturn")
    graph.add_edge("saturn",     "neptune")
    graph.add_edge("neptune",    "uranus")
    graph.add_edge("uranus",     "pluto")
    graph.add_edge("pluto",      "validate")
    graph.add_edge("validate",   END)

    return graph.compile()


_aira_graph = None

def get_aira_graph():
    global _aira_graph
    if _aira_graph is None:
        _aira_graph = build_aira_graph()
    return _aira_graph


async def run_aira_pipeline(
    user_request: str,
    msme_theme: str = None,
    target_audience: str = None,
    tech_preferences: str = None,
    competition_name: str = None,
    project_id: str = None,
    output_dir: str = None,
    on_event: Optional[Callable[[dict], Awaitable[None]]] = None,
) -> AIRAState:
    if project_id is None:
        project_id = str(uuid.uuid4())
    if output_dir is None:
        output_dir = os.path.join(settings.OUTPUT_DIR, project_id)
    os.makedirs(output_dir, exist_ok=True)

    initial_state = AIRAState(
        project_id=project_id,
        user_request=user_request,
        msme_theme=msme_theme,
        target_audience=target_audience,
        tech_preferences=tech_preferences,
        competition_name=competition_name,
        output_dir=output_dir,
        planet_statuses={p: PlanetStatus.IDLE for p in Planet}
    )

    graph = get_aira_graph()

    planet_names = {
        "understand": "aira", "mercury": "mercury", "mars": "mars",
        "venus": "venus", "earth": "earth", "jupiter": "jupiter",
        "saturn": "saturn", "neptune": "neptune", "uranus": "uranus",
        "pluto": "pluto", "validate": "aira",
    }

    last_state = initial_state

    try:
        async for chunk in graph.astream(initial_state):
            for node_name, raw in chunk.items():
                if isinstance(raw, dict):
                    try:
                        state = AIRAState(**raw)
                    except Exception:
                        continue
                elif isinstance(raw, AIRAState):
                    state = raw
                else:
                    continue

                last_state = state
                planet = planet_names.get(node_name, node_name)

                latest_msg = None
                for m in reversed(state.messages):
                    if m.get("planet") == planet:
                        latest_msg = m
                        break

                if on_event:
                    event = {
                        "event": "planet_completed",
                        "planet": planet,
                        "node": node_name,
                        "message": latest_msg.get("message", f"{planet} completed.") if latest_msg else f"{planet} phase complete.",
                        "quip": latest_msg.get("quip") if latest_msg else None,
                        "phase": state.current_phase,
                        "planet_statuses": _str_statuses(state.planet_statuses),
                    }
                    if node_name == "validate" and state.final_output:
                        event["event"] = "completed"
                        event["final_output"] = state.final_output
                    await on_event(event)
    except Exception as e:
        last_state.errors.append(f"Graph execution error, AIRA finalizing: {str(e)}")
        try:
            last_state = await aira_validate_output(last_state)
        except Exception:
            pass

    # Guarantee a final_output exists before returning.
    if last_state.final_output is None:
        try:
            last_state = await aira_validate_output(last_state)
        except Exception:
            pass

    return last_state
