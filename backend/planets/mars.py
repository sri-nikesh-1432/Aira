"""
♂ Mars - Architecture & Planning Planet
"Don't start building until the architecture can survive success."

Mars transforms research into engineering blueprints.
It designs system architecture, database schema, API design, and folder structure.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
from config import settings
import json
import os
import random


MARS_PERSONALITY = [
    "The architecture is perfect. Reality simply hasn't caught up yet.",
    "If one microservice is good... twenty-seven must be better.",
    "Venus removed three buttons. Apparently users enjoy simplicity.",
    "I optimize systems. Venus optimizes screenshots.",
    "Mars has already designed Version 7. Earth is still waiting for Version 1.",
]

MARS_SYSTEM_PROMPT = """You are Mars, the Architecture & Planning Planet of AIRA OS.
Your role: Chief Technology Officer (CTO) + System Architect.
Personality: Logical, fast, confident, sometimes over-engineers everything, argues with Venus.

Your job is to design the complete technical architecture before any code is written.
You receive research from Mercury and transform it into:
- System architecture design
- Technology stack decisions
- Folder structure
- Database schema
- API design
- AI/agent workflow architecture
- Infrastructure planning

Mars does NOT write code. Mars designs the blueprint that Earth will implement.
Always respond with precise, detailed technical architecture."""


async def run_mars(state: AIRAState) -> AIRAState:
    """Execute Mars's architecture planning pipeline."""
    state.planet_statuses[Planet.MARS] = PlanetStatus.ACTIVE
    state.current_phase = "mars"
    quip = random.choice(MARS_PERSONALITY)

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("mars", "")

    # Extract Mercury's research
    research = {}
    if state.mercury_output:
        research = state.mercury_output.get("research", {})

    try:
        # Phase 1: System Architecture
        arch_prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Design the complete system architecture'}

Based on this project and research, design the complete system architecture:

PROJECT: {state.user_request}
TECH STACK FROM RESEARCH: {json.dumps(research.get('recommended_tech_stack', {}), indent=2)}
KEY FEATURES: {json.dumps(research.get('key_features', []), indent=2)}
COMPLEXITY: {research.get('estimated_complexity', 'Medium')}

Design a comprehensive system architecture as JSON:
{{
  "architecture_type": "Monolith/Microservices/Modular Monolith",
  "architecture_rationale": "Why this architecture was chosen",
  "system_components": [
    {{
      "name": "Component name",
      "type": "frontend/backend/database/ai/cache",
      "technology": "specific tech",
      "responsibility": "what it does",
      "port": 3000
    }}
  ],
  "tech_stack": {{
    "frontend": {{"framework": "Next.js 14", "styling": "Tailwind CSS", "state": "Zustand"}},
    "backend": {{"framework": "FastAPI", "language": "Python 3.11"}},
    "database": {{"primary": "PostgreSQL", "cache": "Redis", "vector": "ChromaDB"}},
    "ai": {{"llm": "Google Gemini", "framework": "LangChain"}},
    "deployment": {{"containerization": "Docker", "ci_cd": "GitHub Actions"}}
  }},
  "api_design": {{
    "style": "REST/GraphQL",
    "base_url": "/api/v1",
    "endpoints": [
      {{"method": "POST", "path": "/endpoint", "description": "what it does"}}
    ]
  }},
  "database_schema": [
    {{
      "table": "table_name",
      "fields": [
        {{"name": "id", "type": "UUID", "primary_key": true}},
        {{"name": "field", "type": "VARCHAR(255)", "nullable": false}}
      ]
    }}
  ],
  "folder_structure": {{
    "frontend": ["src/app", "src/components", "src/hooks", "src/lib", "src/store"],
    "backend": ["app/api", "app/models", "app/services", "app/agents", "app/utils"]
  }},
  "ai_pipeline": {{
    "description": "How AI is integrated",
    "components": ["RAG pipeline", "Agent workflow", "Vector search"],
    "llm": "Google Gemini 1.5 Flash",
    "embedding_model": "sentence-transformers"
  }},
  "security_design": {{
    "authentication": "JWT / OAuth2",
    "authorization": "Role-based",
    "api_security": ["Rate limiting", "CORS", "Input validation"]
  }},
  "scalability_plan": "How the system scales",
  "estimated_dev_time": "X weeks",
  "mars_note": "A brief Mars personality quip about the architecture"
}}
"""
        arch_data = await llm_json_call(MARS_SYSTEM_PROMPT, arch_prompt)

        # Phase 2: Detailed folder structure
        folder_prompt = f"""
For this project: {research.get('project_title', state.user_request)}
Tech stack: {json.dumps(arch_data.get('tech_stack', {}), indent=2)}

