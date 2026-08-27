'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Sparkles, Brain, Quote, ChevronRight,
  Zap, Shield, Rocket, Globe, Code2, Layers, Palette,
  FileText, TestTube, TrendingUp, Settings, Star,
} from 'lucide-react'
import { PLANETS, type PlanetId, type PlanetStatus } from '@/types'

const TAGLINES = [
  "I don't solve problems alone.",
  'I orchestrate intelligence.',
  '10 agents. 1 mission.',
  'From idea to production — autonomously.',
]

const DEMO_SEQUENCE: [PlanetId, PlanetStatus, number][] = [
  ['aira', 'active', 400],
  ['mercury', 'active', 1200],
  ['mercury', 'completed', 3200],
  ['mars', 'active', 3600],
  ['mars', 'completed', 5600],
  ['venus', 'active', 6000],
  ['venus', 'completed', 8000],
  ['earth', 'active', 8400],
  ['earth', 'completed', 11000],
  ['jupiter', 'active', 11400],
  ['jupiter', 'completed', 13400],
  ['saturn', 'active', 13800],
  ['saturn', 'completed', 15800],
  ['neptune', 'active', 16200],
  ['neptune', 'completed', 18200],
  ['uranus', 'active', 18600],
  ['uranus', 'completed', 20400],
  ['pluto', 'active', 20800],
  ['pluto', 'completed', 22800],
]

const SCENES = [
  { text: '"Building a great idea takes more than one mind."', delay: 0 },
  { text: '"So we built a team."', delay: 6000 },
  { text: '"One system. Many specialized minds."', delay: 16000 },
  { text: '"One coordinated intelligence."', delay: 22000 },
  { text: '"From an idea… to something you can actually build."', delay: 32000 },
]

const PLANET_ICONS: Record<string, any> = {
  mercury: Globe, mars: Layers, venus: Palette, earth: Code2,
  jupiter: TrendingUp, saturn: FileText, neptune: Shield,
  uranus: Zap, pluto: Rocket,
}

// ─── Neural Network Canvas ────────────────────────────────────────────────────
function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    const cx = canvas.offsetWidth / 2
    const cy = canvas.offsetHeight / 2
    const nodes: { x: number; y: number; r: number; color: string; label: string; angle: number; orbitR: number }[] = []

    nodes.push({ x: cx, y: cy, r: 7, color: '#FFD700', label: 'AIRA', angle: 0, orbitR: 0 })

    const planetColors = ['#B5A9A9', '#CF4B2B', '#E8B86D', '#4B9CD3', '#C8A951', '#A89070', '#4B7BE8', '#7EC8C8', '#9B8EAE']
    const planetNames = ['☿', '♂', '♀', '🌍', '♃', '♄', '♆', '♅', '🪐']
    const orbitRadii = [75, 105, 135, 165, 195, 225, 255, 285, 315]

    planetColors.forEach((color, i) => {
      const angle = (i / planetColors.length) * Math.PI * 2
      nodes.push({
        x: cx + Math.cos(angle) * orbitRadii[i],
        y: cy + Math.sin(angle) * orbitRadii[i],
        r: 3 + Math.random() * 1.5,
        color, label: planetNames[i],
        angle, orbitR: orbitRadii[i],
      })
    })

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('mousemove', handleMouse)

    let time = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      time += 0.003

      nodes.forEach((node, i) => {
        if (i === 0) return
        node.angle += 0.002 + (i * 0.0003)
        node.x = cx + Math.cos(node.angle) * node.orbitR
        node.y = cy + Math.sin(node.angle) * node.orbitR
      })

      // Orbit rings
      orbitRadii.forEach((r) => {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Neural connections
      for (let i = 1; i < nodes.length; i++) {
        const node = nodes[i]
        const progress = (Math.sin(time * 2 + i * 0.7) + 1) / 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(node.x, node.y)
        ctx.strokeStyle = node.color + Math.floor(progress * 35 + 8).toString(16).padStart(2, '0')
        ctx.lineWidth = 0.6
        ctx.stroke()

        const packetProgress = (time * 0.5 + i * 0.1) % 1
        const px = cx + (node.x - cx) * packetProgress
        const py = cy + (node.y - cy) * packetProgress
        ctx.beginPath()
        ctx.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = node.color + '50'
        ctx.fill()
      }

      // Inter-planet connections
      for (let i = 1; i < nodes.length; i++) {
        const j = (i % (nodes.length - 1)) + 1
        if (j !== i) {
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.strokeStyle = 'rgba(255,255,255,0.012)'
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3)
        gradient.addColorStop(0, node.color + '30')
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()
      })

      // Mouse proximity glow
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      if (mx && my) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 80)
        gradient.addColorStop(0, 'rgba(99,102,241,0.04)')
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(mx, my, 80, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  )
}

