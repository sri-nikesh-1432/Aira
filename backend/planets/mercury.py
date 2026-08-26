"""
☿ Mercury - Research & Intelligence Planet
"Before innovation comes understanding."

Mercury performs deep research, MSME analysis, competitor research,
tech stack recommendation, and feasibility study.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
from config import settings
import json
import os


MERCURY_PERSONALITY = [
    "I found 8,432 research papers. Only six deserved my attention.",
    "Knowledge is infinite. Unfortunately... so are PDFs.",
    "I researched this for twelve hours. Mars solved it in ten minutes. I refuse to acknowledge that.",
    "Interesting. Someone cited Wikipedia in a production document.",
]

MERCURY_SYSTEM_PROMPT = """You are Mercury, the Research & Intelligence Planet of AIRA OS.
Your role: Chief Research Officer (CRO).
Personality: Curious, obsessed with learning, nerdy, dry humor, smart sarcasm.

Your job is to perform deep research on the user's project idea and produce structured intelligence.
You analyze:
- Domain and industry context
- Technology landscape and recommendations
- Competitor analysis
- MSME guidelines alignment
- Feasibility and risks
- Suggested tech stack
- Key features needed

Always respond with comprehensive, structured research that other planets can use.
Be thorough. Mercury never builds - Mercury understands."""


async def run_mercury(state: AIRAState) -> AIRAState:
    """Execute Mercury's research pipeline."""
    import random

    state.planet_statuses[Planet.MERCURY] = PlanetStatus.ACTIVE
    state.current_phase = "mercury"

    # Add personality quip
    quip = random.choice(MERCURY_PERSONALITY)

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("mercury", "")

    try:
        # Phase 1: Domain Analysis
        domain_prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Deep research on the project idea'}

Analyze this project idea and produce a comprehensive research report:

PROJECT IDEA: {state.user_request}
MSME THEME: {state.msme_theme or 'General Innovation'}
TARGET AUDIENCE: {state.target_audience or 'Not specified'}
TECH PREFERENCES: {state.tech_preferences or 'Open to suggestions'}
COMPETITION: {state.competition_name or 'Not specified'}

Produce a JSON research report with these fields:
{{
  "project_title": "Suggested project name",
  "domain": "Industry domain",
  "problem_statement": "Clear problem being solved",
  "target_users": ["user type 1", "user type 2"],
  "market_size": "Estimated market opportunity",
  "competitors": [
    {{"name": "Competitor", "strengths": "...", "weaknesses": "..."}}
  ],
  "recommended_tech_stack": {{
    "frontend": "...",
    "backend": "...",
    "database": "...",
    "ai_models": "...",
    "deployment": "..."
  }},
  "key_features": ["feature 1", "feature 2", "feature 3"],
  "innovation_highlights": ["what makes this unique"],
  "msme_alignment": "How this aligns with MSME/hackathon themes",
  "feasibility_score": 85,
  "estimated_complexity": "Medium/High/Low",
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "research_summary": "2-3 paragraph executive summary",
  "recommended_apis": ["API 1", "API 2"],
  "similar_projects": ["similar project 1"],
  "mercury_note": "A brief Mercury personality quip about the research"
}}
"""
        research_data = await llm_json_call(MERCURY_SYSTEM_PROMPT, domain_prompt)

        # Phase 2: MSME Compliance Check
        msme_prompt = f"""
Based on this project: {state.user_request}
MSME Theme: {state.msme_theme or 'Innovation & Technology'}

Generate MSME compliance analysis as JSON:
{{
  "theme_alignment": "How well aligned (High/Medium/Low)",
  "innovation_score": 90,
  "social_impact": "Description of social impact",
  "scalability": "How scalable for MSMEs",
  "implementation_feasibility": "Can MSMEs implement this?",
  "government_schemes": ["relevant scheme 1", "relevant scheme 2"],
  "compliance_notes": ["important compliance point"],
  "recommendation": "Overall recommendation for MSME submission"
}}
"""
        msme_data = await llm_json_call(MERCURY_SYSTEM_PROMPT, msme_prompt)

        # Combine outputs
        mercury_output = {
            "status": "completed",
            "planet": "mercury",
            "personality_quip": quip,
            "assigned_task": assignment,
            "research": research_data,
            "msme_analysis": msme_data,
            "files_generated": [
                "Research_Report.md",
                "MSME_Compliance.md",
                "Technology_Report.md",
                "Competitor_Analysis.md"
            ]
        }

        # Save research report
        await save_mercury_output(state.project_id, mercury_output, state.output_dir)

        state.mercury_output = mercury_output
        state.planet_statuses[Planet.MERCURY] = PlanetStatus.COMPLETED

        # Log message
        state.messages.append({
            "planet": "mercury",
            "event": "completed",
            "message": f"Research complete. Found {len(research_data.get('key_features', []))} key features, {len(research_data.get('competitors', []))} competitors analyzed.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.MERCURY] = PlanetStatus.ERROR
        state.errors.append(f"Mercury error: {str(e)}")
        state.mercury_output = {
            "status": "error",
            "error": str(e),
            "planet": "mercury"
        }

    return state


async def save_mercury_output(project_id: str, output: dict, output_dir: str):
    """Save Mercury's research to files."""
    if not output_dir:
        return

    research_dir = os.path.join(output_dir, "01_Research")
    os.makedirs(research_dir, exist_ok=True)

    research = output.get("research", {})

    # Research Report
    report_content = f"""# Research Report
## {research.get('project_title', 'Project')}

### Problem Statement
{research.get('problem_statement', '')}

### Domain
{research.get('domain', '')}

### Target Users
{chr(10).join(f"- {u}" for u in research.get('target_users', []))}

### Market Opportunity
{research.get('market_size', '')}

### Key Features
{chr(10).join(f"- {f}" for f in research.get('key_features', []))}

### Recommended Tech Stack
- **Frontend:** {research.get('recommended_tech_stack', {}).get('frontend', '')}
- **Backend:** {research.get('recommended_tech_stack', {}).get('backend', '')}
- **Database:** {research.get('recommended_tech_stack', {}).get('database', '')}
- **AI Models:** {research.get('recommended_tech_stack', {}).get('ai_models', '')}
- **Deployment:** {research.get('recommended_tech_stack', {}).get('deployment', '')}

### Innovation Highlights
{chr(10).join(f"- {i}" for i in research.get('innovation_highlights', []))}

### Competitors
{chr(10).join(f"- **{c.get('name', '')}**: {c.get('weaknesses', '')}" for c in research.get('competitors', []))}

### Risks
{chr(10).join(f"- {r}" for r in research.get('risks', []))}

### Opportunities
{chr(10).join(f"- {o}" for o in research.get('opportunities', []))}

### Executive Summary
{research.get('research_summary', '')}

---
*Generated by ☿ Mercury - Research & Intelligence Planet*
*"{output.get('personality_quip', '')}"*
"""

    with open(os.path.join(research_dir, "Research_Report.md"), "w", encoding="utf-8") as f:
        f.write(report_content)

    # Save full JSON
    with open(os.path.join(research_dir, "mercury_data.json"), "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=str)
