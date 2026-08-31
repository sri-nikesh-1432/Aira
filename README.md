# ☀️ AIRA OS — Multi-Agent AI Orchestration System

> "I don't solve problems alone. I orchestrate intelligence."

**AIRA (Artificial Intelligence Research & Innovation Assistant)** is the Central Intelligence of AIRA OS — a Multi-Agent AI Orchestration System that coordinates **9 specialized AI Planets** to build complete production-ready projects from a single idea.

Copyright © 2026 Sri D. All rights reserved.

---

## 🏙️ The Living Software Company World

The flagship experience at **`/office`** is a fully explorable, real-event-driven company world. It is **not** animated decoration — every employee movement and workflow state is driven by actual backend FastAPI **SSE events** (the backend is always the source of truth).

- **World layout**: Employee Dormitory (left) → roads (center) → Main Office (center-right) → AIRA's private Villa with helipad (top) → Datta's Mansion (bottom), plus a Post Office with the project mailbox.
- **Physical movement**: No teleporting. Employees travel along real road paths — by **bicycle** (with spinning wheels/spokes), Datta by **car** (from his mansion), AIRA by **private helicopter** (from her villa), and the Postman physically delivers each new idea into the mailbox.
- **10 human employees + AIRA (female CEO) + Datta (male Project Manager)**: each with a unique face, hairstyle, skin tone, clothing, personality, workstation, dorm room, and bicycle.
- **Real choreography from real events**: `active` → employees ride to their cabins and work; `completed` → they report to Datta's cabin; `reporting` → they enter Datta's cabin; `sleeping` → they return to the dorm and rest. Datta manages task decomposition, dependencies, parallel execution and **targeted error recovery** (only the responsible employee is re-awakened).
- **Day / Afternoon / Night cycles** driven by a real IST clock & date — at night the sky darkens, streetlights, buildings, offices and vehicles light up.
- **Fully interactive**: pan / zoom / drag the world, and click characters or rooms to inspect live status.

---

## 🌌 The 10-Agent Ecosystem

| Planet | Symbol | Role | Motto |
|--------|--------|------|-------|
| **AIRA** | ☀️ | Central Intelligence & Orchestrator | "I don't solve problems alone. I orchestrate intelligence." |
| **Mercury** | ☿ | Research & Intelligence | "Before innovation comes understanding." |
| **Mars** | ♂ | Architecture & Planning | "Don't start building until the architecture can survive success." |
| **Venus** | ♀ | UI/UX & Experience | "A product is successful when people enjoy using it." |
| **Earth** | 🌍 | Development & Engineering | "Innovation becomes reality through engineering." |
| **Jupiter** | ♃ | Business Strategy | "Innovation creates products. Business creates impact." |
| **Saturn** | ♄ | Documentation | "If it isn't documented, it doesn't exist." |
| **Neptune** | ♆ | Quality Assurance | "Trust is earned through testing." |
| **Uranus** | ♅ | Meta-Evolution | "Intelligence is not what you know today." |
| **Pluto** | 🪐 | Deployment & Operations | "Deployment is not the finish line. It is the beginning." |

---

## 📋 How It Works

```
User describes idea
        ↓
   ☀️ AIRA Core
   Understands goal, decomposes tasks
        ↓
   ☿ Mercury
   Researches domain, competitors, patents, MSME rules
        ↓
   ♂ Mars
   Designs system architecture, APIs, database, AI pipeline
        ↓
   ♀ Venus
   Creates design system, UI/UX guidelines, brand identity
        ↓
   🌍 Earth
   Generates complete full-stack source code
        ↓
   ♃ Jupiter
   Builds business model, pricing, revenue strategy
        ↓
   ♄ Saturn
   Writes documentation, reports & pitch deck
        ↓
   ♆ Neptune
   Runs tests, security scans & QA validation
        ↓
   ♅ Uranus
   Extracts lessons & optimizes for next time
        ↓
   🪐 Pluto
   Creates Docker, CI/CD, deployment configuration
        ↓
   ☀️ AIRA Final Review
   Validates quality, delivers results
```

