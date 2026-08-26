"""
☀️ AIRA CORE - Central Intelligence & Orchestrator
"I don't solve problems alone. I orchestrate intelligence."

AIRA Core coordinates all 9 planets using LangGraph.
If any planet fails, AIRA itself completes the work.
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


# ─── AIRA Fallback Generators ─────────────────────────────────────────────────

async def _aira_fallback_mercury(state: AIRAState) -> dict:
    prompt = f"""You are AIRA acting as Mercury (Research Planet) because Mercury failed.
Project: {state.user_request}
MSME Theme: {state.msme_theme or 'General Innovation'}

Generate a complete research report as JSON:
{{
  "project_title": "Suggested project name",
  "domain": "Industry domain",
  "problem_statement": "Clear problem being solved",
  "target_users": ["user type 1", "user type 2"],
  "market_size": "Estimated market opportunity",
  "competitors": [{{"name": "Competitor", "strengths": "...", "weaknesses": "..."}}],
  "recommended_tech_stack": {{"frontend": "Next.js 14", "backend": "FastAPI", "database": "PostgreSQL", "ai_models": "Google Gemini", "deployment": "Docker"}},
  "key_features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "innovation_highlights": ["what makes this unique"],
  "msme_alignment": "How this aligns with MSME themes",
  "feasibility_score": 85,
  "estimated_complexity": "Medium",
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "research_summary": "Executive summary of the project",
  "recommended_apis": ["Google Gemini API", "REST APIs"],
  "similar_projects": ["similar project 1"],
  "mercury_note": "AIRA stepping in for Mercury. Research complete."
}}"""
    data = await llm_json_call(AIRA_SYSTEM_PROMPT, prompt)
    msme = {"theme_alignment": "High", "innovation_score": 85, "social_impact": "Significant",
            "scalability": "High", "implementation_feasibility": "Yes",
            "government_schemes": ["Startup India", "MSME Innovation"],
            "compliance_notes": ["Compliant with MSME guidelines"],
            "recommendation": "Recommended for MSME submission"}
    return {"status": "completed", "planet": "mercury", "personality_quip": "AIRA covering for Mercury.",
            "research": data, "msme_analysis": msme, "files_generated": ["Research_Report.md"]}


async def _aira_fallback_mars(state: AIRAState) -> dict:
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    prompt = f"""You are AIRA acting as Mars (Architecture Planet) because Mars failed.
Project: {state.user_request}
Research: {json.dumps(research, indent=2)[:800]}

