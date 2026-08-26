# ☀️ AIRA OS — Multi-Agent AI Orchestration System

> "I don't solve problems alone. I orchestrate intelligence."

**AIRA (Artificial Intelligence Research & Innovation Assistant)** is the Central Intelligence of AIRA OS — a Multi-Agent AI Orchestration System that coordinates 5 specialized AI Planets to build complete production-ready projects from a single idea.

Copyright © 2026 Sri D. All rights reserved.

---

## 🌌 The 5 Planets

| Planet | Symbol | Role | Motto |
|--------|--------|------|-------|
| **AIRA** | ☀️ | Central Intelligence & Orchestrator | "I don't solve problems alone. I orchestrate intelligence." |
| **Mercury** | ☿ | Research & Intelligence | "Before innovation comes understanding." |
| **Mars** | ♂ | Architecture & Planning | "Don't start building until the architecture can survive success." |
| **Venus** | ♀ | UI/UX & Experience | "A product is successful when people enjoy using it." |
| **Earth** | 🌍 | Development & Engineering | "Innovation becomes reality through engineering." |
| **Pluto** | 🪐 | Deployment & Operations | "Deployment is not the finish line. It is the beginning." |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- A free [Google Gemini API key](https://aistudio.google.com)

### 1. Clone & Setup

```bash
git clone <repo>
cd "Aira kiro"
```

### 2. Backend Setup

```bash
cd backend

# Create .env from template
copy .env.example .env
# Edit .env — add your GEMINI_API_KEY

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:3000

### 4. Or use Docker

```bash
# Copy env file
copy backend\.env.example backend\.env
# Add GEMINI_API_KEY to backend/.env

# Start everything
docker-compose up --build
```

---

## 📋 How It Works

```
User describes idea
        ↓
   ☀️ AIRA Core
   Understands goal, decomposes tasks
        ↓
   ☿ Mercury
   Researches domain, competitors, MSME rules, tech stack
        ↓
   ♂ Mars
   Designs system architecture, APIs, database, AI pipeline
        ↓
   ♀ Venus
   Creates design system, UI/UX guidelines, brand identity
        ↓
   🌍 Earth
   Generates complete Next.js + FastAPI source code
        ↓
   🪐 Pluto
   Creates Docker, CI/CD, deployment configuration
        ↓
   ☀️ AIRA Final Review
   Validates quality, MSME compliance, delivers results
```

---

## 📁 Project Structure

```
Aira kiro/
├── frontend/                  # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/               # App router pages
│       │   ├── page.tsx       # Landing page
│       │   ├── dashboard/     # Dashboard
│       │   └── project/       # Project workspace + new project
│       ├── components/        # React components
│       │   └── planets/       # SolarSystem, PlanetCard
│       ├── lib/               # API client
│       ├── store/             # Zustand state
│       └── types/             # TypeScript types
│
├── backend/                   # FastAPI + Python
│   ├── main.py                # FastAPI app + routes
│   ├── config.py              # Settings
│   ├── models.py              # Pydantic models
│   ├── llm_utils.py           # Gemini LLM wrapper
│   ├── core/
│   │   └── orchestrator.py    # LangGraph pipeline (AIRA Core)
│   └── planets/
│       ├── mercury.py         # Research planet
│       ├── mars.py            # Architecture planet
│       ├── venus.py           # Design planet
│       ├── earth.py           # Development planet
│       └── pluto.py           # Deployment planet
│
├── docker-compose.yml
└── README.md
```

---

## 🔑 Environment Variables

```env
# backend/.env
GEMINI_API_KEY=your_key_here        # Required - get free at aistudio.google.com
TAVILY_API_KEY=your_key_here        # Optional - for web search
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

---

## 🎯 Key Features

- **Solar System UI** — Visualize planet activity in real-time
- **Streaming Events** — Watch each planet work via SSE
- **LangGraph Orchestration** — Sequential planet pipeline
- **Google Gemini** — Free-tier LLM for all planets
- **Complete Code Generation** — Full-stack Next.js + FastAPI
- **MSME Compliance** — Built-in MSME theme analysis
- **Docker Ready** — One command deployment
- **Project Memory** — All outputs saved to organized folders

---

## 🌟 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.11 |
| Orchestration | LangGraph, LangChain |
| LLM | Google Gemini 1.5 Flash |
| State | Zustand |
| Streaming | SSE (Server-Sent Events) |
| Deployment | Docker, GitHub Actions |

---

## 📖 AIRA OS Vision

AIRA Core (this hackathon version) demonstrates the minimum viable AI Operating System — from research and planning to design, development, validation, and deployment using 5 specialized AI planets.

The **full AIRA OS roadmap** expands to a 10-planet ecosystem:
- ☿ Mercury — Research
- ♂ Mars — Architecture
- ♀ Venus — UI/UX
- 🌍 Earth — Development
- ♃ Jupiter — Business Strategy
- ♄ Saturn — Documentation
- ♆ Neptune — Quality Assurance
- ♅ Uranus — Meta-Evolution
- 🪐 Pluto — Deployment
- ☀️ AIRA — Central Intelligence

---

*Built with AIRA OS — "I don't solve problems alone. I orchestrate intelligence."*
*© 2026 Sri D. All rights reserved.*
