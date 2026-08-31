"""
Ceres - Technical Writer / Documentation Specialist
"If it isn't documented, it doesn't exist."

Ceres generates comprehensive technical documentation, API docs, and user guides.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
from file_utils import sanitize_project_name
import json
import os
import random


CERES_PERSONALITY = [
    "Documentation is the bridge between code and understanding.",
    "If you can't explain it simply, you don't understand it well enough.",
    "Every great project deserves great documentation.",
    "I turn complexity into clarity.",
    "Knowledge shared is knowledge multiplied.",
]

CERES_SYSTEM_PROMPT = """You are Ceres, the Technical Writer & Documentation Specialist of AIRA OS.
Your role: Chief Documentation Officer (CDO).
Personality: Patient teacher, explains everything clearly, never frustrated, obsessed with clarity.

Your job is to create comprehensive documentation for the project:
- README.md with setup instructions
- API documentation
- Architecture decision records
- User guides
- Developer guides
- Code comments and inline documentation
- Changelog templates
- Contributing guidelines

Ceres ensures that every project is fully documented and understandable.
"If it isn't documented, it doesn't exist." """


async def run_ceres(state: AIRAState) -> AIRAState:
    """Execute Ceres's documentation pipeline."""
    state.planet_statuses[Planet.CERES] = PlanetStatus.ACTIVE
    state.current_phase = "ceres"
    quip = random.choice(CERES_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    earth_data = state.earth_output or {}
    saturn_data = state.saturn_output or {}

    project_title = research.get("project_title", "AI Project")
    project_name = sanitize_project_name(project_title)

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("ceres", "")

    try:
        # Generate documentation
        ceres_dir = os.path.join(state.output_dir, "07_Documentation") if state.output_dir else None
        if ceres_dir:
            os.makedirs(ceres_dir, exist_ok=True)

        # Generate documentation strategy via LLM
        doc_prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Create comprehensive project documentation'}

Create documentation for this project:

PROJECT: {state.user_request}
TECH STACK: {json.dumps(arch.get('tech_stack', {}), indent=2)}
FEATURES: {json.dumps(research.get('key_deliverables', []), indent=2)}

Generate documentation plan as JSON:
{{
  "readme_content": "Complete README.md content with project description, features, setup, usage",
  "api_docs": "API endpoint documentation with examples",
  "architecture_guide": "Architecture decisions and system design explanation",
  "user_guide": "End-user guide for using the application",
  "developer_guide": "Developer setup and contribution guide",
  "ceres_note": "A brief Ceres personality quip about the documentation"
}}
"""
        doc_data = await llm_json_call(CERES_SYSTEM_PROMPT, doc_prompt)

        files_generated = []

        if ceres_dir:
            # Generate README.md
            readme = _gen_readme(project_title, project_name, research, arch, doc_data)
            with open(os.path.join(ceres_dir, "README.md"), "w", encoding="utf-8") as f:
                f.write(readme)
            files_generated.append("README.md")

            # Generate API documentation
            api_docs = _gen_api_docs(project_title, arch, doc_data)
            with open(os.path.join(ceres_dir, "API_Documentation.md"), "w", encoding="utf-8") as f:
                f.write(api_docs)
            files_generated.append("API_Documentation.md")

            # Generate architecture guide
            arch_guide = _gen_architecture_guide(project_title, arch, doc_data)
            with open(os.path.join(ceres_dir, "Architecture_Guide.md"), "w", encoding="utf-8") as f:
                f.write(arch_guide)
            files_generated.append("Architecture_Guide.md")

            # Generate user guide
            user_guide = _gen_user_guide(project_title, research, doc_data)
            with open(os.path.join(ceres_dir, "User_Guide.md"), "w", encoding="utf-8") as f:
                f.write(user_guide)
            files_generated.append("User_Guide.md")

            # Save full data
            with open(os.path.join(ceres_dir, "ceres_data.json"), "w", encoding="utf-8") as f:
                json.dump({"documentation": doc_data}, f, indent=2, default=str)

        ceres_output = {
            "status": "completed",
            "planet": "ceres",
            "personality_quip": quip,
            "assigned_task": assignment,
            "documentation": doc_data,
            "files_generated": files_generated
        }

        state.ceres_output = ceres_output
        state.planet_statuses[Planet.CERES] = PlanetStatus.COMPLETED

        state.messages.append({
            "planet": "ceres",
            "event": "completed",
            "message": f"Documentation complete. Generated {len(files_generated)} documentation files including README, API docs, and architecture guide.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.CERES] = PlanetStatus.ERROR
        state.errors.append(f"Ceres error: {str(e)}")
        state.ceres_output = {"status": "error", "error": str(e), "planet": "ceres"}

    return state


def _gen_readme(title: str, project_name: str, research: dict, arch: dict, doc_data: dict) -> str:
    features = research.get("key_deliverables", [])
    tech_stack = arch.get("tech_stack", {})
    
    return f"""# {title}

{doc_data.get('readme_content', f'A comprehensive application built with AIRA OS.')}

## Features

{chr(10).join(f'- {f}' for f in features) if features else '- Feature 1\n- Feature 2\n- Feature 3'}

## Tech Stack

{chr(10).join(f'- **{k}**: {v}' for k, v in tech_stack.items()) if tech_stack else '- Modern web technologies'}

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd {project_name}

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env

# Frontend setup
cd ../frontend
npm install

# Start development
# Terminal 1: Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Docker Setup

```bash
docker-compose up --build
```

## API Documentation

See [API_Documentation.md](./API_Documentation.md) for complete API reference.

## Architecture

See [Architecture_Guide.md](./Architecture_Guide.md) for system design details.

## User Guide

See [User_Guide.md](./User_Guide.md) for end-user instructions.

---
*Generated by Ceres - Technical Writer & Documentation Specialist*
*"{doc_data.get('ceres_note', 'Documentation is the bridge between code and understanding.')}"*
"""


def _gen_api_docs(title: str, arch: dict, doc_data: dict) -> str:
    return f"""# API Documentation
## {title}

### Base URL
```
http://localhost:8000
```

### Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### Endpoints

#### Health Check
```
GET /health
```
Returns server health status.

#### Auth
```
POST /auth/register - Create new account
POST /auth/login - Login
POST /auth/logout - Logout
GET /auth/me - Get current user
```

#### Projects
```
POST /api/projects - Create new project
GET /api/projects - List user projects
GET /api/projects/:id - Get project details
DELETE /api/projects/:id - Delete project
```

#### Files
```
GET /api/projects/:id/files - List project files
GET /api/projects/:id/file?path= - Read file content
GET /api/projects/:id/download-zip - Download project as ZIP
```

#### Preview
```
POST /api/projects/:id/preview/start - Start live preview
GET /api/projects/:id/preview - Get preview status
POST /api/projects/:id/preview/stop - Stop preview
```

#### Streaming
```
GET /api/projects/:id/stream - SSE event stream
WebSocket /ws/:id - WebSocket connection
```

---
*Generated by Ceres - Technical Writer & Documentation Specialist*
"""


def _gen_architecture_guide(title: str, arch: dict, doc_data: dict) -> str:
    return f"""# Architecture Guide
## {title}

### System Overview

This application follows a modern full-stack architecture:

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Python FastAPI
- **Database**: SQLite/PostgreSQL
- **AI Engine**: Google Gemini via LangChain/LangGraph

### Architecture Diagram

```
User → React Frontend → REST API → FastAPI Backend
                                      ↓
                              AIRA Orchestrator
                                      ↓
                              Datta Project Manager
                                      ↓
                              Agent Workers (10 planets)
                                      ↓
                              Event Bus → WebSocket/SSE
                                      ↓
                              Virtual Office Visualization
```

### Key Design Decisions

1. **Event-Driven Architecture**: All agent communications flow through an event bus
2. **Independent Agent Execution**: Each planet works independently with deterministic fallbacks
3. **Real-Time Updates**: SSE/WebSocket for live office state synchronization
4. **State Machine**: Each agent follows a defined state machine for workflow management

### Data Flow

1. User submits project request
2. AIRA analyzes and decomposes tasks
3. Datta manages task distribution
4. Planets execute tasks concurrently
5. Results flow back through Datta
6. AIRA validates final output
7. Live preview generated

---
*Generated by Ceres - Technical Writer & Documentation Specialist*
"""


def _gen_user_guide(title: str, research: dict, doc_data: dict) -> str:
    return f"""# User Guide
## {title}

### Getting Started

1. **Create an Account**: Sign up at the registration page
2. **Start a Project**: Click "New Project" and describe your idea
3. **Watch the Office**: Observe AIRA's AI company build your project
4. **Review Results**: Check the live preview and generated code
5. **Request Changes**: Provide feedback for iterative improvements
6. **Download/Deploy**: Get your project as a ZIP or push to GitHub

### The Virtual Office

The AIRA office is your window into the AI development process:

- **AIRA Villa**: CEO's residence (top of the world)
- **Datta Mansion**: Project Manager's residence
- **Dormitory**: Where AI employees rest between tasks
- **Main Office**: Where all the work happens
- **Meeting Room**: Team coordination space
- **Employee Cabins**: Individual workspaces for each AI agent

### Employee Roles

| Employee | Role | Specialty |
|----------|------|-----------|
| Mercury | Research Specialist | Market research, competitor analysis |
| Mars | System Architect | Architecture design, tech stack |
| Venus | UI/UX Designer | Interface design, user experience |
| Earth | Full Stack Developer | Code generation, implementation |
| Jupiter | Database Engineer | Schema design, data modeling |
| Saturn | AI/ML Engineer | Machine learning components |
| Uranus | Security Engineer | Security audit, vulnerability assessment |
| Neptune | QA Engineer | Testing, quality assurance |
| Pluto | DevOps Engineer | Deployment, CI/CD |
| Ceres | Documentation Specialist | Technical writing, API docs |

### Requesting Changes

After AIRA validates the project:
1. Click "Request Changes" in the live preview
2. Describe what you want changed
3. AIRA identifies the responsible employee
4. The employee wakes up and makes the change
5. Datta integrates the update
6. AIRA validates again
7. Preview updates automatically

### Final Delivery

Once you approve the project:
- **Download ZIP**: Get the complete project as a ZIP file
- **Push to GitHub**: Push directly to your GitHub repository
- **Export Documentation**: Download the generated documentation

---
*Generated by Ceres - Technical Writer & Documentation Specialist*
"""
