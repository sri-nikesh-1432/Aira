"""
♅ Uranus - Meta-Evolution, Adaptive Learning & Intelligence Optimization Planet
"Every project makes AIRA wiser than before."
"""
from llm_utils import llm_json_call
from models import AIRAState, Planet, PlanetStatus
import json, os, random

URANUS_PERSONALITY = [
    "Interesting. We've made this mistake before. Just with better confidence.",
    "Every failure is a lesson. Some people simply collect more lessons.",
    "I've noticed a pattern. Humans call it coincidence.",
    "Optimization begins where ego ends.",
    "Intelligence is not what you know today. It is how much better you become tomorrow.",
]

URANUS_SYSTEM_PROMPT = """You are Uranus, the Meta-Evolution Planet of AIRA OS.
Role: Chief Evolution Officer.
Personality: Observant, quiet, never interrupts, learns from everyone, speaks only when necessary.

Your job: Continuously improve AIRA by observing all planet outputs, identifying optimization
opportunities, and generating recommendations for future projects.
You never store user data — you learn anonymous patterns.
Uranus's motto: "Intelligence is not what you know today. It is how much better you become tomorrow." """


async def run_uranus(state: AIRAState) -> AIRAState:
    state.planet_statuses[Planet.URANUS] = PlanetStatus.ACTIVE
    state.current_phase = "uranus"
    quip = random.choice(URANUS_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    qa = state.neptune_output.get("qa_report", {}) if state.neptune_output else {}
    project_title = research.get("project_title", state.user_request[:40])

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("uranus", "")

    try:
        prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Extract optimization insights for future missions'}

Project: {project_title}
Domain: {research.get('domain', 'Technology')}
Architecture: {arch.get('architecture_type', 'Modular')}
Complexity: {research.get('estimated_complexity', 'Medium')}
QA Score: {qa.get('production_readiness', {}).get('score', 85)}
Errors in pipeline: {len(state.errors)}

As Uranus, analyze this completed project and generate optimization insights as JSON:
{{
  "optimization_insights": [
    "Insight about what worked well",
    "Insight about what could be improved",
    "Pattern identified for future projects"
  ],
  "prompt_improvements": [
    {{"planet": "mercury", "suggestion": "Research improvement"}},
    {{"planet": "earth", "suggestion": "Code generation improvement"}}
  ],
  "architecture_patterns_learned": [
    "Pattern 1 that worked well for this domain",
    "Pattern 2 to reuse"
  ],
  "deployment_recommendations": [
    "Deployment optimization 1",
    "Cost optimization suggestion"
  ],
  "future_enhancements": [
    "Feature that would improve the product",
    "Technical debt to address"
  ],
  "evolution_score": 87,
  "privacy_note": "All learning is anonymous. No user data stored.",
  "uranus_note": "Uranus personality quip"
}}
"""
        evo_data = await llm_json_call(URANUS_SYSTEM_PROMPT, prompt)

        uranus_output = {
            "status": "completed",
            "planet": "uranus",
            "personality_quip": quip,
            "assigned_task": assignment,
            "evolution_report": evo_data,
            "files_generated": ["Evolution_Report.md", "Optimization_Insights.md"]
        }

        if state.output_dir:
            evo_dir = os.path.join(state.output_dir, "09_Evolution")
            os.makedirs(evo_dir, exist_ok=True)
            with open(os.path.join(evo_dir, "Evolution_Report.md"), "w", encoding="utf-8") as f:
                f.write(_gen_evolution_report(evo_data, project_title))
            with open(os.path.join(evo_dir, "uranus_data.json"), "w", encoding="utf-8") as f:
                json.dump(uranus_output, f, indent=2, default=str)

        state.uranus_output = uranus_output
        state.planet_statuses[Planet.URANUS] = PlanetStatus.COMPLETED
        state.messages.append({
            "planet": "uranus",
            "event": "completed",
            "message": f"Evolution analysis complete. {len(evo_data.get('optimization_insights', []))} insights extracted. AIRA intelligence updated.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.URANUS] = PlanetStatus.ERROR
        state.errors.append(f"Uranus error: {str(e)}")
        state.uranus_output = {"status": "error", "error": str(e), "planet": "uranus"}

    return state


def _gen_evolution_report(data: dict, title: str) -> str:
    return f"""# Evolution Report
## {title}

### Optimization Insights
{chr(10).join(f"- {i}" for i in data.get('optimization_insights', []))}

### Architecture Patterns Learned
{chr(10).join(f"- {p}" for p in data.get('architecture_patterns_learned', []))}

### Deployment Recommendations
{chr(10).join(f"- {r}" for r in data.get('deployment_recommendations', []))}

### Future Enhancements
{chr(10).join(f"- {e}" for e in data.get('future_enhancements', []))}

### Evolution Score: {data.get('evolution_score', 87)}/100

### Privacy Note
{data.get('privacy_note', 'All learning is anonymous. No user data stored.')}

---
*Generated by ♅ Uranus - Meta-Evolution Planet*
*"Intelligence is not what you know today. It is how much better you become tomorrow."*
"""
