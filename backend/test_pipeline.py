"""Ad-hoc pipeline test: runs the full AIRA pipeline with NO API key
to prove that AIRA always completes (deterministic fallback path)."""
import asyncio, json, os, sys

os.environ["GEMINI_API_KEY"] = "invalid-test-key"  # force no-LLM path
sys.path.insert(0, os.path.dirname(__file__))

from core.orchestrator import run_aira_pipeline


async def main():
    events = []

    async def on_event(event: dict):
        payload = json.dumps(event, default=str)  # mirror main.py exactly
        events.append(json.loads(payload))

    state = await run_aira_pipeline(
        user_request="Build an AI Healthcare Assistant for rural clinics with voice support",
        msme_theme="Healthcare & MedTech",
        target_audience="Rural clinics, MSME hospitals",
        tech_preferences=None,
        competition_name="MSME Innovation Challenge 2026",
        project_id="test-no-key",
        output_dir=os.path.join(os.path.dirname(__file__), "outputs", "test-no-key"),
        on_event=on_event,
    )

    print("=== FINAL STATE ===")
    print("errors:", len(state.errors))
    for e in state.errors[:6]:
        print("  ERR:", e[:160])
    statuses = {k.value if hasattr(k, "value") else k: v.value if hasattr(v, "value") else v
                for k, v in state.planet_statuses.items()}
    print("planet statuses:", statuses)
    all_completed = all(v == "completed" for k, v in statuses.items() if k != "aira")
    print("ALL 9 PLANETS COMPLETED:", all_completed)
    for p in ["mercury", "mars", "venus", "earth", "jupiter", "saturn", "neptune", "uranus", "pluto"]:
        out = getattr(state, f"{p}_output") or {}
        print(f"  {p}: status={out.get('status')} fallback={out.get('fallback','none')}")
    print("final_output set:", state.final_output is not None)
    if state.final_output:
        print("  project_title:", state.final_output.get("project_title"))
        print("  quality_score:", state.final_output.get("validation", {}).get("quality_score"))
        print("  planets_completed:", state.final_output.get("validation", {}).get("planets_completed"))
    print("events emitted:", len(events))
    print("last event:", events[-1]["event"] if events else None)
    # verify no enum keys leaked into any event
    bad = [e for e in events if any("Planet." in str(k) for k in (e.get("planet_statuses") or {}).keys())]
    print("events with enum keys:", len(bad))

    out_dir = os.path.join(os.path.dirname(__file__), "outputs", "test-no-key")
    n_files = 0
    for root, _, files in os.walk(out_dir):
        n_files += len(files)
    print("files generated:", n_files)


asyncio.run(main())
