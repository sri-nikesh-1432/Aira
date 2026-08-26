'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { SolarSystem } from '@/components/planets/SolarSystem'
import {
  ArrowRight, Sparkles, Brain, Quote,
} from 'lucide-react'
import { PLANETS, type PlanetId, type PlanetStatus } from '@/types'

const TAGLINES = [
  "I don't solve problems alone.",
  'I orchestrate intelligence.',
  '10 agents. 1 mission.',
  'Research. Architect. Design. Build. Fund. Document. Test. Evolve. Deploy.',
]

// Full mission sequence — every planet lights up in pipeline order
const DEMO_SEQUENCE: [PlanetId, PlanetStatus, number][] = [
  ['aira', 'active', 600],
  ['mercury', 'active', 1600],
  ['mercury', 'completed', 4200],
  ['mars', 'active', 4600],
  ['mars', 'completed', 6800],
  ['venus', 'active', 7200],
  ['venus', 'completed', 9200],
  ['earth', 'active', 9600],
  ['earth', 'completed', 12600],
  ['jupiter', 'active', 13000],
  ['jupiter', 'completed', 15000],
  ['saturn', 'active', 15400],
  ['saturn', 'completed', 17400],
  ['neptune', 'active', 17800],
  ['neptune', 'completed', 20000],
  ['uranus', 'active', 20400],
  ['uranus', 'completed', 22200],
  ['pluto', 'active', 22600],
  ['pluto', 'completed', 24800],
]

