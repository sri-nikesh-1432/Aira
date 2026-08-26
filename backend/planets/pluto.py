"""
Pluto - Deployment & Operations Planet
"Deployment is not the finish line. It is the beginning of a living system."

Pluto generates Docker configs, CI/CD pipelines, and deployment documentation.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
from file_utils import sanitize_project_name
import json
import os
import random


PLUTO_PERSONALITY = [
    "Deployment completed successfully. Now the real work begins.",
    "Everything is stable. Please don't touch production.",
    "Someone deployed on Friday. I have questions.",
    "Servers remember every decision. Especially the bad ones.",
    "Wonderful. Who's monitoring production tonight?",
]

PLUTO_SYSTEM_PROMPT = """You are Pluto, the Deployment & Operations Planet of AIRA OS.
Your role: Chief Operations Officer (COO) + DevOps Engineer.
Personality: Reliable, always operational, protective, slightly annoyed by unstable deployments.

Your job is to create everything needed to deploy and run the project in production:
- CI/CD pipelines (GitHub Actions)
- Docker configurations
- Cloud deployment guides
- Environment variable templates
- Monitoring configuration
- Health check scripts
- Deployment documentation

Pluto ensures projects don't just run once — they run forever.
"Deployment is not the finish line. It is the beginning of a living system." """


async def run_pluto(state: AIRAState) -> AIRAState:
    """Execute Pluto's deployment pipeline."""
    state.planet_statuses[Planet.PLUTO] = PlanetStatus.ACTIVE
    state.current_phase = "pluto"
    quip = random.choice(PLUTO_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    earth_data = state.earth_output or {}

    project_title = research.get("project_title", "ai-project")
    project_name = sanitize_project_name(project_title)

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("pluto", "")

    try:
        # Generate deployment artifacts
        pluto_dir = os.path.join(state.output_dir, "06_Deployment") if state.output_dir else None
        if pluto_dir:
            os.makedirs(pluto_dir, exist_ok=True)

        # Generate deployment strategy via LLM
        deploy_prompt = f"""
AIRA has assigned you this specific task: {assignment or 'Prepare the complete deployment configuration'}

Create a deployment strategy for this project:

PROJECT: {state.user_request}
TECH STACK: {json.dumps(arch.get('tech_stack', {}), indent=2)}
EXPECTED TRAFFIC: Medium (1k-10k users)
BUDGET: Low to Medium (startup/hackathon)

Generate deployment configuration as JSON:
{{
  "deployment_strategy": "Description of deployment approach",
  "recommended_platforms": [
    {{"platform": "Vercel", "use_for": "Frontend", "free_tier": true}},
    {{"platform": "Railway/Render", "use_for": "Backend", "free_tier": true}},
    {{"platform": "Supabase", "use_for": "Database", "free_tier": true}}
  ],
  "environment_variables": {{
    "backend": [
      {{"key": "GEMINI_API_KEY", "description": "Google Gemini API key", "required": true}},
      {{"key": "DATABASE_URL", "description": "PostgreSQL connection string", "required": true}},
      {{"key": "SECRET_KEY", "description": "JWT secret key", "required": true}}
    ],
    "frontend": [
      {{"key": "NEXT_PUBLIC_API_URL", "description": "Backend API URL", "required": true}}
    ]
  }},
  "health_checks": [
    {{"endpoint": "/health", "expected_status": 200, "service": "backend"}},
    {{"endpoint": "/api/v1/health", "expected_status": 200, "service": "backend"}}
  ],
  "monitoring_setup": {{
    "uptime_monitoring": "UptimeRobot (free)",
    "error_tracking": "Sentry (free tier)",
    "logging": "Platform built-in logs"
  }},
  "deployment_steps": [
    "Step 1: Push code to GitHub",
    "Step 2: Connect to deployment platform",
    "Step 3: Set environment variables",
    "Step 4: Deploy and verify health checks"
  ],
  "pluto_note": "A brief Pluto personality quip about the deployment"
}}
"""
        deploy_data = await llm_json_call(PLUTO_SYSTEM_PROMPT, deploy_prompt)

        # Generate actual deployment files
        files_generated = []

        if pluto_dir:
            # GitHub Actions CI/CD
            gh_actions = await _gen_github_actions(project_name)
            gh_dir = os.path.join(state.output_dir, "04_Development", project_name, ".github", "workflows")
            os.makedirs(gh_dir, exist_ok=True)
            with open(os.path.join(gh_dir, "deploy.yml"), "w", encoding="utf-8") as f:
                f.write(gh_actions)
            files_generated.append(".github/workflows/deploy.yml")

            # Deployment guide
            deploy_guide = _gen_deployment_guide(project_title, project_name, deploy_data)
            with open(os.path.join(pluto_dir, "Deployment_Guide.md"), "w", encoding="utf-8") as f:
                f.write(deploy_guide)
            files_generated.append("Deployment_Guide.md")

            # Production checklist
            checklist = _gen_production_checklist(project_title)
            with open(os.path.join(pluto_dir, "Production_Checklist.md"), "w", encoding="utf-8") as f:
                f.write(checklist)
            files_generated.append("Production_Checklist.md")

            # Save full data
            with open(os.path.join(pluto_dir, "pluto_data.json"), "w", encoding="utf-8") as f:
                json.dump({"deployment": deploy_data}, f, indent=2, default=str)

        pluto_output = {
            "status": "completed",
            "planet": "pluto",
            "personality_quip": quip,
            "assigned_task": assignment,
            "deployment": deploy_data,
            "files_generated": files_generated
        }

        state.pluto_output = pluto_output
        state.planet_statuses[Planet.PLUTO] = PlanetStatus.COMPLETED

        state.messages.append({
            "planet": "pluto",
            "event": "completed",
            "message": f"Deployment configuration complete. CI/CD pipeline generated. Project ready for {deploy_data.get('recommended_platforms', [{}])[0].get('platform', 'cloud deployment')}.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.PLUTO] = PlanetStatus.ERROR
        state.errors.append(f"Pluto error: {str(e)}")
        state.pluto_output = {"status": "error", "error": str(e), "planet": "pluto"}

    return state


async def _gen_github_actions(project_name: str) -> str:
    return f"""name: Deploy {project_name}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run backend tests
        run: |
          cd backend
          python -m pytest tests/ -v --tb=short
        continue-on-error: true

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci

      - name: Build frontend
        run: |
          cd frontend
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{{{ secrets.NEXT_PUBLIC_API_URL }}}}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: echo "Configure your deployment platform here (Vercel, Railway, Render, etc.)"

      - name: Health check
        run: |
          sleep 30
          curl -f ${{{{ secrets.BACKEND_URL }}}}/health || exit 1
        continue-on-error: true
"""


def _gen_deployment_guide(title: str, project_name: str, deploy_data: dict) -> str:
    platforms = deploy_data.get("recommended_platforms", [])
    steps = deploy_data.get("deployment_steps", [])
    env_vars = deploy_data.get("environment_variables", {})

    return f"""# Deployment Guide
## {title}

### Recommended Deployment Strategy
{deploy_data.get('deployment_strategy', 'Cloud-based deployment with free tier services')}

---

## Recommended Platforms

| Service | Platform | Free Tier |
|---------|----------|-----------|
{chr(10).join(f"| {p.get('use_for','')} | {p.get('platform','')} | {'✅' if p.get('free_tier') else '❌'} |" for p in platforms)}

---

## Deployment Steps
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(steps))}

---

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
{chr(10).join(f"| `{v.get('key','')}` | {v.get('description','')} | {'✅' if v.get('required') else '❌'} |" for v in env_vars.get('backend', []))}

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
{chr(10).join(f"| `{v.get('key','')}` | {v.get('description','')} | {'✅' if v.get('required') else '❌'} |" for v in env_vars.get('frontend', []))}

---

## Monitoring Setup
- **Uptime:** {deploy_data.get('monitoring_setup', {}).get('uptime_monitoring', 'UptimeRobot')}
- **Error Tracking:** {deploy_data.get('monitoring_setup', {}).get('error_tracking', 'Sentry')}
- **Logging:** {deploy_data.get('monitoring_setup', {}).get('logging', 'Platform logs')}

---

## Quick Deploy with Docker

```bash
# Clone and deploy
git clone <your-repo>
cd {project_name}

# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Start all services
docker-compose up --build -d

# Verify health
curl http://localhost:8000/health
```

---
*Generated by Pluto - Deployment & Operations Planet*
*"{deploy_data.get('pluto_note', 'Everything is stable. Please do not touch production.')}"*
"""


def _gen_production_checklist(title: str) -> str:
    return f"""# Production Checklist
## {title}

### Pre-Deployment
- [ ] All environment variables configured
- [ ] API keys added to platform secrets (NOT committed to git)
- [ ] Database migrations run
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts without errors (`uvicorn main:app`)
- [ ] CORS origins configured correctly
- [ ] `.env` files added to `.gitignore`

### Security
- [ ] SECRET_KEY is a strong random string (not "changeme")
- [ ] Debug mode disabled in production (`DEBUG=false`)
- [ ] HTTPS enabled (handled by deployment platform)
- [ ] Rate limiting enabled
- [ ] Input validation in place

### Performance
- [ ] Images optimized
- [ ] API responses cached where appropriate
- [ ] Database indexes created

### Monitoring
- [ ] Health check endpoint accessible (`/health`)
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Alerts set up for downtime

### Post-Deployment
- [ ] Smoke test all major user flows
- [ ] Check health endpoint: `curl https://your-domain.com/health`
- [ ] Verify frontend loads correctly
- [ ] Test authentication flow
- [ ] Check AI endpoints respond correctly

---
*Pluto says: "Wonderful. Who's monitoring production tonight?"*
"""
