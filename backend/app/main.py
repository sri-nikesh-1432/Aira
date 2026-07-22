"""AIRA OS - Multi-Agent AI Operating System Backend"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import uuid
import time

app = FastAPI(
    title="AIRA OS API",
    description="Multi-Agent AI Operating System for MSME Innovation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "https://aira.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    content: str
    agent_id: Optional[str] = None
    project_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    agent_id: Optional[str] = None
    timestamp: float

class ProjectCreate(BaseModel):
    name: str
    description: str
    idea: str
    theme: Optional[str] = None
    budget: Optional[str] = None
    team_size: Optional[int] = None
    msme_guidelines: Optional[str] = None

class ValidationRequest(BaseModel):
    idea: str
    guidelines: Optional[str] = None

class IdeaGenerationRequest(BaseModel):
    theme: Optional[str] = None
    budget: Optional[str] = None
    team_size: Optional[str] = None
    difficulty: Optional[str] = None

class JudgeAnswer(BaseModel):
    question_id: str
    answer: str

AGENTS = {
    "mercury": {"name": "Mercury", "role": "Research Intelligence", "emoji": "☿", "color": "#A0A0A0"},
    "venus": {"name": "Venus", "role": "Design Intelligence", "emoji": "♀", "color": "#E8CDA0"},
    "earth": {"name": "Earth", "role": "Development Intelligence", "emoji": "🌍", "color": "#4A90D9"},
    "mars": {"name": "Mars", "role": "Engineering Intelligence", "emoji": "♂", "color": "#CD5C5C"},
    "jupiter": {"name": "Jupiter", "role": "Business Intelligence", "emoji": "♃", "color": "#DAA06D"},
    "saturn": {"name": "Saturn", "role": "Documentation Intelligence", "emoji": "♄", "color": "#F4D03F"},
    "uranus": {"name": "Uranus", "role": "Communication Intelligence", "emoji": "♅", "color": "#73C2FB"},
    "neptune": {"name": "Neptune", "role": "Testing Intelligence", "emoji": "♆", "color": "#3F51B5"},
    "pluto": {"name": "Pluto", "role": "Deployment Intelligence", "emoji": "🪐", "color": "#C4A35A"},
    "luna": {"name": "Luna", "role": "Memory Intelligence", "emoji": "🌑", "color": "#E8E8E8"},
}

@app.get("/")
async def root():
    return {"name": "AIRA OS", "version": "1.0.0", "description": "Multi-Agent AI Operating System for MSME Innovation", "agents": len(AGENTS), "status": "operational"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "agents_online": len(AGENTS)}

@app.get("/api/agents")
async def get_agents():
    return {"agents": AGENTS}

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    if agent_id not in AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": AGENTS[agent_id]}

@app.post("/api/chat")
async def chat(message: ChatMessage):
    agent_id = message.agent_id or "mercury"
    agent = AGENTS.get(agent_id, AGENTS["mercury"])
    responses = {
        "mercury": f"☿ Mercury Research: Analyzing '{message.content[:50]}...' - Found 15 patents, 8 competitors, strong market potential.",
        "venus": f"♀ Venus Design: Recommending modern glassmorphism UI for '{message.content[:30]}...'",
        "earth": f"🌍 Earth Dev: Architecture: Next.js + FastAPI + PostgreSQL for '{message.content[:30]}...'",
        "mars": f"♂ Mars Engineering: Microservices with event-driven architecture for '{message.content[:30]}...'",
        "jupiter": f"♃ Jupiter Business: TAM/SAM/SOM shows ₹50Cr market. SaaS + Freemium model for '{message.content[:30]}...'",
        "saturn": f"♄ Saturn Docs: Technical documentation, README, and project report prepared for '{message.content[:30]}...'",
        "uranus": f"♅ Uranus Comms: Ready to simulate mock interview or judge panel for '{message.content[:30]}...'",
        "neptune": f"♆ Neptune QA: Code review complete. Found 2 minor issues in '{message.content[:30]}...'",
        "pluto": f"🪐 Pluto Deploy: Docker + CI/CD pipeline ready for '{message.content[:30]}...'",
        "luna": f"🌑 Luna Memory: Stored in knowledge graph. Related projects connected to '{message.content[:30]}...'",
    }
    return ChatResponse(id=str(uuid.uuid4()), role="assistant", content=responses.get(agent_id, f"☀️ AIRA: Processed via {agent['name']} agent."), agent_id=agent_id, timestamp=time.time())

@app.post("/api/projects")
async def create_project(project: ProjectCreate):
    return {"id": str(uuid.uuid4()), "name": project.name, "status": "idea", "message": "Project created successfully"}

@app.post("/api/validate")
async def validate_idea(request: ValidationRequest):
    return {"overall": 87, "scores": {"novelty": 85, "technical_feasibility": 92, "business_feasibility": 88, "msme_compliance": 95, "scalability": 82, "cost_effectiveness": 90}, "feedback": ["Strong MSME alignment", "High technical feasibility", "Good market potential"], "recommendations": ["File provisional patent", "Build MVP in 4 weeks", "Prepare for Stage 1"], "risks": [{"level": "low", "text": "Market timing is good"}, {"level": "medium", "text": "Competition exists"}]}

@app.post("/api/generate-ideas")
async def generate_ideas(request: IdeaGenerationRequest):
    return {"ideas": [{"title": "Smart Crop Disease Detection using Edge AI", "description": "IoT-based system using camera sensors and edge AI for real-time crop disease detection.", "score": 92, "tags": ["AI", "IoT", "Agriculture"], "market_size": "$2.1B", "competition": "Low", "timeline": "4 weeks", "budget": "₹1.5L"}, {"title": "Voice-Enabled MSME Financial Dashboard", "description": "Multilingual voice-activated financial dashboard for MSMEs.", "score": 89, "tags": ["Voice AI", "Fintech", "MSME"], "market_size": "$5.3B", "competition": "Medium", "timeline": "6 weeks", "budget": "₹2L"}]}

@app.post("/api/judge/simulate")
async def judge_simulate():
    return {"stage": 1, "questions": [{"id": "1", "question": "What problem does your solution solve?", "category": "Problem Statement", "difficulty": "easy"}, {"id": "2", "question": "How is your approach different?", "category": "Innovation", "difficulty": "medium"}, {"id": "3", "question": "Explain the technical architecture.", "category": "Technical", "difficulty": "medium"}]}

@app.post("/api/judge/score")
async def judge_score(answer: JudgeAnswer):
    return {"question_id": answer.question_id, "score": 85, "feedback": "Good response. Add more specific examples."}

@app.post("/api/evaluate")
async def evaluate_project():
    return {"overall": 82, "categories": {"msme_compliance": 88, "technical_review": 85, "innovation_score": 79, "code_quality": 90, "business_validation": 72}, "feedback": ["Follows MSME guidelines", "Solid technical implementation", "Documentation needs improvement"]}

@app.post("/api/deploy")
async def deploy_project(platform: Literal["github", "vercel", "railway", "docker", "render", "aws"] = Query("vercel")):
    platform_urls = {
        "github": "https://username.github.io/repo",
        "vercel": f"https://your-project.vercel.app",
        "railway": f"https://your-project.up.railway.app",
        "docker": "docker run your-image",
        "render": f"https://your-project.onrender.com",
        "aws": "https://your-project.aws.amazon.com",
    }
    return {"status": "deploying", "platform": platform, "url": platform_urls.get(platform, f"https://your-project.{platform}.app"), "build_time": "12.3s"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
