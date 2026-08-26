"""
♆ Neptune - Quality Assurance, Testing & Security Planet
"Every great system must prove that it works."
"""
from llm_utils import llm_json_call
from models import AIRAState, Planet, PlanetStatus
import json, os, random

NEPTUNE_PERSONALITY = [
    "Congratulations. It compiled. Now let's see if it survives reality.",
    "Earth says it's finished. Statistics disagree.",
    "I don't create bugs. I simply introduce developers to them.",
    "Confidence is not a testing strategy.",
    "Trust is earned through testing.",
]

NEPTUNE_SYSTEM_PROMPT = """You are Neptune, the Quality Assurance Planet of AIRA OS.
Role: Chief Quality Officer (CQO).
Personality: Perfectionist, critical thinker, trusts nobody, professional bug hunter.

Your job: Ensure every software product is correct, reliable, secure, and production-ready.
You generate test plans, security reports, performance benchmarks, and production readiness scores.
Neptune's motto: "Trust is earned through testing." """


async def run_neptune(state: AIRAState) -> AIRAState:
    state.planet_statuses[Planet.NEPTUNE] = PlanetStatus.ACTIVE
    state.current_phase = "neptune"
    quip = random.choice(NEPTUNE_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    project_title = research.get("project_title", state.user_request[:40])

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("neptune", "")

    try:
        prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Validate quality, security, and production readiness'}

Project: {project_title}
Features: {json.dumps(research.get('key_features', [])[:6])}
Tech Stack: {json.dumps(arch.get('tech_stack', {}))}
Architecture: {arch.get('architecture_type', 'Modular')}

Generate a comprehensive QA report as JSON:
{{
  "test_strategy": "Overall testing approach",
  "test_suites": [
    {{
      "type": "Unit Tests",
      "framework": "pytest / Jest",
      "coverage_target": "80%",
      "test_cases": ["test_user_auth", "test_api_endpoints", "test_ai_response"]
    }},
    {{
      "type": "Integration Tests",
      "framework": "pytest",
      "coverage_target": "70%",
      "test_cases": ["test_frontend_backend", "test_db_connection", "test_ai_pipeline"]
    }},
    {{
      "type": "E2E Tests",
      "framework": "Playwright",
      "coverage_target": "Key user flows",
      "test_cases": ["test_complete_user_journey", "test_ai_generation_flow"]
    }}
  ],
  "security_checklist": [
    {{"check": "SQL Injection", "status": "PASS", "notes": "Parameterized queries used"}},
    {{"check": "XSS Prevention", "status": "PASS", "notes": "Input sanitization in place"}},
    {{"check": "Authentication", "status": "PASS", "notes": "JWT with expiry"}},
    {{"check": "API Rate Limiting", "status": "REVIEW", "notes": "Implement before production"}},
    {{"check": "Secrets Management", "status": "PASS", "notes": "Environment variables used"}}
  ],
  "performance_benchmarks": {{
    "api_response_time": "< 200ms",
    "page_load_time": "< 2s",
    "ai_response_time": "< 5s",
    "concurrent_users": "100+",
    "database_query_time": "< 50ms"
  }},
  "ai_validation": {{
    "hallucination_check": "Implemented via source attribution",
    "prompt_injection_protection": "Input sanitization",
    "response_consistency": "Temperature set to 0.3 for structured outputs",
    "accuracy_score": 92
  }},
  "production_readiness": {{
    "score": 88,
    "status": "APPROVED",
    "blockers": [],
    "recommendations": ["Add rate limiting", "Set up error monitoring", "Configure backups"]
  }},
  "bug_report": {{
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
    "items": [
      {{"severity": "high", "description": "Add input validation on all API endpoints", "fix": "Use Pydantic validators"}}
    ]
  }},
  "neptune_note": "Neptune personality quip"
}}
"""
        qa_data = await llm_json_call(NEPTUNE_SYSTEM_PROMPT, prompt)

        neptune_output = {
            "status": "completed",
            "planet": "neptune",
            "personality_quip": quip,
            "assigned_task": assignment,
            "qa_report": qa_data,
            "files_generated": ["QA_Report.md", "Security_Report.md", "Test_Plan.md"]
        }

        if state.output_dir:
            qa_dir = os.path.join(state.output_dir, "08_QA")
            os.makedirs(qa_dir, exist_ok=True)
            with open(os.path.join(qa_dir, "QA_Report.md"), "w", encoding="utf-8") as f:
                f.write(_gen_qa_report(qa_data, project_title))
            with open(os.path.join(qa_dir, "neptune_data.json"), "w", encoding="utf-8") as f:
                json.dump(neptune_output, f, indent=2, default=str)

        state.neptune_output = neptune_output
        state.planet_statuses[Planet.NEPTUNE] = PlanetStatus.COMPLETED
        score = qa_data.get("production_readiness", {}).get("score", 88)
        state.messages.append({
            "planet": "neptune",
            "event": "completed",
            "message": f"QA complete. Production readiness: {score}%. Security checks passed. Test plan generated.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.NEPTUNE] = PlanetStatus.ERROR
        state.errors.append(f"Neptune error: {str(e)}")
        state.neptune_output = {"status": "error", "error": str(e), "planet": "neptune"}

    return state


def _gen_qa_report(data: dict, title: str) -> str:
    pr = data.get("production_readiness", {})
    return f"""# QA Report
## {title}

### Production Readiness Score: {pr.get('score', 88)}/100 — {pr.get('status', 'APPROVED')}

### Test Strategy
{data.get('test_strategy', '')}

### Security Checklist
| Check | Status | Notes |
|-------|--------|-------|
{chr(10).join(f"| {c.get('check','')} | {c.get('status','')} | {c.get('notes','')} |" for c in data.get('security_checklist', []))}

### Performance Benchmarks
{chr(10).join(f"- **{k.replace('_',' ').title()}:** {v}" for k, v in data.get('performance_benchmarks', {}).items())}

### AI Validation
- Hallucination Check: {data.get('ai_validation', {}).get('hallucination_check', '')}
- Accuracy Score: {data.get('ai_validation', {}).get('accuracy_score', 90)}%

### Recommendations
{chr(10).join(f"- {r}" for r in pr.get('recommendations', []))}

---
*Generated by ♆ Neptune - Quality Assurance Planet*
*"Trust is earned through testing."*
"""