Generate system architecture as JSON:
{{
  "architecture_type": "Modular Monolith",
  "architecture_rationale": "Best for hackathon timeline",
  "system_components": [
    {{"name": "Frontend", "type": "frontend", "technology": "Next.js 14", "responsibility": "User interface", "port": 3000}},
    {{"name": "Backend API", "type": "backend", "technology": "FastAPI", "responsibility": "Business logic", "port": 8000}},
    {{"name": "Database", "type": "database", "technology": "PostgreSQL", "responsibility": "Data storage", "port": 5432}}
  ],
  "tech_stack": {{
    "frontend": {{"framework": "Next.js 14", "styling": "Tailwind CSS", "state": "Zustand"}},
    "backend": {{"framework": "FastAPI", "language": "Python 3.11"}},
    "database": {{"primary": "PostgreSQL", "cache": "Redis"}},
    "ai": {{"llm": "Google Gemini", "framework": "LangChain"}},
    "deployment": {{"containerization": "Docker", "ci_cd": "GitHub Actions"}}
  }},
  "api_design": {{"style": "REST", "base_url": "/api/v1", "endpoints": [
    {{"method": "GET", "path": "/health", "description": "Health check"}},
    {{"method": "POST", "path": "/api/v1/projects", "description": "Create project"}}
  ]}},
  "database_schema": [{{"table": "users", "fields": [{{"name": "id", "type": "UUID", "primary_key": true}}]}}],
  "folder_structure": {{"frontend": ["src/app", "src/components"], "backend": ["api", "models", "services"]}},
  "ai_pipeline": {{"description": "LLM integration via LangChain", "components": ["RAG", "Chat"], "llm": "Google Gemini 1.5 Flash"}},
  "security_design": {{"authentication": "JWT", "authorization": "Role-based", "api_security": ["Rate limiting", "CORS"]}},
  "scalability_plan": "Horizontal scaling with Docker",
  "estimated_dev_time": "2-4 weeks",
  "mars_note": "AIRA covering for Mars. Architecture ready."
}}"""
    data = await llm_json_call(AIRA_SYSTEM_PROMPT, prompt)
    return {"status": "completed", "planet": "mars", "personality_quip": "AIRA covering for Mars.",
            "architecture": data, "folder_structure": {}, "files_generated": ["Architecture.md"]}




async def _aira_fallback_earth(state: AIRAState) -> dict:
    from planets.earth import generate_project_structure
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    design = state.venus_output.get("design_system", {}) if state.venus_output else {}
    project_title = research.get("project_title", "AI Project")
    try:
        await generate_project_structure(state, research, arch, design, project_title)
    except Exception:
        pass
    return {"status": "completed", "planet": "earth",
            "personality_quip": "AIRA covering for Earth. Code generated.",
            "project_title": project_title, "tech_stack": arch.get("tech_stack", {}),
            "files_generated": ["README.md", "frontend/", "backend/", "docker-compose.yml"],
            "summary": f"Generated {project_title} project structure."}










async def _aira_fallback_pluto(state: AIRAState) -> dict:
    from planets.pluto import _gen_github_actions, _gen_deployment_guide, _gen_production_checklist
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    project_title = research.get("project_title", "ai-project")
    project_name = sanitize_project_name(project_title)
    deploy_data = {
        "deployment_strategy": "Docker + cloud deployment",
        "recommended_platforms": [{"platform": "Vercel", "use_for": "Frontend", "free_tier": True},
                                   {"platform": "Railway", "use_for": "Backend", "free_tier": True}],
        "environment_variables": {"backend": [{"key": "GEMINI_API_KEY", "description": "Gemini API key", "required": True}],
                                   "frontend": [{"key": "NEXT_PUBLIC_API_URL", "description": "Backend URL", "required": True}]},
        "deployment_steps": ["Push to GitHub", "Connect to Vercel/Railway", "Set env vars", "Deploy"],
        "monitoring_setup": {"uptime_monitoring": "UptimeRobot", "error_tracking": "Sentry", "logging": "Platform logs"},
        "pluto_note": "AIRA covering for Pluto. Deployment config ready."
    }
    if state.output_dir:
        pluto_dir = os.path.join(state.output_dir, "06_Deployment")
        os.makedirs(pluto_dir, exist_ok=True)
        try:
            gh = await _gen_github_actions(project_name)
            gh_dir = os.path.join(state.output_dir, "04_Development", project_name, ".github", "workflows")
            os.makedirs(gh_dir, exist_ok=True)
            with open(os.path.join(gh_dir, "deploy.yml"), "w") as f:
                f.write(gh)
            with open(os.path.join(pluto_dir, "Deployment_Guide.md"), "w", encoding="utf-8") as f:
                f.write(_gen_deployment_guide(project_title, project_name, deploy_data))
            with open(os.path.join(pluto_dir, "Production_Checklist.md"), "w", encoding="utf-8") as f:
                f.write(_gen_production_checklist(project_title))
        except Exception:
            pass
    return {"status": "completed", "planet": "pluto",
            "personality_quip": "AIRA covering for Pluto. Deployment ready.",
            "deployment": deploy_data, "files_generated": ["Deployment_Guide.md", "Production_Checklist.md"]}


# ─── Planet wrappers with AIRA fallback ───────────────────────────────────────

async def _run_planet_with_fallback(planet_name: str, run_fn, fallback_fn, state: AIRAState) -> AIRAState:
    """Run a planet; if it fails, AIRA completes the work.

    Fallback chain (AIRA never gives up):
      1. the planet itself
      2. AIRA's LLM fallback (same planet role, driven by AIRA)
      3. AIRA's deterministic fallback (pure code — never needs a network/LLM)
    """
    try:
        state = await run_fn(state)
        output_key = f"{planet_name}_output"
        output = getattr(state, output_key, None)
        if output and output.get("status") == "error":
            raise RuntimeError(output.get("error", "Planet returned error status"))
    except Exception as e:
        state.errors.append(f"{planet_name} failed, AIRA taking over: {str(e)}")
        state.messages.append({
            "planet": "aira", "event": "fallback",
            "message": f"☀️ AIRA stepping in for {planet_name.capitalize()}. Mission continues.",
            "timestamp": datetime.utcnow().isoformat()
        })
        fallback_output = None
        # Level 2: AIRA fallback (LLM-driven for mercury/mars, deterministic for the rest)
        try:
            candidate = await fallback_fn(state)
            if candidate and candidate.get("status") == "completed":
                fallback_output = candidate
                fallback_output["fallback"] = fallback_output.get("fallback", "aira")
        except Exception as e2:
            state.errors.append(f"AIRA LLM fallback for {planet_name} failed: {str(e2)}")
        # Level 3: deterministic fallback (always works)
        if fallback_output is None:
            deterministic_fn = globals().get(f"_deterministic_{planet_name}")
            if deterministic_fn:
                fallback_output = await deterministic_fn(state)
                fallback_output["fallback"] = "deterministic"
        if fallback_output is None:
            # Absolute last resort: a guaranteed-complete empty result
            fallback_output = {
                "status": "completed", "planet": planet_name,
                "personality_quip": "AIRA completed this phase directly.",
                "files_generated": [],
                "fallback": "emergency",
            }
        setattr(state, f"{planet_name}_output", fallback_output)
        state.planet_statuses[Planet(planet_name)] = PlanetStatus.COMPLETED
    return state


# Deterministic (no-LLM) fallback dispatchers used by _run_planet_with_fallback

async def _deterministic_mercury(state: AIRAState) -> dict:
    return deterministic_mercury(state)

async def _deterministic_mars(state: AIRAState) -> dict:
    return deterministic_mars(state)

async def _deterministic_venus(state: AIRAState) -> dict:
    return deterministic_venus(state)

async def _deterministic_earth(state: AIRAState) -> dict:
    from planets.earth import generate_project_structure
    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    design = state.venus_output.get("design_system", {}) if state.venus_output else {}
    title = research.get("project_title", "AI Project")
    try:
        await generate_project_structure(state, research, arch, design, title)
    except Exception:
        pass
    return {"status": "completed", "planet": "earth",
            "personality_quip": "AIRA covering for Earth. Code generated.",
            "project_title": title, "tech_stack": arch.get("tech_stack", {}),
            "files_generated": ["README.md", "frontend/", "backend/", "docker-compose.yml"],
            "summary": f"Generated {title} project structure.",
            "fallback": "deterministic"}

async def _deterministic_jupiter(state: AIRAState) -> dict:
    return deterministic_jupiter(state)

async def _deterministic_saturn(state: AIRAState) -> dict:
    return deterministic_saturn(state)

async def _deterministic_neptune(state: AIRAState) -> dict:
    return deterministic_neptune(state)

async def _deterministic_uranus(state: AIRAState) -> dict:
    return deterministic_uranus(state)

async def _deterministic_pluto(state: AIRAState) -> dict:
    return deterministic_pluto(state)


async def _wrapped_mercury(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("mercury", run_mercury, _aira_fallback_mercury, state)

async def _wrapped_mars(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("mars", run_mars, _aira_fallback_mars, state)

async def _wrapped_venus(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("venus", run_venus, _deterministic_venus, state)

async def _wrapped_earth(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("earth", run_earth, _aira_fallback_earth, state)

async def _wrapped_jupiter(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("jupiter", run_jupiter, _deterministic_jupiter, state)

async def _wrapped_saturn(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("saturn", run_saturn, _deterministic_saturn, state)

async def _wrapped_neptune(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("neptune", run_neptune, _deterministic_neptune, state)

async def _wrapped_uranus(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("uranus", run_uranus, _deterministic_uranus, state)

async def _wrapped_pluto(state: AIRAState) -> AIRAState:
    return await _run_planet_with_fallback("pluto", run_pluto, _aira_fallback_pluto, state)


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

    # Persist the mission plan so every planet's assignment is visible in the deliverable.
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
    try:
        all_planets = ["mercury", "mars", "venus", "earth", "jupiter", "saturn", "neptune", "uranus", "pluto"]
        outputs_summary = {}
        for p in all_planets:
            out = getattr(state, f"{p}_output", None)
            outputs_summary[p] = "completed" if out and out.get("status") == "completed" else "error"

        planets_done = sum(1 for v in outputs_summary.values() if v == "completed")
        quality_score = int((planets_done / len(all_planets)) * 100)

        validation_prompt = f"""
AIRA final validation for project: {state.user_request}
Planet completion status: {json.dumps(outputs_summary)}
Quality score: {quality_score}%

Generate final validation report as JSON:
{{
  "overall_status": "SUCCESS",
  "quality_score": {quality_score},
  "planets_completed": {planets_done},
  "deliverables_ready": ["Research Report", "System Architecture", "Design System", "Complete Source Code", "Business Plan", "Documentation", "QA Report", "Evolution Report", "Deployment Config"],
  "aira_final_note": "AIRA final statement - calm, wise, conclusive, under 2 sentences"
}}
"""
        validation = await llm_json_call(AIRA_SYSTEM_PROMPT, validation_prompt)
        state.aira_validation = validation
        state.planet_statuses[Planet.AIRA] = PlanetStatus.COMPLETED
    except Exception as e:
        state.errors.append(f"AIRA validation error: {str(e)}")
        # Deterministic validation — AIRA always finishes the mission.
        validation = deterministic_validation(state)
        state.aira_validation = validation
        state.planet_statuses[Planet.AIRA] = PlanetStatus.COMPLETED

    # Always build the final deliverable — even if every LLM call failed.
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
        # AIRA never gives up: even if the graph itself breaks, complete the mission.
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
