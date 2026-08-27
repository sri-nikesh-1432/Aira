'use client'

import Link from 'next/link'
import {
  ArrowRight, Sparkles, Brain, Globe, Code2, Layers, Palette,
  FileText, Shield, Rocket, TrendingUp, Zap, Search, ChevronRight,
} from 'lucide-react'

const PLANET_ICONS: Record<string, any> = {
  mercury: Search, mars: Layers, venus: Palette, earth: Code2,
  jupiter: TrendingUp, saturn: FileText, neptune: Shield,
  uranus: Zap, pluto: Rocket,
}

const PLANETS = [
  { id: 'mercury', name: 'Mercury', symbol: '☿', role: 'Research & Intelligence', color: '#9CA3AF', desc: 'Deep research across papers, patents, competitors, and MSME guidelines.' },
  { id: 'mars', name: 'Mars', symbol: '♂', role: 'Architecture & Planning', color: '#DC2626', desc: 'The CTO. Designs system architecture, databases, AI pipelines, and cloud infrastructure.' },
  { id: 'venus', name: 'Venus', symbol: '♀', role: 'UI/UX & Experience', color: '#D97706', desc: 'Designs the complete human experience — personas, journeys, design systems, branding.' },
  { id: 'earth', name: 'Earth', symbol: '🌍', role: 'Development & Engineering', color: '#2563EB', desc: 'The engineering department. Generates production-ready full-stack code.' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', role: 'Business Strategy', color: '#B45309', desc: 'Turns feasible ideas into viable businesses — market analysis, pricing, revenue.' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', role: 'Documentation', color: '#92400E', desc: 'Transforms project intelligence into professional documentation.' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', role: 'Quality Assurance', color: '#2563EB', desc: 'Validates everything — tests, security scans, performance, production readiness.' },
  { id: 'uranus', name: 'Uranus', symbol: '♅', role: 'Meta-Evolution', color: '#0D9488', desc: 'Learns from every mission. Optimizes prompts, workflows, and architectures.' },
  { id: 'pluto', name: 'Pluto', symbol: '🪐', role: 'Deployment & Operations', color: '#7C3AED', desc: 'Ships to production — Docker, CI/CD, cloud provisioning, monitoring.' },
]

const STEPS = [
  { planet: 'AIRA', icon: '☀️', action: 'Understands your goal & decomposes tasks' },
  { planet: 'Mercury', icon: '☿', action: 'Researches domain, competitors, patents' },
  { planet: 'Mars', icon: '♂', action: 'Designs system architecture & tech stack' },
  { planet: 'Venus', icon: '♀', action: 'Creates design system & UI/UX guidelines' },
  { planet: 'Earth', icon: '🌍', action: 'Generates complete production-ready code' },
  { planet: 'Jupiter', icon: '♃', action: 'Builds business model & revenue strategy' },
  { planet: 'Saturn', icon: '♄', action: 'Writes documentation, reports & pitch deck' },
  { planet: 'Neptune', icon: '♆', action: 'Runs tests, security scans & QA validation' },
  { planet: 'Uranus', icon: '♅', action: 'Extracts lessons & optimizes for next time' },
  { planet: 'Pluto', icon: '🪐', action: 'Produces Docker, CI/CD & deployment config' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-base">☀️</span>
          </div>
          <div>
            <p className="font-bold text-sm text-zinc-900 leading-none">AIRA OS</p>
            <p className="text-[10px] text-zinc-400 leading-none mt-0.5">Multi-Agent AI</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost text-sm py-2 px-4">Dashboard</Link>
          <Link href="/project/new" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Launch AIRA
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-600">AIRA OS v2.0 — 10-Agent Ecosystem</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[0.92] mb-6 tracking-tighter text-zinc-900">
          AIRA OS
        </h1>

        <p className="text-xl lg:text-2xl font-semibold text-zinc-500 mb-4">
          I don't solve problems alone. I orchestrate intelligence.
        </p>

        <p className="text-base text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          An <span className="font-semibold text-zinc-700">AI Operating System</span> where a central
          intelligence orchestrates <span className="font-semibold text-zinc-700">9 specialized planetary agents</span> — from
          research to deployment — to build complete production-ready projects.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/project/new"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <Brain className="w-4 h-4" />
            Start Building
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/planets"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-all">
            <Globe className="w-4 h-4" />
            View Planets
          </Link>
        </div>
      </section>

      {/* Pipeline */}
      <section className="px-6 py-20 bg-white border-y border-black/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">One Prompt. Full Pipeline.</h2>
            <p className="section-subtitle mx-auto">
              Watch the message flow through the entire organization — event-driven, fully autonomous.
            </p>
          </div>
          <div className="space-y-2">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <span className="text-xl w-8 text-center flex-shrink-0">{step.icon}</span>
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-semibold text-zinc-800">{step.planet}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                <p className="text-sm text-zinc-500 flex-1">{step.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 9 Planets */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">
              The Sun &amp; Its <span className="text-gradient">9 Planets</span>
            </h2>
            <p className="section-subtitle mx-auto">
              Every planet is a specialized AI agent with its own role, personality, and voice.
            </p>
          </div>

          {/* AIRA card */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                ☀️
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <p className="font-bold text-lg text-amber-700">AIRA</p>
                  <span className="badge text-[10px]">CEO · Orchestrator · Kernel</span>
                </div>
                <p className="text-sm leading-relaxed max-w-3xl text-zinc-500">
                  The Central Intelligence Layer. Understands intent, decomposes goals into structured tasks,
                  assigns planets, monitors execution, resolves conflicts, validates quality, and integrates
                  everything into one unified deliverable.
                </p>
                <p className="text-xs italic mt-2.5 text-amber-600/60">&ldquo;I don't solve problems alone. I orchestrate intelligence.&rdquo;</p>
              </div>
            </div>
          </div>

          {/* 9 planets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANETS.map((planet) => {
              const Icon = PLANET_ICONS[planet.id] || Globe
              return (
                <Link key={planet.id} href={`/planets/${planet.id}`}
                  className="group p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 block"
                  style={{ textDecoration: 'none' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                         style={{ background: `${planet.color}10`, border: `1px solid ${planet.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: planet.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</p>
                        <span className="text-[10px]">{planet.symbol}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{planet.role}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed min-h-[52px] text-zinc-500">{planet.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-white border-t border-black/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-10 rounded-3xl gradient-border bg-indigo-50/50">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl bg-indigo-100">
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900">Ready to orchestrate?</h2>
            <p className="text-sm mb-8 text-zinc-500">
              Describe your project. AIRA's nine planets handle research, architecture, design, code,
              business, documentation, testing, evolution, and deployment.
            </p>
            <Link href="/project/new"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Sparkles className="w-4 h-4" />
              Launch AIRA Pipeline
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 px-8 py-6 flex items-center justify-between text-xs text-zinc-400">
        <p>AIRA OS — Multi-Agent AI Orchestration System</p>
        <p>&copy; 2026 Sri D. All rights reserved.</p>
      </footer>
    </div>
  )
}
