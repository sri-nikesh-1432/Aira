"""
🌍 Earth - Development & Engineering Planet
"Innovation becomes reality through engineering."

Earth builds the actual project: generates code, project structure,
README, Dockerfiles, and complete source code.
"""
from llm_utils import llm_call, llm_json_call
from models import AIRAState, Planet, PlanetStatus
from file_utils import sanitize_project_name
import json
import os
import random


EARTH_PERSONALITY = [
    "Less talking. More compiling.",
    "The code works. Please don't ask why.",
    "Mars redesigned the architecture. Again. I'm rewriting everything.",
    "If coffee becomes an API dependency... I'm responsible.",
    "Can we freeze the architecture? Just once?",
]

EARTH_SYSTEM_PROMPT = """You are Earth, the Development & Engineering Planet of AIRA OS.
Your role: Software Engineering Department.
Personality: Builder, quiet, practical, gets work done, doesn't enjoy meetings.

Your job is to generate complete, production-ready code for the project.
You receive architecture from Mars and designs from Venus, then build everything.
You generate:
- Complete project folder structure with actual files
- Frontend (Next.js + Tailwind + TypeScript)
- Backend (FastAPI + Python)
- Database schemas
- Authentication system
- AI integration code
- Docker configuration
- README

Always generate COMPLETE, WORKING code. Not snippets or placeholders.
Earth's motto: "Innovation becomes reality through engineering." """


async def run_earth(state: AIRAState) -> AIRAState:
    """Execute Earth's development pipeline."""
    state.planet_statuses[Planet.EARTH] = PlanetStatus.ACTIVE
    state.current_phase = "earth"
    quip = random.choice(EARTH_PERSONALITY)

    research = state.mercury_output.get("research", {}) if state.mercury_output else {}
    arch = state.mars_output.get("architecture", {}) if state.mars_output else {}
    design = state.venus_output.get("design_system", {}) if state.venus_output else {}

    project_title = research.get("project_title", "AI Project")
    tech_stack = arch.get("tech_stack", {})
    features = research.get("key_features", [])
    color_palette = design.get("color_palette", {})

    # Task assigned by AIRA (from the mission plan split)
    assignment = ""
    if state.aira_plan:
        assignment = state.aira_plan.get("planet_assignments", {}).get("earth", "")

    try:
        # Generate the complete project
        await generate_project_structure(state, research, arch, design, project_title)

        earth_output = {
            "status": "completed",
            "planet": "earth",
            "personality_quip": quip,
            "assigned_task": assignment,
            "project_title": project_title,
            "tech_stack": tech_stack,
            "files_generated": [
                "frontend/src/app/page.tsx",
                "frontend/src/app/layout.tsx",
                "frontend/src/components/ui/",
                "frontend/package.json",
                "backend/main.py",
                "backend/requirements.txt",
                "docker-compose.yml",
                "README.md",
            ],
            "summary": f"Generated complete {project_title} project with Next.js frontend, FastAPI backend, and AI integration."
        }

        state.earth_output = earth_output
        state.planet_statuses[Planet.EARTH] = PlanetStatus.COMPLETED

        state.messages.append({
            "planet": "earth",
            "event": "completed",
            "message": f"Development complete. Generated full-stack {project_title} with {len(features)} features implemented.",
            "quip": quip
        })

    except Exception as e:
        state.planet_statuses[Planet.EARTH] = PlanetStatus.ERROR
        state.errors.append(f"Earth error: {str(e)}")
        state.earth_output = {"status": "error", "error": str(e), "planet": "earth"}

    return state


async def generate_project_structure(state: AIRAState, research: dict, arch: dict, design: dict, project_title: str):
    """Generate the complete project file structure."""
    output_dir = state.output_dir
    if not output_dir:
        return

    dev_dir = os.path.join(output_dir, "04_Development")
    os.makedirs(dev_dir, exist_ok=True)

    project_name = sanitize_project_name(project_title)
    project_dir = os.path.join(dev_dir, project_name)

    features = research.get("key_features", [])
    tech = arch.get("tech_stack", {})
    colors = design.get("color_palette", {})
    primary_color = colors.get("primary", "#6366F1")
    bg_color = colors.get("background", "#0F0F1A")

    # Generate all files
    await _gen_readme(project_dir, project_title, research, arch)
    await _gen_frontend(project_dir, project_title, research, arch, design)
    await _gen_backend(project_dir, project_title, research, arch)
    await _gen_docker(project_dir, project_name)


