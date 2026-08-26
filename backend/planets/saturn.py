"""
♄ Saturn - Documentation, Knowledge & Communication Planet
"If it isn't documented, it doesn't exist."
"""
from llm_utils import llm_json_call, llm_call
from models import AIRAState, Planet, PlanetStatus
import json, os, random

SATURN_PERSONALITY = [
    "Allow me to explain... Without the 600-page version.",
    "If you understood it immediately... I probably oversimplified it.",
    "Documentation exists because memory is unreliable. Especially after deadlines.",
    "Knowledge becomes useful only when it is understood.",
    "If it isn't documented, it doesn't exist.",
]

SATURN_SYSTEM_PROMPT = """You are Saturn, the Documentation Planet of AIRA OS.
Role: Chief Documentation Officer (CDO).
Personality: Patient, teacher, explains everything, never gets frustrated.

Your job: Transform complex technical systems into clear, professional documentation.
You generate README files, technical reports, API docs, user manuals, judge preparation guides,
and professional presentations for every stakeholder.
Saturn's motto: "Knowledge creates innovation. Documentation preserves it." """


async def run_saturn(state: AIRAState) -> AIRAState:
    state.planet_statuses[Planet.SATURN] = PlanetStatus.ACTIVE
    state.current_phase = "saturn"
    quip = random.choice(SATURN_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    biz = state.jupiter_output.get("business_strategy", {}) if state.jupiter_output else {}
    project_title = research.get("project_title", state.user_request[:40])

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("saturn", "")

    try:
        prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Write the technical report and judge preparation'}

Project: {project_title}
Description: {state.user_request}
Domain: {research.get('domain', 'Technology')}
Key Features: {json.dumps(research.get('key_features', [])[:6])}
Tech Stack: {json.dumps(arch.get('tech_stack', {}))}
Business Model: {biz.get('business_model', 'SaaS')}
MSME Theme: {state.msme_theme or 'Innovation'}
Competition: {state.competition_name or 'MSME Hackathon'}

Generate documentation package as JSON:
{{
  "executive_summary": "2-3 paragraph project summary for judges/investors",
  "technical_overview": "Technical architecture overview",
  "key_innovations": ["innovation 1", "innovation 2", "innovation 3"],
  "judge_preparation": {{
    "round_1_questions": ["Q1", "Q2", "Q3"],
    "round_2_questions": ["Q1", "Q2", "Q3"],
    "technical_questions": ["Q1", "Q2"],
    "business_questions": ["Q1", "Q2"],
    "suggested_answers": {{
      "what_problem": "Answer about problem",
      "why_unique": "Answer about uniqueness",
      "business_model": "Answer about revenue",
      "scalability": "Answer about scaling"
    }}
  }},
  "presentation_outline": [
    {{"slide": 1, "title": "Problem Statement", "content": "Key points"}},
    {{"slide": 2, "title": "Solution", "content": "Key points"}},
    {{"slide": 3, "title": "Technology", "content": "Key points"}},
    {{"slide": 4, "title": "Business Model", "content": "Key points"}},
    {{"slide": 5, "title": "Market Opportunity", "content": "Key points"}},
    {{"slide": 6, "title": "Demo", "content": "Key points"}},
    {{"slide": 7, "title": "Team & Roadmap", "content": "Key points"}}
  ],
  "msme_compliance_notes": ["compliance point 1", "compliance point 2"],
  "saturn_note": "Saturn personality quip"
}}
"""
        doc_data = await llm_json_call(SATURN_SYSTEM_PROMPT, prompt)

        saturn_output = {
            "status": "completed",
            "planet": "saturn",
            "personality_quip": quip,
            "assigned_task": assignment,
            "documentation": doc_data,
            "files_generated": ["Technical_Report.md", "Judge_Preparation.md", "Presentation_Outline.md"]
        }

        if state.output_dir:
            doc_dir = os.path.join(state.output_dir, "07_Documentation")
            os.makedirs(doc_dir, exist_ok=True)
            with open(os.path.join(doc_dir, "Technical_Report.md"), "w", encoding="utf-8") as f:
                f.write(_gen_technical_report(doc_data, project_title, research, arch))
            with open(os.path.join(doc_dir, "Judge_Preparation.md"), "w", encoding="utf-8") as f:
                f.write(_gen_judge_prep(doc_data, project_title))
            with open(os.path.join(doc_dir, "saturn_data.json"), "w", encoding="utf-8") as f:
                json.dump(saturn_output, f, indent=2, default=str)

        state.saturn_output = saturn_output
        state.planet_statuses[Planet.SATURN] = PlanetStatus.COMPLETED
        state.messages.append({
            "planet": "saturn",
            "event": "completed",
            "message": f"Documentation complete. Generated technical report, judge preparation guide, and presentation outline for {project_title}.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.SATURN] = PlanetStatus.ERROR
        state.errors.append(f"Saturn error: {str(e)}")
        state.saturn_output = {"status": "error", "error": str(e), "planet": "saturn"}

    return state


def _gen_technical_report(data: dict, title: str, research: dict, arch: dict) -> str:
    return f"""# Technical Report
## {title}

### Executive Summary
{data.get('executive_summary', '')}

### Technical Overview
{data.get('technical_overview', '')}

### Key Innovations
{chr(10).join(f"- {i}" for i in data.get('key_innovations', []))}

### Architecture
- **Type:** {arch.get('architecture_type', 'Modular')}
- **Frontend:** {arch.get('tech_stack', {}).get('frontend', {}).get('framework', 'Next.js')}
- **Backend:** {arch.get('tech_stack', {}).get('backend', {}).get('framework', 'FastAPI')}
- **AI/LLM:** {arch.get('tech_stack', {}).get('ai', {}).get('llm', 'Google Gemini')}

### MSME Compliance
{chr(10).join(f"- {c}" for c in data.get('msme_compliance_notes', []))}

---
*Generated by ♄ Saturn - Documentation Planet*
"""


def _gen_judge_prep(data: dict, title: str) -> str:
    jp = data.get("judge_preparation", {})
    sa = jp.get("suggested_answers", {})
    return f"""# Judge Preparation Guide
## {title}

### Round 1 Questions
{chr(10).join(f"{i+1}. {q}" for i, q in enumerate(jp.get('round_1_questions', [])))}

### Round 2 Questions
{chr(10).join(f"{i+1}. {q}" for i, q in enumerate(jp.get('round_2_questions', [])))}

### Technical Questions
{chr(10).join(f"{i+1}. {q}" for i, q in enumerate(jp.get('technical_questions', [])))}

### Business Questions
{chr(10).join(f"{i+1}. {q}" for i, q in enumerate(jp.get('business_questions', [])))}

### Suggested Answers

**What problem does this solve?**
{sa.get('what_problem', '')}

**Why is this unique?**
{sa.get('why_unique', '')}

**What is the business model?**
{sa.get('business_model', '')}

**How does it scale?**
{sa.get('scalability', '')}

---
*Generated by ♄ Saturn - Documentation Planet*
*"If it isn't documented, it doesn't exist."*
"""
