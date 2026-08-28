'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Sparkles, Brain, Globe, Code2, Layers, Palette,
  FileText, Shield, Rocket, TrendingUp, Zap, Search, ChevronRight,
  CheckCircle, Cpu, Target, Users, BarChart3, Lightbulb,
  ChevronDown, Star, Orbit, Eye, LogIn,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const PLANET_ICONS: Record<string, any> = {
  mercury: Search, mars: Layers, venus: Palette, earth: Code2,
  jupiter: TrendingUp, saturn: FileText, neptune: Shield,
  uranus: Zap, pluto: Rocket,
}

const PLANETS = [
  { id: 'mercury', name: 'Mercury', symbol: '☿', role: 'Research & Intelligence', color: '#9CA3AF', desc: 'Deep research across papers, patents, competitors, and MSME guidelines. Knows everything before anyone starts building.' },
  { id: 'mars', name: 'Mars', symbol: '♂', role: 'Architecture & Planning', color: '#DC2626', desc: 'The CTO. Designs system architecture, databases, AI pipelines, and cloud infrastructure that scales.' },
  { id: 'venus', name: 'Venus', symbol: '♀', role: 'UI/UX & Experience', color: '#D97706', desc: 'Designs the complete human experience — personas, journeys, design systems, branding. Products people love.' },
  { id: 'earth', name: 'Earth', symbol: '🌍', role: 'Development & Engineering', color: '#2563EB', desc: 'The engineering department. Generates production-ready full-stack code — Next.js, FastAPI, databases, everything.' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', role: 'Business Strategy', color: '#B45309', desc: 'Turns feasible ideas into viable businesses — market analysis, pricing, revenue models, investor pitches.' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', role: 'Documentation', color: '#92400E', desc: 'Transforms project intelligence into professional documentation, technical reports, and presentation decks.' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', role: 'Quality Assurance', color: '#2563EB', desc: 'Validates everything — tests, security scans, performance benchmarks. Trust is earned through testing.' },
  { id: 'uranus', name: 'Uranus', symbol: '♅', role: 'Meta-Evolution', color: '#0D9488', desc: 'Learns from every mission. Optimizes prompts, workflows, and architectures. Gets better every time.' },
  { id: 'pluto', name: 'Pluto', symbol: '🪐', role: 'Deployment & Operations', color: '#7C3AED', desc: 'Ships to production — Docker, CI/CD, cloud provisioning, monitoring. Deployment is just the beginning.' },
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

const FEATURES = [
  {
    icon: Orbit,
    title: 'Solar System Visualization',
    desc: 'Watch all 10 AI agents work in real-time with animated orbits, live status updates, and personality-driven messages.',
    color: '#8B5A2B',
  },
  {
    icon: Cpu,
    title: 'Multi-Agent Orchestration',
    desc: 'AIRA coordinates 9 specialized planets using LangGraph — each agent owns its domain, collaborating autonomously.',
    color: '#DC2626',
  },
  {
    icon: Code2,
    title: 'Full-Stack Code Generation',
    desc: 'Earth generates complete Next.js + FastAPI applications with routing, components, API endpoints, and database schemas.',
    color: '#2563EB',
  },
  {
    icon: Eye,
    title: 'Live Preview In-Browser',
    desc: 'Test the generated app instantly — boot the frontend and backend on independent ports, interact with the real product.',
    color: '#0D9488',
  },
  {
    icon: Shield,
    title: 'Deterministic Fallbacks',
    desc: 'If LLM fails, guaranteed fallback generators keep the mission going. AIRA always completes — no matter what.',
    color: '#7C3AED',
  },
  {
    icon: Rocket,
    title: 'Production-Ready Output',
    desc: 'Get Docker configs, CI/CD pipelines, deployment guides, and complete documentation. Ship with confidence.',
    color: '#B45309',
  },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Describe Your Vision',
    desc: 'Tell AIRA what you want to build. A healthcare app? A manufacturing platform? An AI assistant? Be as detailed as you like.',
    icon: Lightbulb,
    color: '#8B5A2B',
  },
  {
    step: 2,
    title: 'AIRA Decomposes Tasks',
    desc: 'AIRA analyzes your request, understands the domain, assigns specialized tasks to each of the 9 planets, and creates a mission plan.',
    icon: Brain,
    color: '#FFD700',
  },
  {
    step: 3,
    title: 'Planets Execute in Sequence',
    desc: 'Each planet works independently: Mercury researches, Mars architects, Venus designs, Earth builds code, Jupiter strategizes, and so on.',
    icon: Globe,
    color: '#2563EB',
  },
  {
    step: 4,
    title: 'Deliver Complete Project',
    desc: 'AIRA validates everything, generates a final summary with quality scores, and delivers research, architecture, code, docs, and deployment configs.',
    icon: CheckCircle,
    color: '#10B981',
  },
]

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0)
  const { user } = useAuthStore()

  useEffect(() => {
    useAuthStore.getState().loadFromStorage()
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#FFFCF9]/80 backdrop-blur-xl border-b border-[#2C2420]/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5A2B] to-[#6B3F1F] flex items-center justify-center shadow-sm">
            <span className="text-base">☀️</span>
          </div>
          <div>
            <p className="font-bold text-sm text-[#2C2420] leading-none">AIRA OS</p>
            <p className="text-[10px] text-[#A19B95] leading-none mt-0.5">Multi-Agent AI</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost text-sm py-2 px-4">Dashboard</Link>
              <Link href="/project/new" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Launch AIRA
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5A2B]/5 border border-[#8B5A2B]/10 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span className="text-xs font-medium text-[#8B5A2B]">AIRA OS v2.0 — 10-Agent Ecosystem</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[0.92] mb-6 tracking-tighter text-[#2C2420]">
            <span className="text-gradient">AIRA</span> OS
          </h1>

          <p className="text-xl lg:text-2xl font-semibold text-[#716B65] mb-4">
            I don&apos;t solve problems alone. I orchestrate intelligence.
          </p>

          <p className="text-base text-[#A19B95] max-w-2xl mx-auto mb-12 leading-relaxed">
            An <span className="font-semibold text-[#5A544E]">AI Operating System</span> where a central
            intelligence orchestrates <span className="font-semibold text-[#5A544E]">9 specialized planetary agents</span> — from
            research to deployment — to build complete production-ready projects. One prompt. Full pipeline. Every time.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href={user ? '/project/new' : '/register'}
              className="btn-primary inline-flex items-center gap-2.5 text-sm py-3.5 px-7">
              <Brain className="w-4 h-4" />
              {user ? 'Start Building' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/planets"
              className="btn-secondary inline-flex items-center gap-2 text-sm py-3.5 px-7">
              <Globe className="w-4 h-4" />
              View Planets
            </Link>
          </div>
        </motion.div>

        {/* Decorative orbiting elements */}
        <div className="absolute top-10 left-10 w-32 h-32 opacity-[0.04] pointer-events-none">
          <div className="w-full h-full rounded-full border border-[#8B5A2B] animate-[spin_20s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#8B5A2B]" />
          </div>
        </div>
        <div className="absolute bottom-10 right-10 w-48 h-48 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full rounded-full border border-[#8B5A2B] animate-[spin_30s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#DC2626]" />
          </div>
        </div>
      </section>

      {/* What is AIRA OS */}
      <section className="px-6 py-20 bg-[#FFFCF9] border-y border-[#2C2420]/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">
              What is <span className="text-gradient">AIRA OS</span>?
            </h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              A multi-agent AI system that doesn&apos;t just answer questions — it builds entire products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: 'Central Intelligence',
                desc: 'AIRA (the sun) understands your vision, decomposes it into structured tasks, and assigns each to the right specialized agent. It orchestrates the entire pipeline from idea to deployment.',
                color: '#8B5A2B',
              },
              {
                icon: Users,
                title: '9 Specialized Planets',
                desc: 'Each planet is an AI agent with its own personality, expertise, and voice. Mercury researches, Mars architects, Venus designs, Earth builds code — and they all collaborate autonomously.',
                color: '#DC2626',
              },
              {
                icon: Target,
                title: 'Complete Deliverables',
                desc: 'From a single prompt, you get research reports, system architecture, design systems, production-ready source code, business plans, documentation, QA reports, and deployment configs.',
                color: '#2563EB',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-[#2C2420]/6 hover:border-[#2C2420]/12 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-base mb-2 text-[#2C2420]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#716B65]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Visual Step Flow */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">How It Works</h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              From idea to production in four steps. AIRA handles everything.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-5 rounded-2xl text-center transition-all duration-300 ${
                  activeStep === i
                    ? 'bg-white border-2 shadow-lg'
                    : 'bg-white/50 border border-[#2C2420]/6'
                }`}
                style={{
                  borderColor: activeStep === i ? `${step.color}40` : undefined,
                }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg"
                     style={{
                       background: activeStep === i ? `${step.color}15` : '#F5F0EB',
                       border: `2px solid ${activeStep === i ? step.color : '#E4DDD5'}`,
                       transition: 'all 0.3s',
                     }}>
                  <step.icon className="w-5 h-5" style={{ color: activeStep === i ? step.color : '#A19B95' }} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1"
                     style={{ color: activeStep === i ? step.color : '#D4C8BC' }}>
                  Step {step.step}
                </div>
                <h3 className="font-bold text-sm mb-1.5 text-[#2C2420]">{step.title}</h3>
                <p className="text-xs leading-relaxed text-[#716B65]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Pipeline */}
      <section className="px-6 py-20 bg-[#FFFCF9] border-y border-[#2C2420]/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-3">One Prompt. <span className="text-gradient">Full Pipeline.</span></h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              Watch the message flow through the entire organization — event-driven, fully autonomous.
            </p>
          </motion.div>
          <div className="space-y-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#EDE5DC] hover:bg-[#E4DCD4] transition-colors group"
              >
                <span className="text-xl w-8 text-center flex-shrink-0 group-hover:scale-110 transition-transform">{step.icon}</span>
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-semibold text-[#2C2420]">{step.planet}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A19B95] flex-shrink-0 group-hover:text-[#8B5A2B] transition-colors" />
                <p className="text-sm text-[#716B65] flex-1">{step.action}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">Why <span className="text-gradient">AIRA OS</span></h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              Built for speed, resilience, and real-world deliverables.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-5 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/6 hover:border-[#2C2420]/12 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                     style={{ background: `${feat.color}10`, border: `1px solid ${feat.color}20` }}>
                  <feat.icon className="w-4 h-4" style={{ color: feat.color }} />
                </div>
                <h3 className="font-bold text-sm mb-1.5 text-[#2C2420]">{feat.title}</h3>
                <p className="text-xs leading-relaxed text-[#716B65]">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The 9 Planets */}
      <section className="px-6 py-20 bg-[#FFFCF9] border-y border-[#2C2420]/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">
              The Sun &amp; Its <span className="text-gradient">9 Planets</span>
            </h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              Every planet is a specialized AI agent with its own role, personality, and voice.
            </p>
          </motion.div>

          {/* AIRA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#8B5A2B]/5 to-[#D4A574]/10 border border-[#8B5A2B]/10"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5A2B] to-[#6B3F1F] flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                ☀️
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <p className="font-bold text-lg text-[#8B5A2B]">AIRA</p>
                  <span className="badge text-[10px]">CEO · Orchestrator · Kernel</span>
                </div>
                <p className="text-sm leading-relaxed max-w-3xl text-[#716B65]">
                  The Central Intelligence Layer. Understands intent, decomposes goals into structured tasks,
                  assigns planets, monitors execution, resolves conflicts, validates quality, and integrates
                  everything into one unified deliverable. The sun around which all 9 planets orbit.
                </p>
                <p className="text-xs italic mt-2.5 text-[#8B5A2B]/60">&ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;</p>
              </div>
            </div>
          </motion.div>

          {/* 9 planets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANETS.map((planet, i) => {
              const Icon = PLANET_ICONS[planet.id] || Globe
              return (
                <motion.div
                  key={planet.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link href={`/planets/${planet.id}`}
                    className="group p-5 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/8 hover:border-[#2C2420]/15 hover:shadow-md transition-all duration-200 block"
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
                        <p className="text-[11px] text-[#A19B95] truncate">{planet.role}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed min-h-[52px] text-[#716B65]">{planet.desc}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-3">Built With <span className="text-gradient">Modern Tech</span></h2>
            <p className="section-subtitle mx-auto text-[#716B65]">
              Every layer is powered by proven, battle-tested technologies.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Next.js 14', sub: 'Frontend', color: '#000' },
              { label: 'FastAPI', sub: 'Backend', color: '#009688' },
              { label: 'LangGraph', sub: 'Orchestration', color: '#6366F1' },
              { label: 'Gemini 2.5', sub: 'LLM Engine', color: '#4285F4' },
              { label: 'Tailwind', sub: 'Styling', color: '#06B6D4' },
              { label: 'Docker', sub: 'Containerization', color: '#2496ED' },
              { label: 'Zustand', sub: 'State Mgmt', color: '#443E38' },
              { label: 'TypeScript', sub: 'Type Safety', color: '#3178C6' },
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white border border-[#2C2420]/6 text-center hover:shadow-sm transition-all"
              >
                <p className="font-bold text-sm text-[#2C2420]">{tech.label}</p>
                <p className="text-[11px] text-[#A19B95] mt-0.5">{tech.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-[#FFFCF9] border-t border-[#2C2420]/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-10 rounded-3xl gradient-border bg-[#8B5A2B]/5"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl bg-[#8B5A2B]/10">
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#2C2420]">Ready to orchestrate?</h2>
            <p className="text-sm mb-8 text-[#716B65]">
              Describe your project. AIRA&apos;s nine planets handle research, architecture, design, code,
              business, documentation, testing, evolution, and deployment.
            </p>
            <Link href={user ? '/project/new' : '/register'}
              className="btn-primary inline-flex items-center gap-2.5 text-sm py-3.5 px-7">
              <Sparkles className="w-4 h-4" />
              {user ? 'Launch AIRA Pipeline' : 'Get Started Free'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2C2420]/5 px-8 py-6 flex items-center justify-between text-xs text-[#A19B95]">
        <p>AIRA OS — Multi-Agent AI Orchestration System</p>
        <p>&copy; 2026 Sri D. All rights reserved.</p>
      </footer>
    </div>
  )
}