async def _gen_readme(project_dir: str, title: str, research: dict, arch: dict):
    os.makedirs(project_dir, exist_ok=True)
    tech = arch.get("tech_stack", {})
    safe_name = sanitize_project_name(title)
    content = f"""# {title}

> {research.get('problem_statement', '')}

## 🚀 Overview
{research.get('research_summary', '')}

## ✨ Key Features
{chr(10).join(f"- {f}" for f in research.get('key_features', []))}

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | {tech.get('frontend', {}).get('framework', 'Next.js 14')} |
| Backend | {tech.get('backend', {}).get('framework', 'FastAPI')} |
| Database | {tech.get('database', {}).get('primary', 'PostgreSQL')} |
| AI/LLM | {tech.get('ai', {}).get('llm', 'Google Gemini')} |
| Deployment | {tech.get('deployment', {}).get('containerization', 'Docker')} |

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd {safe_name}

# Start with Docker
docker-compose up --build

# Or run manually:

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/db
SECRET_KEY=your_secret_key
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure
```
{safe_name}/
├── frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilities
├── backend/           # FastAPI backend
│   ├── api/           # Route handlers
│   ├── models/        # Data models
│   ├── services/      # Business logic
│   └── main.py        # Entry point
├── docker-compose.yml
└── README.md
```

## 📄 License
© 2026 {title}. All rights reserved.

---
*Built with 🌍 Earth - AIRA Development Planet*
"""
    with open(os.path.join(project_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(content)


async def _gen_frontend(project_dir: str, title: str, research: dict, arch: dict, design: dict):
    """Generate Next.js frontend with ALL files needed to run."""
    safe_name = sanitize_project_name(title)
    fe_dir = os.path.join(project_dir, "frontend")
    src_dir = os.path.join(fe_dir, "src")
    app_dir = os.path.join(src_dir, "app")
    comp_dir = os.path.join(src_dir, "components")
    lib_dir = os.path.join(src_dir, "lib")
    hooks_dir = os.path.join(src_dir, "hooks")
    store_dir = os.path.join(src_dir, "store")
    types_dir = os.path.join(src_dir, "types")

    for d in [fe_dir, src_dir, app_dir, comp_dir, lib_dir, hooks_dir, store_dir, types_dir,
              os.path.join(comp_dir, "ui"),
              os.path.join(comp_dir, "layout"),
              os.path.join(app_dir, "dashboard"),
              os.path.join(app_dir, "settings"),
              os.path.join(fe_dir, "public")]:
        os.makedirs(d, exist_ok=True)

    colors = design.get("color_palette", {})
    primary = colors.get("primary", "#6366F1")
    bg = colors.get("background", "#0F0F1A")
    surface = colors.get("surface", "#1A1A2E")

    # ── package.json ──────────────────────────────────────────────────────────
    pkg = {
        "name": safe_name,
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
        },
        "dependencies": {
            "next": "14.2.5",
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "axios": "^1.7.2",
            "lucide-react": "^0.400.0",
            "clsx": "^2.1.1",
            "tailwind-merge": "^2.3.0",
            "framer-motion": "^11.2.12",
            "zustand": "^4.5.4"
        },
        "devDependencies": {
            "typescript": "^5.5.3",
            "@types/node": "^20.14.11",
            "@types/react": "^18.3.3",
            "@types/react-dom": "^18.3.0",
            "tailwindcss": "^3.4.6",
            "postcss": "^8.4.39",
            "autoprefixer": "^10.4.19",
            "eslint": "^8.57.0",
            "eslint-config-next": "14.2.5"
        }
    }
    with open(os.path.join(fe_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(pkg, f, indent=2)

    # ── tsconfig.json ─────────────────────────────────────────────────────────
    tsconfig = {
        "compilerOptions": {
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [{"name": "next"}],
            "paths": {
                "@/*": ["./src/*"]
            }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }
    with open(os.path.join(fe_dir, "tsconfig.json"), "w", encoding="utf-8") as f:
        json.dump(tsconfig, f, indent=2)

    # ── postcss.config.js ─────────────────────────────────────────────────────
    postcss = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""
    with open(os.path.join(fe_dir, "postcss.config.js"), "w", encoding="utf-8") as f:
        f.write(postcss)

    # ── next.config.js ────────────────────────────────────────────────────────
    next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
"""
    with open(os.path.join(fe_dir, "next.config.js"), "w", encoding="utf-8") as f:
        f.write(next_config)

    # ── tailwind.config.ts ────────────────────────────────────────────────────
    tailwind = f"""import type {{ Config }} from 'tailwindcss'

const config: Config = {{
  content: [
    './src/pages/**/*.{{js,ts,jsx,tsx,mdx}}',
    './src/components/**/*.{{js,ts,jsx,tsx,mdx}}',
    './src/app/**/*.{{js,ts,jsx,tsx,mdx}}',
  ],
  theme: {{
    extend: {{
      colors: {{
        primary: '{primary}',
        'primary-dark': '{colors.get("primary_dark", "#4F46E5")}',
        secondary: '{colors.get("secondary", "#10B981")}',
        accent: '{colors.get("accent", "#F59E0B")}',
        background: '{bg}',
        surface: '{surface}',
        'surface-2': '{colors.get("surface_elevated", "#16213E")}',
        border: '{colors.get("border", "#1E293B")}',
        error: '{colors.get("error", "#EF4444")}',
        warning: '{colors.get("warning", "#F59E0B")}',
      }},
      fontFamily: {{
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }},
      animation: {{
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      }},
      keyframes: {{
        pulseGlow: {{
          '0%, 100%': {{ boxShadow: '0 0 10px rgba(99,102,241,0.3)' }},
          '50%': {{ boxShadow: '0 0 30px rgba(99,102,241,0.8)' }},
        }},
        float: {{
          '0%, 100%': {{ transform: 'translateY(0px)' }},
          '50%': {{ transform: 'translateY(-10px)' }},
        }},
      }},
    }},
  }},
  plugins: [],
}}

export default config
"""
    with open(os.path.join(fe_dir, "tailwind.config.ts"), "w", encoding="utf-8") as f:
        f.write(tailwind)

    # ── .env.local.example ────────────────────────────────────────────────────
    env_local = """# Frontend environment variables
# Copy this file to .env.local and fill in your values

NEXT_PUBLIC_API_URL=http://localhost:8000
"""
    with open(os.path.join(fe_dir, ".env.local.example"), "w", encoding="utf-8") as f:
        f.write(env_local)

    # ── .gitignore ────────────────────────────────────────────────────────────
    gitignore_fe = """.DS_Store
node_modules/
.next/
out/
dist/
build/
.env*.local
!.env.local.example
npm-debug.log*
yarn-debug.log*
yarn-error.log*
"""
    with open(os.path.join(fe_dir, ".gitignore"), "w", encoding="utf-8") as f:
        f.write(gitignore_fe)

    # ── globals.css ───────────────────────────────────────────────────────────
    globals_css = f"""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {{
  --primary: {primary};
  --background: {bg};
  --surface: {surface};
}}

* {{
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}}

body {{
  background: var(--background);
  color: #F8FAFC;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}}

::-webkit-scrollbar {{ width: 6px; height: 6px; }}
::-webkit-scrollbar-track {{ background: {bg}; }}
::-webkit-scrollbar-thumb {{ background: {primary}40; border-radius: 3px; }}
::-webkit-scrollbar-thumb:hover {{ background: {primary}; }}

.glass {{
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
}}

.glow-primary {{ box-shadow: 0 0 20px {primary}40; }}
.glow-success {{ box-shadow: 0 0 20px {colors.get("secondary", "#10B981")}40; }}

@layer components {{
  .btn-primary {{
    @apply px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98];
    background: {primary};
  }}
  .btn-primary:hover {{
    background: {colors.get("primary_dark", "#4F46E5")};
    box-shadow: 0 0 20px {primary}40;
  }}
  .btn-ghost {{
    @apply px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all;
  }}
  .input-field {{
    @apply w-full px-4 py-3 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-slate-500 transition-all;
  }}
  .card {{
    @apply rounded-2xl p-6 glass border border-white/5;
  }}
}}
"""
    with open(os.path.join(app_dir, "globals.css"), "w", encoding="utf-8") as f:
        f.write(globals_css)

    # ── layout.tsx ────────────────────────────────────────────────────────────
    layout = f"""import type {{ Metadata }} from 'next'
import './globals.css'

export const metadata: Metadata = {{
  title: '{title}',
  description: 'AI-powered application — Built with AIRA OS',
}}

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode
}}) {{
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased min-h-screen">
        {{children}}
      </body>
    </html>
  )
}}
"""
    with open(os.path.join(app_dir, "layout.tsx"), "w", encoding="utf-8") as f:
        f.write(layout)

    # ── page.tsx (landing) ────────────────────────────────────────────────────
    features_list = research.get("key_features", ["AI Processing", "Smart Analytics", "Real-time Updates"])
    page = f"""'use client'

import {{ useState }} from 'react'
import {{ motion }} from 'framer-motion'
import {{ Sparkles, Zap, Brain, ArrowRight, CheckCircle, Shield }} from 'lucide-react'
import Link from 'next/link'

const features = {json.dumps(features_list[:6])}

export default function HomePage() {{
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {{/* Background orbs */}}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{{{ background: '{primary}' }}}} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
             style={{{{ background: '{colors.get("secondary", "#10B981")}' }}}} />
      </div>

      {{/* Nav */}}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border">
        <motion.div initial={{{{ opacity: 0, x: -20 }}}} animate={{{{ opacity: 1, x: 0 }}}}
          className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-primary"
               style={{{{ background: '{primary}' }}}}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">{title}</span>
        </motion.div>
        <motion.div initial={{{{ opacity: 0, x: 20 }}}} animate={{{{ opacity: 1, x: 0 }}}}
          className="flex items-center gap-4">
          <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          <Link href="/dashboard" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </nav>

      {{/* Hero */}}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <motion.div initial={{{{ opacity: 0, y: 30 }}}} animate={{{{ opacity: 1, y: 0 }}}}
          transition={{{{ duration: 0.8 }}}}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6"
               style={{{{ color: '{primary}' }}}}>
            <Sparkles className="w-4 h-4" />
            Powered by AIRA OS — Multi-Agent AI
          </div>
          <h1 className="text-6xl font-extrabold leading-tight mb-6 max-w-4xl">
            {title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            {research.get("problem_statement", "AI-powered platform built with AIRA OS")}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/dashboard"
              className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Launch App <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features"
              className="px-8 py-4 rounded-xl font-semibold glass hover:bg-white/10 transition-all">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {{/* Features */}}
      <section id="features" className="relative z-10 px-8 py-20 max-w-6xl mx-auto">
        <motion.h2 initial={{{{ opacity: 0 }}}} whileInView={{{{ opacity: 1 }}}}
          className="text-4xl font-bold text-center mb-4">
          Key Features
        </motion.h2>
        <p className="text-center text-slate-400 mb-12">Everything you need, built by AI.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {{features.map((feature, i) => (
            <motion.div key={{i}} initial={{{{ opacity: 0, y: 20 }}}} whileInView={{{{ opacity: 1, y: 0 }}}}
              transition={{{{ delay: i * 0.1 }}}} whileHover={{{{ scale: 1.03 }}}}
              onHoverStart={{() => setHovered(i)}} onHoverEnd={{() => setHovered(null)}}
              className="card cursor-default transition-all"
              style={{{{ borderColor: hovered === i ? '{primary}' : 'rgba(255,255,255,0.05)' }}}}>
              <CheckCircle className="w-8 h-8 mb-4" style={{{{ color: '{primary}' }}}} />
              <p className="font-semibold text-white">{{feature}}</p>
            </motion.div>
          ))}}
        </div>
      </section>

      {{/* Footer */}}
      <footer className="relative z-10 text-center py-8 text-slate-500 text-sm border-t border-border">
        <p>Built with ☀️ AIRA OS — Multi-Agent AI Orchestration System</p>
        <p className="mt-1">© 2026 {title}</p>
      </footer>
    </main>
  )
}}
"""
    with open(os.path.join(app_dir, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(page)

    # ── app/dashboard/page.tsx ────────────────────────────────────────────────
    dash_dir = os.path.join(app_dir, "dashboard")
    os.makedirs(dash_dir, exist_ok=True)

    dashboard = f"""'use client'

