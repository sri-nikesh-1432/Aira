'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Globe, Sparkles, ChevronRight, Brain,
  Layers, Palette, Code2, TrendingUp, FileText, Shield,
  Zap, Rocket, Search,
} from 'lucide-react'
import { PLANETS, type PlanetId, type PlanetStatus } from '@/types'
import { checkHealth } from '@/lib/api'
import { clsx } from 'clsx'

const PLANET_ICONS: Record<string, any> = {
  mercury: Search, mars: Layers, venus: Palette, earth: Code2,
  jupiter: TrendingUp, saturn: FileText, neptune: Shield,
  uranus: Zap, pluto: Rocket,
}

const PLANET_DETAILED_INFO: Record<string, {
  description: string
  capabilities: string[]
  outputs: string[]
  connections: string[]
  processSteps: string[]
}> = {
  mercury: {
    description: 'Mercury is the Research & Intelligence planet. Before any innovation begins, Mercury deeply understands the problem space, market, competitors, and technology landscape.',
    capabilities: ['Domain Research', 'Competitor Analysis', 'Market Sizing', 'Technology Scouting', 'Patent Research', 'MSME Compliance'],
    outputs: ['Research_Report.md', 'MSME_Compliance.md', 'Technology_Report.md', 'Competitor_Analysis.md'],
    connections: ['mars', 'venus', 'jupiter'],
    processSteps: ['Analyze project domain', 'Research competitors & patents', 'Evaluate MSME alignment', 'Recommend tech stack', 'Deliver intelligence package'],
  },
  mars: {
    description: 'Mars is the Architecture & Planning planet — the CTO of AIRA OS. It transforms research into engineering blueprints, designing the complete technical system.',
    capabilities: ['System Architecture', 'Database Schema', 'API Design', 'AI Pipeline Design', 'Security Architecture', 'Folder Structure'],
    outputs: ['Architecture.md', 'API_Design.md', 'Database_Schema.md'],
    connections: ['mercury', 'venus', 'earth'],
    processSteps: ['Design system components', 'Create database schema', 'Design API endpoints', 'Plan AI pipeline', 'Deliver technical blueprint'],
  },
  venus: {
    description: 'Venus is the UI/UX & Experience planet. It designs everything users see, touch, and feel — from brand identity to pixel-perfect interfaces.',
    capabilities: ['Design System', 'Brand Identity', 'User Personas', 'Screen Layouts', 'Component Library', 'Animation Design'],
    outputs: ['Design_System.md', 'Brand_Guide.md', 'Screen_Designs.md', 'Component_Library.md'],
    connections: ['mars', 'earth', 'saturn'],
    processSteps: ['Define brand identity', 'Create color palette & typography', 'Design component system', 'Map user journeys', 'Deliver experience package'],
  },
  earth: {
    description: 'Earth is the Development & Engineering planet. It takes architecture and design, and builds the actual product — complete, working, production-ready code.',
    capabilities: ['Full-Stack Code Generation', 'Frontend (Next.js)', 'Backend (FastAPI)', 'Database Integration', 'Authentication', 'Docker Config'],
    outputs: ['frontend/src/app/page.tsx', 'backend/main.py', 'docker-compose.yml', 'README.md'],
    connections: ['mars', 'venus', 'neptune', 'pluto'],
    processSteps: ['Generate project structure', 'Build frontend with Next.js', 'Build backend with FastAPI', 'Add auth & database', 'Create Docker configuration'],
  },
  jupiter: {
    description: 'Jupiter is the Business Strategy planet. It transforms technically feasible projects into commercially viable businesses with clear paths to revenue.',
    capabilities: ['Business Model', 'Market Analysis', 'Revenue Strategy', 'Financial Projections', 'Go-to-Market Plan', 'Investor Pitch'],
    outputs: ['Business_Plan.md', 'Revenue_Model.md', 'Market_Analysis.md'],
    connections: ['mercury', 'saturn', 'pluto'],
    processSteps: ['Define business model', 'Analyze market opportunity', 'Create pricing strategy', 'Build financial projections', 'Deliver startup strategy'],
  },
  saturn: {
    description: 'Saturn is the Documentation planet. It transforms complex systems into clear, professional documentation that anyone can understand.',
    capabilities: ['Technical Reports', 'Judge Preparation', 'Presentation Deck', 'User Manuals', 'API Documentation', 'Compliance Docs'],
    outputs: ['Technical_Report.md', 'Judge_Preparation.md', 'Presentation_Outline.md'],
    connections: ['venus', 'jupiter', 'neptune'],
    processSteps: ['Write executive summary', 'Create technical overview', 'Prepare judge Q&A', 'Build presentation outline', 'Deliver documentation suite'],
  },
  neptune: {
    description: 'Neptune is the Quality Assurance planet. It validates everything — ensuring every product is correct, secure, and production-ready.',
    capabilities: ['Test Strategy', 'Security Audit', 'Performance Testing', 'Accessibility Check', 'AI Validation', 'Production Readiness'],
    outputs: ['QA_Report.md', 'Security_Report.md', 'Test_Plan.md'],
    connections: ['earth', 'saturn', 'uranus'],
    processSteps: ['Design test strategy', 'Run security checks', 'Validate AI outputs', 'Benchmark performance', 'Deliver production approval'],
  },
  uranus: {
    description: 'Uranus is the Meta-Evolution planet. It learns from every mission, optimizing prompts, workflows, and architectures for future projects.',
    capabilities: ['Pattern Recognition', 'Prompt Optimization', 'Workflow Improvement', 'Architecture Learning', 'Privacy-First Evolution'],
    outputs: ['Evolution_Report.md', 'Optimization_Insights.md'],
    connections: ['neptune', 'pluto', 'mercury'],
    processSteps: ['Analyze mission patterns', 'Extract optimization insights', 'Improve prompt strategies', 'Learn architecture patterns', 'Deliver evolution report'],
  },
  pluto: {
    description: 'Pluto is the Deployment & Operations planet. It ships code to production — Docker, CI/CD, cloud provisioning, and continuous operations.',
    capabilities: ['Docker Config', 'CI/CD Pipeline', 'Cloud Deployment', 'Monitoring Setup', 'Auto-scaling', 'Health Checks'],
    outputs: ['Deployment_Guide.md', '.github/workflows/deploy.yml', 'Production_Checklist.md'],
    connections: ['earth', 'jupiter', 'uranus'],
    processSteps: ['Create Docker configuration', 'Set up CI/CD pipeline', 'Configure cloud deployment', 'Set up monitoring', 'Deliver production system'],
  },
}