---

## 📁 Project Structure

```
AIRA-OS/
├── frontend/                  # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/               # App router pages
│       │   ├── page.tsx       # Landing page
│       │   ├── dashboard/     # Dashboard
│       │   ├── project/       # Project workspace + new project
│       │   └── planets/       # Solar system visualization
│       ├── components/        # React components
│       │   ├── planets/       # SolarSystem, PlanetCard
│       │   └── office/        # Living company world
│       │       ├── OfficeWorld.tsx     # Explorable world renderer
│       │       ├── HumanSprite.tsx     # Human employee sprites
│       │       ├── VehicleSprites.tsx  # Bicycle / car / helicopter
│       │       ├── roster.ts           # 13-person roster (AIRA, Datta, 10 employees, Postman)
│       │       └── TopBar / TeamStatusBar / AgentDetailPanel
│       ├── lib/               # API client + world paths (paths.ts)
│       ├── store/             # Zustand state (path-based motion engine)
│       └── types/             # TypeScript types
│
├── backend/                   # FastAPI + Python
│   ├── main.py                # FastAPI app + routes
│   ├── config.py              # Settings
│   ├── models.py              # Pydantic models
│   ├── llm_utils.py           # Gemini LLM wrapper
│   ├── core/
│   │   ├── orchestrator.py    # LangGraph pipeline (AIRA Core)
│   │   ├── deterministic.py   # Fallback generators
│   │   └── preview.py         # Live preview system
│   └── planets/
│       ├── mercury.py         # Research planet
│       ├── mars.py            # Architecture planet
│       ├── venus.py           # Design planet
│       ├── earth.py           # Development planet
│       ├── jupiter.py         # Business planet
│       ├── saturn.py          # Documentation planet
│       ├── neptune.py         # QA planet
│       ├── uranus.py          # Evolution planet
│       └── pluto.py           # Deployment planet
│
├── docker-compose.yml
└── README.md
```

---

## 🎯 Key Features

- **Living Company World** — Full-screen explorable office world (villa, mansion, dormitory, office, roads, mailbox, helipad) with pan / zoom / click
- **Real Event-Driven Movement** — Employees physically travel along roads by bicycle / car / helicopter, driven purely by backend SSE events
- **Human Employees** — 10 unique people + AIRA (CEO) + Datta (PM), each with distinct appearance & personality
- **Day/Night Cycles** — Real IST clock, date and time-of-day render day, afternoon and night lighting
- **Solar System UI** — Visualize planet activity in real-time with animated orbits
- **Streaming Events** — Watch each planet work via SSE with live terminal output
- **LangGraph Orchestration** — Sequential planet pipeline with state management
- **Google Gemini** — Free-tier LLM for all planets
- **Deterministic Fallbacks** — Guaranteed mission completion even without LLM
- **Complete Code Generation** — Full-stack Next.js + FastAPI apps
- **Live Preview** — Test generated apps in-browser with independent ports
- **MSME Compliance** — Built-in MSME theme analysis
- **ZIP Download** — Download complete project as archive
- **Docker Ready** — One command deployment

---

## 🌟 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.11 |
| Orchestration | LangGraph, LangChain |
| LLM | Google Gemini 2.5 Flash |
| State | Zustand |
| Streaming | SSE (Server-Sent Events) + WebSocket |
| Deployment | Docker, GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API key (free tier available)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5174
```

---

## 📖 AIRA OS Vision

AIRA OS demonstrates the minimum viable AI Operating System — from research and planning to design, development, validation, and deployment using 9 specialized AI planets orchestrated by a central intelligence.

The system guarantees mission completion through a multi-layer resilience strategy: each planet attempts LLM-powered work first, falls back to deterministic generators if that fails, and AIRA orchestrates the entire pipeline end-to-end.

---

*Built with AIRA OS — "I don't solve problems alone. I orchestrate intelligence."*