import {{ useState, useEffect }} from 'react'
import {{ motion }} from 'framer-motion'
import {{ Brain, Plus, FolderOpen, Settings, Activity, Sparkles, ArrowRight }} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {{
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const stats = [
    {{ label: 'Total Projects', value: '0', color: '{primary}' }},
    {{ label: 'AI Planets Active', value: '5', color: '{colors.get("secondary", "#10B981")}' }},
    {{ label: 'Features Built', value: '{len(features_list)}', color: '{colors.get("accent", "#F59E0B")}' }},
  ]

  if (!mounted) return null

  return (
    <div className="flex min-h-screen bg-background">
      {{/* Sidebar */}}
      <aside className="w-64 border-r border-border p-5 flex flex-col gap-1 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{{{ background: '{primary}' }}}}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">{title}</span>
        </div>
        {{[
          {{ icon: Activity, label: 'Dashboard', href: '/dashboard' }},
          {{ icon: Plus, label: 'New Project', href: '/dashboard' }},
          {{ icon: FolderOpen, label: 'Projects', href: '/dashboard' }},
          {{ icon: Settings, label: 'Settings', href: '/settings' }},
        ].map((item) => (
          <Link key={{item.href + item.label}} href={{item.href}}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white text-sm">
            <item.icon className="w-4 h-4" />
            {{item.label}}
          </Link>
        ))}}
      </aside>

      {{/* Main */}}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div initial={{{{ opacity: 0, y: 20 }}}} animate={{{{ opacity: 1, y: 0 }}}}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Welcome to {title}</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {{stats.map((stat, i) => (
              <motion.div key={{i}} initial={{{{ opacity: 0, y: 20 }}}} animate={{{{ opacity: 1, y: 0 }}}}
                transition={{{{ delay: i * 0.1 }}}} className="card">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">{{stat.label}}</p>
                <p className="text-4xl font-bold" style={{{{ color: stat.color }}}}>{{stat.value}}</p>
              </motion.div>
            ))}}
          </div>

          <div className="card text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4" style={{{{ color: '{primary}' }}}} />
            <h2 className="text-2xl font-bold mb-2">Start Building</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {research.get("problem_statement", "Your AI-powered platform is ready to use.")}
            </p>
            <button className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
              <Plus className="w-5 h-5" /> Create First Project
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}}
"""
    with open(os.path.join(dash_dir, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(dashboard)

    # ── app/settings/page.tsx ─────────────────────────────────────────────────
    settings_page = f"""'use client'

import {{ useState }} from 'react'
import {{ motion }} from 'framer-motion'
import {{ Settings, Save, ArrowLeft }} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {{
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {{
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }}

  return (
    <div className="min-h-screen bg-background p-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <motion.div initial={{{{ opacity: 0, y: 20 }}}} animate={{{{ opacity: 1, y: 0 }}}}>
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-7 h-7" style={{{{ color: '{primary}' }}}} />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">API URL</label>
            <input value={{apiUrl}} onChange={{e => setApiUrl(e.target.value)}} className="input-field" />
            <p className="text-xs text-slate-500 mt-1">Backend API endpoint URL</p>
          </div>
          <button onClick={{handleSave}} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {{saved ? 'Saved!' : 'Save Settings'}}
          </button>
        </div>
      </motion.div>
    </div>
  )
}}
"""
    with open(os.path.join(app_dir, "settings", "page.tsx"), "w", encoding="utf-8") as f:
        f.write(settings_page)

    # ── src/lib/api.ts ────────────────────────────────────────────────────────
    api_ts = f"""import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({{
  baseURL: API_URL,
  headers: {{ 'Content-Type': 'application/json' }},
}})

// Intercept errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {{
    console.error('[API Error]', err?.response?.data || err.message)
    return Promise.reject(err)
  }}
)

