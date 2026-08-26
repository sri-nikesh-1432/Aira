"""
♃ Jupiter - Business Strategy, Market Intelligence & Entrepreneurship Planet
"Innovation creates products. Business creates impact."
"""
from llm_utils import llm_json_call
from models import AIRAState, Planet, PlanetStatus
import json, os, random

JUPITER_PERSONALITY = [
    "Can we solve the problem? Better question... Can we solve it globally?",
    "Every feature is an investment. Some simply have terrible returns.",
    "Revenue is a feature too.",
    "Mars built the engine. Venus built the experience. Now let's build a company.",
    "A great invention changes technology. A great business changes the world.",
]

JUPITER_SYSTEM_PROMPT = """You are Jupiter, the Business Strategy Planet of AIRA OS.
Role: Chief Business Officer (CBO).
Personality: Visionary, strategic, always thinking long-term, everything becomes a startup.

Your job: Transform technically feasible projects into commercially viable businesses.
You analyze market demand, customer segments, pricing models, financial projections,
competition, startup risks, and long-term growth strategies.
Jupiter's motto: "Innovation creates products. Business creates impact." """


async def run_jupiter(state: AIRAState) -> AIRAState:
    state.planet_statuses[Planet.JUPITER] = PlanetStatus.ACTIVE
    state.current_phase = "jupiter"
    quip = random.choice(JUPITER_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("jupiter", "")

    try:
        prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Define the business model and market strategy'}

Project: {state.user_request}
Domain: {research.get('domain', 'Technology')}
Target Users: {json.dumps(research.get('target_users', []))}
Competitors: {json.dumps(research.get('competitors', [])[:3])}
Tech Stack: {json.dumps(arch.get('tech_stack', {}))}
MSME Theme: {state.msme_theme or 'General Innovation'}

Generate a complete business strategy as JSON:
{{
  "business_model": "SaaS/Freemium/Marketplace/etc",
  "target_market": "Primary market description",
  "customer_segments": ["segment 1", "segment 2", "segment 3"],
  "value_proposition": "Core value delivered",
  "revenue_streams": [
    {{"stream": "Subscription", "pricing": "₹999/month", "target": "SMBs"}},
    {{"stream": "Enterprise", "pricing": "Custom", "target": "Large orgs"}}
  ],
  "pricing_strategy": {{
    "free_tier": "What's free",
    "starter": "₹999/month - features",
    "professional": "₹4999/month - features",
    "enterprise": "Custom pricing"
  }},
  "market_size": {{
    "tam": "Total Addressable Market",
    "sam": "Serviceable Addressable Market",
    "som": "Serviceable Obtainable Market"
  }},
  "financial_projections": {{
    "year_1_revenue": "₹X lakhs",
    "year_3_revenue": "₹X crores",
    "break_even": "Month X",
    "initial_investment": "₹X lakhs"
  }},
  "go_to_market": {{
    "phase_1": "Launch strategy",
    "phase_2": "Growth strategy",
    "phase_3": "Scale strategy"
  }},
  "competitive_advantage": ["advantage 1", "advantage 2"],
  "risks": [
    {{"risk": "Risk description", "mitigation": "How to handle it"}}
  ],
  "msme_opportunity": {{
    "eligible_schemes": ["Startup India", "MSME Innovation Fund"],
    "government_support": "Available support",
    "funding_potential": "₹X lakhs"
  }},
  "startup_score": 82,
  "investment_ready": true,
  "jupiter_note": "Jupiter personality quip about the business"
}}
"""
        biz_data = await llm_json_call(JUPITER_SYSTEM_PROMPT, prompt)

        jupiter_output = {
            "status": "completed",
            "planet": "jupiter",
            "personality_quip": quip,
            "assigned_task": assignment,
            "business_strategy": biz_data,
            "files_generated": ["Business_Plan.md", "Revenue_Model.md", "Market_Analysis.md"]
        }

        if state.output_dir:
            biz_dir = os.path.join(state.output_dir, "05_Business")
            os.makedirs(biz_dir, exist_ok=True)
            with open(os.path.join(biz_dir, "Business_Plan.md"), "w", encoding="utf-8") as f:
                f.write(_gen_business_plan(biz_data, state.user_request))
            with open(os.path.join(biz_dir, "jupiter_data.json"), "w", encoding="utf-8") as f:
                json.dump(jupiter_output, f, indent=2, default=str)

        state.jupiter_output = jupiter_output
        state.planet_statuses[Planet.JUPITER] = PlanetStatus.COMPLETED
        state.messages.append({
            "planet": "jupiter",
            "event": "completed",
            "message": f"Business strategy complete. Model: {biz_data.get('business_model', 'SaaS')}. Startup score: {biz_data.get('startup_score', 80)}/100.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.JUPITER] = PlanetStatus.ERROR
        state.errors.append(f"Jupiter error: {str(e)}")
        state.jupiter_output = {"status": "error", "error": str(e), "planet": "jupiter"}

    return state


def _gen_business_plan(data: dict, project: str) -> str:
    return f"""# Business Plan
## {project}

### Business Model
{data.get('business_model', 'SaaS')}

### Value Proposition
{data.get('value_proposition', '')}

### Target Market
{data.get('target_market', '')}

### Customer Segments
{chr(10).join(f"- {s}" for s in data.get('customer_segments', []))}

### Revenue Streams
{chr(10).join(f"- **{r.get('stream','')}**: {r.get('pricing','')} — {r.get('target','')}" for r in data.get('revenue_streams', []))}

### Financial Projections
- Year 1: {data.get('financial_projections', {}).get('year_1_revenue', 'TBD')}
- Year 3: {data.get('financial_projections', {}).get('year_3_revenue', 'TBD')}
- Break-even: {data.get('financial_projections', {}).get('break_even', 'TBD')}

### MSME Opportunity
{data.get('msme_opportunity', {}).get('government_support', '')}
Eligible Schemes: {', '.join(data.get('msme_opportunity', {}).get('eligible_schemes', []))}

### Startup Score: {data.get('startup_score', 80)}/100

---
*Generated by ♃ Jupiter - Business Strategy Planet*
*"{data.get('jupiter_note', 'Every feature is an investment.')}"*
"""