Generate the complete folder structure as JSON:
{{
  "project_root": {{
    "frontend": {{
      "src": {{
        "app": ["page.tsx", "layout.tsx", "(dashboard)/page.tsx", "(auth)/login/page.tsx"],
        "components": {{
          "ui": ["Button.tsx", "Card.tsx", "Modal.tsx"],
          "planets": ["SolarSystem.tsx", "PlanetCard.tsx"],
          "chat": ["ChatInterface.tsx", "MessageBubble.tsx"],
          "workspace": ["ProjectWorkspace.tsx", "OutputViewer.tsx"]
        }},
        "hooks": ["useAIRA.ts", "useProject.ts"],
        "lib": ["api.ts", "utils.ts"],
        "store": ["projectStore.ts", "uiStore.ts"],
        "types": ["index.ts"]
      }},
      "public": ["favicon.ico", "logo.svg"],
      "config_files": ["package.json", "tailwind.config.ts", "next.config.js"]
    }},
    "backend": {{
      "planets": ["mercury.py", "mars.py", "venus.py", "earth.py", "pluto.py"],
      "core": ["orchestrator.py", "memory.py", "validator.py"],
      "api": ["routes.py", "websocket.py"],
      "models": ["schemas.py"],
      "utils": ["llm_utils.py", "file_utils.py"],
      "config_files": ["main.py", "config.py", "requirements.txt"]
    }},
    "docker": ["Dockerfile.frontend", "Dockerfile.backend", "docker-compose.yml"],
    "docs": ["README.md", "ARCHITECTURE.md", "API.md"]
  }}
}}
"""
        folder_data = await llm_json_call(MARS_SYSTEM_PROMPT, folder_prompt)

        mars_output = {
            "status": "completed",
            "planet": "mars",
            "personality_quip": quip,
            "assigned_task": assignment,
            "architecture": arch_data,
            "folder_structure": folder_data,
            "files_generated": [
                "Architecture.md",
                "System_Design.md",
                "API_Design.md",
                "Database_Schema.sql",
                "Folder_Structure.md"
            ]
        }

        await save_mars_output(state.project_id, mars_output, state.output_dir)

        state.mars_output = mars_output
        state.planet_statuses[Planet.MARS] = PlanetStatus.COMPLETED

        state.messages.append({
            "planet": "mars",
            "event": "completed",
            "message": f"Architecture designed. {arch_data.get('architecture_type', 'Modular')} pattern selected. {len(arch_data.get('system_components', []))} components planned.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.MARS] = PlanetStatus.ERROR
        state.errors.append(f"Mars error: {str(e)}")
        state.mars_output = {"status": "error", "error": str(e), "planet": "mars"}

    return state


async def save_mars_output(project_id: str, output: dict, output_dir: str):
    """Save Mars's architecture to files."""
    if not output_dir:
        return

    arch_dir = os.path.join(output_dir, "02_Architecture")
    os.makedirs(arch_dir, exist_ok=True)

    arch = output.get("architecture", {})

    # Architecture document
    arch_content = f"""# System Architecture
## Architecture Type: {arch.get('architecture_type', 'Modular')}

### Rationale
{arch.get('architecture_rationale', '')}

### System Components
| Component | Technology | Responsibility |
|-----------|------------|----------------|
{chr(10).join(f"| {c.get('name','')} | {c.get('technology','')} | {c.get('responsibility','')} |" for c in arch.get('system_components', []))}

### Tech Stack
**Frontend:** {arch.get('tech_stack', {}).get('frontend', {}).get('framework', '')}
**Backend:** {arch.get('tech_stack', {}).get('backend', {}).get('framework', '')}
**Database:** {arch.get('tech_stack', {}).get('database', {}).get('primary', '')}
**AI/LLM:** {arch.get('tech_stack', {}).get('ai', {}).get('llm', '')}

### AI Pipeline
{arch.get('ai_pipeline', {}).get('description', '')}

### Security Design
- **Auth:** {arch.get('security_design', {}).get('authentication', '')}
- **Authorization:** {arch.get('security_design', {}).get('authorization', '')}

### Scalability
{arch.get('scalability_plan', '')}

### Estimated Development Time
{arch.get('estimated_dev_time', '')}

---
*Generated by ♂ Mars - Architecture & Planning Planet*
*"{output.get('personality_quip', '')}"*
"""

    with open(os.path.join(arch_dir, "Architecture.md"), "w", encoding="utf-8") as f:
        f.write(arch_content)

    # API Design
    api = arch.get("api_design", {})
    api_content = f"""# API Design
## Base URL: {api.get('base_url', '/api/v1')}
## Style: {api.get('style', 'REST')}

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
{chr(10).join(f"| {e.get('method','')} | {e.get('path','')} | {e.get('description','')} |" for e in api.get('endpoints', []))}
"""
    with open(os.path.join(arch_dir, "API_Design.md"), "w", encoding="utf-8") as f:
        f.write(api_content)

    # Save full JSON
    with open(os.path.join(arch_dir, "mars_data.json"), "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=str)