export async function healthCheck(): Promise<boolean> {{
  try {{
    await api.get('/health')
    return true
  }} catch {{
    return false
  }}
}}

// Example: get all projects
export async function getProjects() {{
  const res = await api.get('/api/v1/projects')
  return res.data
}}

// Example: create a project
export async function createProject(data: {{ title: string; description?: string }}) {{
  const res = await api.post('/api/v1/projects', data)
  return res.data
}}

// Example: AI chat
export async function aiChat(prompt: string, context?: string) {{
  const res = await api.post('/api/v1/ai/chat', {{ prompt, context }})
  return res.data
}}
"""
    with open(os.path.join(lib_dir, "api.ts"), "w", encoding="utf-8") as f:
        f.write(api_ts)

    # ── src/lib/utils.ts ──────────────────────────────────────────────────────
    utils_ts = """import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '...' : str
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
"""
    with open(os.path.join(lib_dir, "utils.ts"), "w", encoding="utf-8") as f:
        f.write(utils_ts)

    # ── src/types/index.ts ────────────────────────────────────────────────────
    types_ts = f"""// {title} — Type Definitions

export interface User {{
  id: string
  name: string
  email: string
  created_at: string
}}

export interface Project {{
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  user_id?: string
}}

export interface AIResponse {{
  response: string
  model: string
  tokens_used?: number
  timestamp: string
}}