// ─── Cinematic Hero Section ───────────────────────────────────────────────────
function CinematicHero() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [showText, setShowText] = useState(true)
  const [demoStatuses, setDemoStatuses] = useState<Record<PlanetId, PlanetStatus>>(() =>
    Object.fromEntries(PLANETS.map((p) => [p.id, 'idle'])) as Record<PlanetId, PlanetStatus>
  )

  useEffect(() => {
    const timers = DEMO_SEQUENCE.map(([planet, status, delay]) =>
      setTimeout(() => {
        setDemoStatuses((prev) => ({ ...prev, [planet]: status }))
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setShowText(false)
      setTimeout(() => {
        setSceneIdx((i) => (i + 1) % SCENES.length)
        setShowText(true)
      }, 500)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: '10%', left: '5%' }}
          animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', bottom: '10%', right: '10%' }}
          animate={{ x: [0, -20, 0], y: [0, 12, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Neural network background */}
      <div className="absolute inset-0 opacity-35">
        <NeuralNetwork />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Cinematic text */}
        <div className="h-14 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showText && (
              <motion.p
                key={sceneIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-lg lg:text-xl italic"
                style={{ color: '#52525B' }}
              >
                {SCENES[sceneIdx].text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8"
               style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-500">AIRA OS v2.0 — 10-Agent Ecosystem</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[0.92] mb-6 tracking-tighter">
            <span className="text-gradient">AIRA OS</span>
          </h1>

          <div className="h-10 mb-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={sceneIdx}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                className="text-xl lg:text-2xl font-semibold"
                style={{ color: '#71717A' }}
              >
                {TAGLINES[sceneIdx % TAGLINES.length]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-sm lg:text-base max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: '#52525B' }}>
            AIRA is not a chatbot. It is an{' '}
            <span className="text-white font-semibold">AI Operating System</span> where a central
            intelligence orchestrates{' '}
            <span className="text-white font-semibold">9 specialized planetary agents</span> — from
            research to deployment — to build complete production-ready projects.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/project/new"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-primary"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Brain className="w-4 h-4" />
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/planets"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Globe className="w-4 h-4" style={{ color: '#71717A' }} />
              <span style={{ color: '#A1A1AA' }}>View Planets</span>
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A1A1AA' }}>Dashboard</span>
            </Link>
          </div>
        </motion.div>

        {/* Pipeline visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16"
        >
          <div className="inline-flex items-center gap-2.5 p-3.5 rounded-2xl"
               style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {PLANETS.map((planet) => {
              const status = demoStatuses[planet.id] || 'idle'
              const isActive = status === 'active'
              const isCompleted = status === 'completed'
              return (
                <motion.div
                  key={planet.id}
                  className="flex flex-col items-center gap-1"
                  animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500"
                    style={{
                      background: isActive ? `${planet.color}20` : isCompleted ? `${planet.color}10` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${isActive ? planet.color + '44' : isCompleted ? planet.color + '22' : 'rgba(255,255,255,0.04)'}`,
                      boxShadow: isActive ? `0 0 16px ${planet.color}30` : 'none',
                      color: planet.color,
                    }}
                  >
                    {isCompleted ? '✓' : planet.symbol}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: isActive ? planet.color : '#3F3F46' }}>
                    {planet.name}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [voiceIdx, setVoiceIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setVoiceIdx((i) => i + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const planets = PLANETS.filter((p) => p.id !== 'aira')
  const aira = PLANETS[0]

  return (
    <div className="min-h-screen space-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
           style={{ background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
               style={{ background: 'rgba(255,215,0,0.08)', boxShadow: '0 0 16px rgba(255,215,0,0.08)' }}>
            ☀️
          </div>
          <div>
            <p className="font-bold text-sm leading-none text-white">AIRA OS</p>
            <p className="text-[10px] text-[#3F3F46] leading-none mt-0.5">Multi-Agent AI Operating System</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Link href="/dashboard" className="btn-ghost text-sm py-2 px-4">Dashboard</Link>
          <Link href="/project/new" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Launch AIRA
          </Link>
        </motion.div>
      </nav>

      {/* Cinematic Hero */}
      <CinematicHero />

      {/* Kernel Quote */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-7 h-7 mx-auto mb-5 text-primary opacity-30" />
          <blockquote className="text-lg lg:text-xl font-medium leading-relaxed" style={{ color: '#71717A' }}>
            &ldquo;Think of AIRA as the{' '}
            <span className="text-white font-semibold">kernel of an AI Operating System</span>.
            Just like Windows has the NT Kernel and Linux has the Linux Kernel — AIRA is the kernel of
            AIRA OS. It doesn&apos;t do everything; it{' '}
            <span className="text-primary font-semibold">coordinates everything</span>.&rdquo;
          </blockquote>
          <p className="text-xs mt-4" style={{ color: '#3F3F46' }}>— Sri D, AIRA OS Specification</p>
        </div>
      </section>

      {/* The Sun & 9 Planets */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">
              The Sun &amp; Its <span className="text-gradient">9 Planets</span>
            </h2>
            <p className="section-subtitle mx-auto">
              Every planet is a specialized AI agent with its own role, personality, and voice.
            </p>
          </motion.div>

          {/* AIRA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 p-6 rounded-2xl relative overflow-hidden gradient-border"
            style={{ background: 'rgba(255,215,0,0.02)' }}
          >
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full blur-3xl opacity-[0.07]"
                 style={{ background: '#FFD700' }} />
            <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                   style={{ background: 'rgba(255,215,0,0.08)', boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}>
                ☀️
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <p className="font-bold text-lg text-yellow-500">AIRA</p>
                  <span className="badge text-[10px]">{aira.title}</span>
                </div>
                <p className="text-sm leading-relaxed max-w-3xl" style={{ color: '#71717A' }}>
                  The Central Intelligence Layer. Understands intent, decomposes goals into structured tasks,
                  assigns planets, monitors execution, resolves conflicts, manages shared memory, validates
                  quality, and integrates everything into one unified deliverable.
                </p>
                <p className="text-xs italic mt-2.5" style={{ color: 'rgba(255,215,0,0.5)' }}>&ldquo;{aira.motto}&rdquo;</p>
              </div>
            </div>
          </motion.div>

          {/* 9 planets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planets.map((planet, i) => {
              const Icon = PLANET_ICONS[planet.id] || Globe
              return (
                <motion.div
                  key={planet.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.06 }}
                  className="group p-5 rounded-2xl transition-all duration-300 relative overflow-hidden glass-card"
                >
                  <div
                    className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.1] transition-opacity duration-500"
                    style={{ background: planet.color }}
                  />
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                         style={{ background: `${planet.color}10`, border: `1px solid ${planet.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: planet.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</p>
                        <span className="text-[10px]">{planet.symbol}</span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: '#3F3F46' }}>{planet.title}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed min-h-[52px] relative z-10" style={{ color: '#71717A' }}>
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
                      className="text-[11px] italic mt-2.5 leading-relaxed relative z-10"
                      style={{ color: planet.color, opacity: 0.55 }}
                    >
                      &ldquo;{planet.voice[voiceIdx % planet.voice.length]}&rdquo;
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-3">One Prompt. Full Pipeline.</h2>
            <p className="section-subtitle mx-auto">
              Watch the message flow through the entire organization — event-driven, fully autonomous.
            </p>
          </motion.div>
          <div className="space-y-1.5">
            {PLANETS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3.5 rounded-xl glass-card"
              >
                <span className="text-base w-7 text-center flex-shrink-0">{p.symbol}</span>
                <div className="w-20 flex-shrink-0">
                  <span className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</span>
                </div>
                <p className="text-xs flex-1" style={{ color: '#52525B' }}>
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
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#27272A' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl gradient-border"
            style={{ background: 'rgba(99,102,241,0.025)' }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
                 style={{ background: 'rgba(99,102,241,0.08)' }}>
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to orchestrate?</h2>
            <p className="text-sm mb-8" style={{ color: '#52525B' }}>
              Describe your project. AIRA&apos;s nine planets handle research, architecture, design, code,
              business, documentation, testing, evolution, and deployment.
            </p>
            <Link href="/project/new"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Sparkles className="w-4 h-4" />
              Launch AIRA Pipeline
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-8 py-6 flex items-center justify-between text-xs"
              style={{ color: '#3F3F46' }}>
        <p>AIRA OS — Multi-Agent AI Orchestration System</p>
        <p>&copy; 2026 Sri D. All rights reserved.</p>
      </footer>
    </div>
  )
}