export default function LandingPage() {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [demoStatuses, setDemoStatuses] = useState<Record<PlanetId, PlanetStatus>>(() =>
    Object.fromEntries(PLANETS.map((p) => [p.id, 'idle'])) as Record<PlanetId, PlanetStatus>
  )
  const [voiceIdx, setVoiceIdx] = useState(0)

  useEffect(() => {
    const timers = DEMO_SEQUENCE.map(([planet, status, delay]) =>
      setTimeout(() => {
        setDemoStatuses((prev) => ({ ...prev, [planet]: status }))
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTaglineIdx((i) => (i + 1) % TAGLINES.length), 2600)
    return () => clearInterval(t)
  }, [])

  // Rotate every planet's voice line together
  useEffect(() => {
    const t = setInterval(() => setVoiceIdx((i) => i + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const planets = PLANETS.filter((p) => p.id !== 'aira')
  const aira = PLANETS[0]

  return (
    <div className="min-h-screen space-bg overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl" style={{ background: '#6366F1' }} />
        <div className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl" style={{ background: '#10B981' }} />
        <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] rounded-full opacity-[0.05] blur-3xl" style={{ background: '#FFD700' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-border">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: 'rgba(255,215,0,0.1)', boxShadow: '0 0 20px rgba(255,215,0,0.15)' }}>
            ☀️
          </div>
          <div>
            <p className="font-bold text-base leading-none">AIRA OS</p>
            <p className="text-xs text-text-muted leading-none mt-0.5">Multi-Agent AI Operating System</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
          <Link href="/project/new" className="btn-primary text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Launch AIRA
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8" style={{ color: '#FFD700' }}>
            <Sparkles className="w-4 h-4" />
            AIRA Core v2.0 — 10-Agent Ecosystem
          </div>

          <h1 className="text-6xl lg:text-7xl font-extrabold leading-none mb-6">
            <span className="text-gradient">AIRA OS</span>
          </h1>

          <div className="h-8 mb-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-2xl font-semibold text-text-secondary"
              >
                {TAGLINES[taglineIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10">
            AIRA is not a chatbot. It is an{' '}
            <span className="text-white font-semibold">AI Operating System</span> where a central
            intelligence orchestrates{' '}
            <span className="text-white font-semibold">9 specialized planetary agents</span> — from
            research to deployment — to build complete production-ready projects.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/project/new" className="btn-primary flex items-center gap-3 text-base px-8 py-4">
              <Brain className="w-5 h-5" />
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-border hover:border-primary/30 font-semibold transition-all text-base">
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Solar System demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-12 flex justify-center"
        >
          <SolarSystem planetStatuses={demoStatuses} size="lg" />
        </motion.div>
      </section>

      {/* Kernel quote */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-8 h-8 mx-auto mb-4 text-primary opacity-60" />
          <blockquote className="text-xl font-medium text-text-secondary italic">
            "Think of AIRA as the{' '}
            <span className="text-white not-italic font-semibold">kernel of an AI Operating System</span>.
            Just like Windows has the NT Kernel and Linux has the Linux Kernel — AIRA is the kernel of
            AIRA OS. It doesn't do everything; it{' '}
            <span className="text-primary not-italic">coordinates everything</span>."
          </blockquote>
          <p className="text-text-muted text-sm mt-3">— Sri D, AIRA OS Specification</p>
        </div>
      </section>

      {/* AIRA card */}
      <section className="relative z-10 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-4"
          >
            The Sun &amp; Its <span className="text-gradient">9 Planets</span>
          </motion.h2>
          <p className="text-center text-text-muted mb-12">
            Every planet is a specialized AI agent with its own role, personality, and voice.
          </p>

          {/* AIRA feature card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="mb-6 p-8 rounded-3xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,165,0,0.03))',
              borderColor: 'rgba(255,215,0,0.25)',
            }}
          >
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#FFD700' }} />
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                   style={{ background: 'rgba(255,215,0,0.12)', boxShadow: '0 0 40px rgba(255,215,0,0.25)' }}>
                ☀️
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-xl text-aira">AIRA</p>
                  <span className="badge bg-white/5 text-text-secondary border border-border">{aira.title}</span>
                </div>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed max-w-3xl">
                  The Central Intelligence Layer. Understands intent, decomposes goals into structured tasks,
                  assigns planets, monitors execution, resolves conflicts, manages shared memory, validates
                  quality, and integrates everything into one unified deliverable.
                </p>
                <p className="text-sm italic text-aira/80 mt-3">"{aira.motto}"</p>
              </div>
            </div>
          </motion.div>

          {/* 9 planets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {planets.map((planet, i) => (
              <motion.div
                key={planet.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-2xl glass border border-border hover:border-opacity-60 transition-all cursor-default relative overflow-hidden"
              >
                <div
                  className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: planet.color }}
                />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                       style={{ background: `${planet.color}15`, boxShadow: `inset 0 0 0 1px ${planet.color}33` }}>
                    {planet.symbol}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold" style={{ color: planet.color }}>{planet.name}</p>
                    <p className="text-xs text-text-muted truncate">{planet.title}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed min-h-[60px] relative z-10">
                  {planet.role === 'Research & Intelligence' && 'Deep research across papers, patents, competitors, MSME guidelines, APIs and datasets — builds organizational knowledge before anything is built.'}
                  {planet.role === 'Architecture & Planning' && 'The CTO. Designs system architecture, databases, AI pipelines, cloud infrastructure and the engineering blueprint Earth builds from.'}
                  {planet.role === 'UI/UX & Experience' && 'Designs the complete human experience — personas, journeys, design systems, branding, accessibility and beautiful interfaces.'}
                  {planet.role === 'Development & Engineering' && 'The engineering department. Generates production-ready full-stack code, authentication, databases, Docker config and README.'}
                  {planet.role === 'Business Strategy' && 'Turns feasible ideas into viable businesses — market analysis, pricing, revenue forecasts, investor pitch and go-to-market strategy.'}
                  {planet.role === 'Documentation' && 'Transforms project intelligence into professional documentation — technical reports, PPTs, judge preparation and user manuals.'}
                  {planet.role === 'Quality Assurance & Security' && 'Validates everything — unit/integration tests, security scans, performance, accessibility, hallucination checks and production readiness.'}
                  {planet.role === 'Meta-Evolution & Learning' && 'Learns from every mission. Optimizes prompts, workflows and architectures so the next project is faster, smarter and safer.'}
                  {planet.role === 'Deployment & Operations' && 'Ships it to the real world — Docker, CI/CD, cloud provisioning, monitoring, auto-scaling and continuous operations.'}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={voiceIdx % planet.voice.length}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs italic mt-3 leading-relaxed relative z-10"
                    style={{ color: planet.color, opacity: 0.75 }}
                  >
                    "{planet.voice[voiceIdx % planet.voice.length]}"
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">One Prompt. Full Pipeline.</h2>
          <p className="text-center text-text-muted mb-10">
            Watch the message flow through the entire organization — event-driven, fully autonomous.
          </p>
          <div className="space-y-2">
            {PLANETS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl glass border border-border hover:border-white/15 transition-all"
              >
                <span className="text-xl w-10 text-center flex-shrink-0">{p.symbol}</span>
                <div className="w-28 flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</span>
                </div>
                <p className="text-xs text-text-muted flex-1">
                  {p.id === 'aira' && 'Understands your goal · decomposes tasks · assigns planets · final validation'}
                  {p.id === 'mercury' && 'Research domain, competitors, patents, MSME rules → Research Package'}
                  {p.id === 'mars' && 'Design architecture, database schema, API design → Technical Blueprint'}
                  {p.id === 'venus' && 'Create design system, UI kit, brand identity → Experience Package'}
                  {p.id === 'earth' && 'Generate complete source code, Docker, README → Working Product'}
                  {p.id === 'jupiter' && 'Business model, pricing, revenue forecast → Startup Strategy'}
                  {p.id === 'saturn' && 'Technical report, pitch deck, judge prep → Documentation Suite'}
                  {p.id === 'neptune' && 'Test suites, security scan, QA score → Production Approval'}
                  {p.id === 'uranus' && 'Extract lessons, optimize prompts → Evolution Report'}
                  {p.id === 'pluto' && 'CI/CD, cloud deploy, monitoring → Live Production System'}
                </p>
                {i < PLANETS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="p-10 rounded-3xl glass border border-primary/20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
              🚀
            </div>
            <h2 className="text-3xl font-bold mb-3">Ready to orchestrate?</h2>
            <p className="text-text-muted mb-8">
              Describe your project. AIRA's nine planets handle research, architecture, design, code,
              business, documentation, testing, evolution, and deployment.
            </p>
            <Link href="/project/new" className="btn-primary inline-flex items-center gap-3 text-base px-8 py-4">
              <Sparkles className="w-5 h-5" />
              Launch AIRA Pipeline
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between text-sm text-text-muted">
        <p>AIRA OS — Multi-Agent AI Orchestration System</p>
        <p>© 2026 Sri D. All rights reserved.</p>
      </footer>
    </div>
  )
}