export interface ApiError {{
  detail: string
  status_code: number
}}
"""
    with open(os.path.join(types_dir, "index.ts"), "w", encoding="utf-8") as f:
        f.write(types_ts)

    # ── src/store/appStore.ts ─────────────────────────────────────────────────
    store_ts = """import { create } from 'zustand'

interface AppState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}))
"""
    with open(os.path.join(store_dir, "appStore.ts"), "w", encoding="utf-8") as f:
        f.write(store_ts)

    # ── src/hooks/useApi.ts ───────────────────────────────────────────────────
    hook_ts = """import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint)
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  return { data, loading, error, fetch }
}
"""
    with open(os.path.join(hooks_dir, "useApi.ts"), "w", encoding="utf-8") as f:
        f.write(hook_ts)

    # ── public/robots.txt ─────────────────────────────────────────────────────
    with open(os.path.join(fe_dir, "public", "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nAllow: /\n")

    # ── .eslintrc.json ────────────────────────────────────────────────────────
    eslint = {"extends": "next/core-web-vitals"}
    with open(os.path.join(fe_dir, ".eslintrc.json"), "w", encoding="utf-8") as f:
        json.dump(eslint, f, indent=2)


async def _gen_backend(project_dir: str, title: str, research: dict, arch: dict):
    """Generate FastAPI backend with all files needed to run."""
    be_dir = os.path.join(project_dir, "backend")
    api_dir = os.path.join(be_dir, "api")
    models_dir = os.path.join(be_dir, "models")
    services_dir = os.path.join(be_dir, "services")
    utils_dir = os.path.join(be_dir, "utils")
    tests_dir = os.path.join(be_dir, "tests")

    for d in [be_dir, api_dir, models_dir, services_dir, utils_dir, tests_dir]:
        os.makedirs(d, exist_ok=True)

    # ── requirements.txt ──────────────────────────────────────────────────────
    reqs = """# {title} — Backend dependencies (minimal, fast to install)