// ─── Neural Network Canvas ────────────────────────────────────────────────────
function PlanetsNeuralNetwork({ onSelect, selectedPlanet }: {
  onSelect: (id: PlanetId) => void
  selectedPlanet: PlanetId | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [hovered, setHovered] = useState<PlanetId | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.setTransform(2, 0, 0, 2, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    const cx = W / 2
    const cy = H / 2

    // Planet positions in a beautiful orbital layout
    const planets = PLANETS.filter(p => p.id !== 'aira')
    const planetNodes = planets.map((p, i) => {
      const angle = (i / planets.length) * Math.PI * 2 - Math.PI / 2
      const orbitR = Math.min(W, H) * 0.35
      return {
        id: p.id,
        x: cx + Math.cos(angle) * orbitR,
        y: cy + Math.sin(angle) * orbitR,
        baseAngle: angle,
        color: p.color,
        name: p.name,
        symbol: p.symbol,
        r: 14,
        active: false,
      }
    })

    const airaNode = { x: cx, y: cy, r: 22, color: '#FFD700' }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let found: PlanetId | null = null
      // Check AIRA
      const dx = mx - airaNode.x
      const dy = my - airaNode.y
      if (dx * dx + dy * dy < (airaNode.r + 10) ** 2) return

      for (const node of planetNodes) {
        const dx = mx - node.x
        const dy = my - node.y
        if (dx * dx + dy * dy < (node.r + 8) ** 2) {
          found = node.id as PlanetId
          break
        }
      }
      setHovered(found)
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      for (const node of planetNodes) {
        const dx = mx - node.x
        const dy = my - node.y
        if (dx * dx + dy * dy < (node.r + 8) ** 2) {
          onSelect(node.id as PlanetId)
          return
        }
      }
      // Check AIRA
      const adx = mx - airaNode.x
      const ady = my - airaNode.y
      if (adx * adx + ady * ady < (airaNode.r + 10) ** 2) {
        onSelect('aira')
      }
    }

    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    let time = 0
    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.005

      // Draw orbit rings
      planetNodes.forEach((node, i) => {
        const orbitR = Math.min(W, H) * 0.35 * ((i + 1) / planetNodes.length * 0.3 + 0.7)
        ctx.beginPath()
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Draw neural connections from AIRA to each planet
      planetNodes.forEach((node, i) => {
        const isHovered = hovered === node.id
        const isSelected = selectedPlanet === node.id
        const isActive = isHovered || isSelected

        // Connection line
        ctx.beginPath()
        ctx.moveTo(airaNode.x, airaNode.y)

        // Curved connection
        const midX = (airaNode.x + node.x) / 2
        const midY = (airaNode.y + node.y) / 2
        const ctrlX = midX + Math.sin(time + i) * 15
        const ctrlY = midY + Math.cos(time + i) * 15

        ctx.quadraticCurveTo(ctrlX, ctrlY, node.x, node.y)
        ctx.strokeStyle = isActive ? node.color + '80' : node.color + '20'
        ctx.lineWidth = isActive ? 2 : 1
        ctx.stroke()

        // Data packet animation
        const t = (time * 0.3 + i * 0.15) % 1
        const px = (1 - t) * (1 - t) * airaNode.x + 2 * (1 - t) * t * ctrlX + t * t * node.x
        const py = (1 - t) * (1 - t) * airaNode.y + 2 * (1 - t) * t * ctrlY + t * t * node.y

        ctx.beginPath()
        ctx.arc(px, py, isActive ? 3 : 2, 0, Math.PI * 2)
        ctx.fillStyle = node.color + (isActive ? 'CC' : '66')
        ctx.fill()

        // Inter-planet connections
        planetNodes.forEach((other, j) => {
          if (j <= i) return
          const connections = PLANET_DETAILED_INFO[node.id]?.connections || []
          if (connections.includes(other.id)) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = 'rgba(255,255,255,0.03)'
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // Draw planet nodes
      planetNodes.forEach((node, i) => {
        const isHovered = hovered === node.id
        const isSelected = selectedPlanet === node.id
        const isActive = isHovered || isSelected
        const r = isActive ? node.r + 4 : node.r

        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5)
        glow.addColorStop(0, node.color + (isActive ? '35' : '15'))
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Orbit ring
        if (isActive) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2)
          ctx.strokeStyle = node.color + '55'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])
        }

        // Core
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r)
        grad.addColorStop(0, node.color)
        grad.addColorStop(1, node.color + 'AA')
        ctx.fillStyle = grad
        ctx.fill()

        // Name label
        ctx.font = `${isActive ? '600' : '500'} ${isActive ? 12 : 11}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillStyle = isActive ? '#FAFAFA' : '#71717A'
        ctx.fillText(node.name, node.x, node.y + r + 18)
      })

      // Draw AIRA core
      const airaGlow = ctx.createRadialGradient(airaNode.x, airaNode.y, 0, airaNode.x, airaNode.y, airaNode.r * 3)
      airaGlow.addColorStop(0, 'rgba(255,215,0,0.2)')
      airaGlow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(airaNode.x, airaNode.y, airaNode.r * 3, 0, Math.PI * 2)
      ctx.fillStyle = airaGlow
      ctx.fill()

      // AIRA pulse ring
      const pulseR = airaNode.r + 8 + Math.sin(time * 2) * 4
      ctx.beginPath()
      ctx.arc(airaNode.x, airaNode.y, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,215,0,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // AIRA core
      ctx.beginPath()
      ctx.arc(airaNode.x, airaNode.y, airaNode.r, 0, Math.PI * 2)
      const airaGrad = ctx.createRadialGradient(
        airaNode.x - airaNode.r * 0.3, airaNode.y - airaNode.r * 0.3, 0,
        airaNode.x, airaNode.y, airaNode.r
      )
      airaGrad.addColorStop(0, '#FFD700')
      airaGrad.addColorStop(1, '#FFA500')
      ctx.fillStyle = airaGrad
      ctx.fill()

      // AIRA label
      ctx.font = '700 13px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFD700'
      ctx.fillText('AIRA', airaNode.x, airaNode.y + airaNode.r + 20)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('click', handleClick)
    }
  }, [hovered, selectedPlanet, onSelect])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  )
}

// ─── Planet Detail Panel ──────────────────────────────────────────────────────
function PlanetDetailPanel({ planetId, onClose }: { planetId: PlanetId; onClose: () => void }) {
  const planet = PLANETS.find(p => p.id === planetId)
  const info = PLANET_DETAILED_INFO[planetId]
  if (!planet || !info) return null

  const Icon = PLANET_ICONS[planetId] || Globe

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-[420px] flex-shrink-0 h-full overflow-y-auto border-l border-white/[0.06] p-6"
      style={{ background: 'rgba(9,9,11,0.6)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
               style={{ background: `${planet.color}15`, border: `1px solid ${planet.color}30` }}>
            {planet.symbol}
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: planet.color }}>{planet.name}</h2>
            <p className="text-xs" style={{ color: '#71717A' }}>{planet.title}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: '#52525B' }}>
          ✕
        </button>
      </div>

      {/* Motto */}
      <div className="p-4 rounded-xl mb-6" style={{ background: `${planet.color}08`, border: `1px solid ${planet.color}15` }}>
        <p className="text-sm italic" style={{ color: planet.color, opacity: 0.8 }}>"{planet.motto}"</p>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>About</h3>
        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{info.description}</p>
      </div>

      {/* Capabilities */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Capabilities</h3>
        <div className="flex flex-wrap gap-2">
          {info.capabilities.map((cap, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: `${planet.color}10`, color: planet.color, border: `1px solid ${planet.color}20` }}>
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Process Steps */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Process</h3>
        <div className="space-y-2">
          {info.processSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                   style={{ background: `${planet.color}20`, color: planet.color }}>
                {i + 1}
              </div>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Generated Outputs</h3>
        <div className="space-y-1.5">
          {info.outputs.map((output, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#52525B' }} />
              <span className="text-xs font-mono" style={{ color: '#A1A1AA' }}>{output}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Connected Planets</h3>
        <div className="flex flex-wrap gap-2">
          {info.connections.map((connId, i) => {
            const connPlanet = PLANETS.find(p => p.id === connId)
            if (!connPlanet) return null
            return (
              <span key={i} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', color: connPlanet.color, border: `1px solid ${connPlanet.color}20` }}>
                {connPlanet.symbol} {connPlanet.name}
              </span>
            )
          })}
        </div>
      </div>

      {/* Personality */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525B' }}>Personality</h3>
        <p className="text-xs italic leading-relaxed" style={{ color: planet.color, opacity: 0.7 }}>
          "{planet.voice[0]}"
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlanetsPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  const handleSelect = useCallback((id: PlanetId) => {
    setSelectedPlanet(prev => prev === id ? null : id)
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#09090B' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col h-screen sticky top-0"
             style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(255,215,0,0.1)', boxShadow: '0 0 20px rgba(255,215,0,0.1)' }}>
              <span className="text-lg">☀️</span>
            </div>
            <div>
              <p className="font-bold text-sm text-white">AIRA OS</p>
              <p className="text-[11px] text-[#52525B] leading-none">Multi-Agent AI</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: Brain, label: 'Dashboard', href: '/dashboard' },
            { icon: Sparkles, label: 'New Project', href: '/project/new' },
            { icon: Globe, label: 'Planets', href: '/planets', active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={clsx('sidebar-link', item.active && 'sidebar-link-active')}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              apiOnline === null ? 'bg-yellow-500 animate-pulse' :
              apiOnline ? 'bg-emerald-500' : 'bg-red-500'
            )} />
            <span className="text-xs" style={{ color: '#71717A' }}>
              API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06]"
                style={{ background: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(20px)' }}>
          <div>
            <h1 className="text-2xl font-bold">The Neural Network</h1>
            <p className="text-sm" style={{ color: '#71717A' }}>
              AIRA's 9 specialized agents — click any planet to explore its intelligence
            </p>
          </div>
          <Link href="/project/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <Sparkles className="w-4 h-4" />
            Launch Project
          </Link>
        </header>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Neural network canvas */}
          <div className="flex-1 relative">
            <PlanetsNeuralNetwork
              onSelect={handleSelect}
              selectedPlanet={selectedPlanet}
            />

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 px-8 py-4"
                 style={{ background: 'linear-gradient(transparent, rgba(9,9,11,0.95))' }}>
              <div className="flex items-center gap-6">
                {PLANETS.filter(p => p.id !== 'aira').map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id as PlanetId)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                      selectedPlanet === p.id ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="text-sm">{p.symbol}</span>
                    <span className="text-xs font-medium" style={{ color: selectedPlanet === p.id ? p.color : '#71717A' }}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedPlanet && (
              <PlanetDetailPanel
                planetId={selectedPlanet}
                onClose={() => setSelectedPlanet(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