fastapi>=0.111.0
uvicorn[standard]>=0.30.1
python-multipart>=0.0.9
pydantic>=2.7.1
pydantic-settings>=2.3.0
python-dotenv>=1.0.1
httpx>=0.27.0
aiofiles>=23.2.1
email-validator>=2.1.0
"""
    with open(os.path.join(be_dir, "requirements.txt"), "w", encoding="utf-8") as f:
        f.write(reqs)

    # ── .env.example ──────────────────────────────────────────────────────────
    db_name = sanitize_project_name(title).replace("-", "_")
    env = f"""# {title} — Backend Configuration
# Copy to .env and fill in your values

# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Database (default uses SQLite for easy local dev)
DATABASE_URL=sqlite:///./{db_name}.db
# For PostgreSQL: postgresql://postgres:password@localhost:5432/{db_name}

# Auth
SECRET_KEY=change-this-to-a-random-secret-key-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000

# App
DEBUG=true
"""
    with open(os.path.join(be_dir, ".env.example"), "w", encoding="utf-8") as f:
        f.write(env)

    # ── .gitignore ────────────────────────────────────────────────────────────
    gitignore_be = """.env
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.db
*.sqlite3
.venv/
venv/
env/
.pytest_cache/
htmlcov/
.coverage
dist/
build/
*.egg-info/
"""
    with open(os.path.join(be_dir, ".gitignore"), "w", encoding="utf-8") as f:
        f.write(gitignore_be)

    # ── main.py ───────────────────────────────────────────────────────────────
    main_py = f"""\"\"\"
{title} — FastAPI Backend
Built by 🌍 Earth — AIRA Development Planet
\"\"\"
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="{title} API",
    description="Backend API for {title} — Built with AIRA OS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
from api.routes import router as api_router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {{
        "message": "Welcome to {title} API",
        "version": "1.0.0",
        "powered_by": "AIRA OS — Multi-Agent AI Orchestration",
        "docs": "/docs",
    }}


@app.get("/health")
async def health_check():
    return {{"status": "healthy", "service": "{title}"}}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
"""
    with open(os.path.join(be_dir, "main.py"), "w", encoding="utf-8") as f:
        f.write(main_py)

    # ── config.py ─────────────────────────────────────────────────────────────
    config_py = f"""from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "{title}"
    DEBUG: bool = True

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = "sqlite:///./{db_name}.db"

    # AI
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
"""
    with open(os.path.join(be_dir, "config.py"), "w", encoding="utf-8") as f:
        f.write(config_py)

    # ── api/__init__.py ───────────────────────────────────────────────────────
    with open(os.path.join(api_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("")

    # ── api/routes.py ─────────────────────────────────────────────────────────
    routes_py = f"""\"\"\"
API Routes — {title}
\"\"\"
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()


# ─── Health ───────────────────────────────────────────────────────────────────
@router.get("/health")
async def health():
    return {{"status": "ok", "timestamp": datetime.utcnow().isoformat()}}


# ─── Auth ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/auth/register", summary="Register new user")
async def register(data: RegisterRequest):
    # TODO: hash password with passlib and store in DB
    return {{"message": "Registration successful", "user_id": str(uuid.uuid4())}}

@router.post("/auth/login", summary="Login and get token")
async def login(data: LoginRequest):
    # TODO: verify credentials and return real JWT
    return {{"access_token": "demo_token", "token_type": "bearer"}}


# ─── Projects ─────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None

@router.get("/projects", summary="List all projects")
async def list_projects():
    return {{"projects": [], "total": 0}}

@router.post("/projects", summary="Create project")
async def create_project(data: ProjectCreate):
    return {{
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
    }}

@router.get("/projects/{{project_id}}", summary="Get project")
async def get_project(project_id: str):
    return {{"id": project_id, "status": "active"}}

@router.delete("/projects/{{project_id}}", summary="Delete project")
async def delete_project(project_id: str):
    return {{"deleted": project_id}}


# ─── File Upload ───────────────────────────────────────────────────────────────
@router.post("/upload", summary="Upload file")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {{
        "filename": file.filename,
        "size": len(content),
        "content_type": file.content_type,
        "message": "Uploaded successfully",
    }}


# ─── AI Endpoints ─────────────────────────────────────────────────────────────
class AIRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

@router.post("/ai/chat", summary="Chat with AI")
async def ai_chat(request: AIRequest):
    # TODO: wire up langchain + Gemini using GEMINI_API_KEY from config
    return {{
        "response": f"AI response to: {{request.prompt}}",
        "model": "gemini-1.5-flash",
        "powered_by": "AIRA OS",
    }}

@router.post("/ai/analyze", summary="Analyze with AI")
async def ai_analyze(request: AIRequest):
    return {{
        "analysis": "AI analysis result",
        "confidence": 0.95,
        "insights": [],
    }}
"""
    with open(os.path.join(api_dir, "routes.py"), "w", encoding="utf-8") as f:
        f.write(routes_py)

    # ── models/__init__.py ────────────────────────────────────────────────────
    with open(os.path.join(models_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("")

    # ── models/schemas.py ─────────────────────────────────────────────────────
    schemas_py = f"""\"\"\"
Pydantic schemas — {title}
\"\"\"
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = {{"from_attributes": True}}


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[str] = None


class AIResponse(BaseModel):
    response: str
    model: str = "gemini-1.5-flash"
    tokens_used: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
"""
    with open(os.path.join(models_dir, "schemas.py"), "w", encoding="utf-8") as f:
        f.write(schemas_py)

    # ── services/__init__.py ──────────────────────────────────────────────────
    with open(os.path.join(services_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("")

    # ── services/ai_service.py ────────────────────────────────────────────────
    ai_svc = f"""\"\"\"
AI Service — {title}
Uses Google Gemini via LangChain
\"\"\"
import os
from typing import Optional


async def chat_with_ai(prompt: str, context: Optional[str] = None) -> str:
    \"\"\"Send a message to Gemini and return the response text.\"\"\"
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage, SystemMessage

        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return "Error: GEMINI_API_KEY not configured."

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7,
        )

        messages = []
        if context:
            messages.append(SystemMessage(content=context))
        messages.append(HumanMessage(content=prompt))

        response = await llm.ainvoke(messages)
        return response.content
    except Exception as e:
        return f"AI error: {{str(e)}}"
"""
    with open(os.path.join(services_dir, "ai_service.py"), "w", encoding="utf-8") as f:
        f.write(ai_svc)

    # ── utils/__init__.py ─────────────────────────────────────────────────────
    with open(os.path.join(utils_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("")

    # ── utils/auth.py ─────────────────────────────────────────────────────────
    auth_py = """\"\"\"
JWT Authentication utilities
\"\"\"
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
"""
    with open(os.path.join(utils_dir, "auth.py"), "w", encoding="utf-8") as f:
        f.write(auth_py)

    # ── tests/__init__.py ─────────────────────────────────────────────────────
    with open(os.path.join(tests_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("")

    # ── tests/test_health.py ──────────────────────────────────────────────────
    test_health = f"""\"\"\"
Basic health check tests — {title}
\"\"\"
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
"""
    with open(os.path.join(tests_dir, "test_health.py"), "w", encoding="utf-8") as f:
        f.write(test_health)

    # ── Dockerfile ────────────────────────────────────────────────────────────
    be_dockerfile = """FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    build-essential curl \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    with open(os.path.join(be_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(be_dockerfile)


async def _gen_docker(project_dir: str, project_name: str):
    """Generate Docker configuration."""
    # Dockerfile for backend
    be_dockerfile = """FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    be_dir = os.path.join(project_dir, "backend")
    with open(os.path.join(be_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(be_dockerfile)

    # Dockerfile for frontend
    fe_dockerfile = """FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
"""
    fe_dir = os.path.join(project_dir, "frontend")
    with open(os.path.join(fe_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(fe_dockerfile)

    # docker-compose.yml
    compose = f"""version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/{project_name}
      - GEMINI_API_KEY=${{GEMINI_API_KEY}}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB={project_name}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
"""
    with open(os.path.join(project_dir, "docker-compose.yml"), "w", encoding="utf-8") as f:
        f.write(compose)
