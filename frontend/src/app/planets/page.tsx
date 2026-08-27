'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, ArrowUpRight, Zap } from 'lucide-react'
import { PLANETS, type PlanetId } from '@/types'
import { checkHealth } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'
import { clsx } from 'clsx'

const PLANET_WORKSPACE_INFO: Record<string, {
  capability: string
  action: string
  tagColor: string
}> = {
  mercury: { capability: 'Research & Intelligence', action: 'Run Research', tagColor: '#B5A9A9' },
  mars: { capability: 'Architecture & Planning', action: 'Design System', tagColor: '#CF4B2B' },
  venus: { capability: 'UI/UX & Experience', action: 'Design UI', tagColor: '#E8B86D' },
  earth: { capability: 'Development & Engineering', action: 'Write Code', tagColor: '#4B9CD3' },
  jupiter: { capability: 'Business Strategy', action: 'Build Strategy', tagColor: '#C8A951' },
  saturn: { capability: 'Documentation', action: 'Create Docs', tagColor: '#A89070' },
  neptune: { capability: 'Quality Assurance', action: 'Run Tests', tagColor: '#4B7BE8' },
  uranus: { capability: 'Meta-Evolution', action: 'Analyze Patterns', tagColor: '#7EC8C8' },
  pluto: { capability: 'Deployment & Operations', action: 'Deploy', tagColor: '#9B8EAE' },
}

// ─── Neural Network Canvas (lightweight, decorative) ─────────────────────────

function PlanetsNeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

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

    const planets = PLANETS.filter(p => p.id !== 'aira')
    const planetNodes = planets.map((p, i) => {
      const angle = (i / planets.length) * Math.PI * 2 - Math.PI / 2
      const orbitR = Math.min(W, H) * 0.32
      return {
        id: p.id,
        x: cx + Math.cos(angle) * orbitR,
        y: cy + Math.sin(angle) * orbitR,
        color: p.color,
        name: p.name,
        symbol: p.symbol,
        r: 12,
      }
    })

    const airaNode = { x: cx, y: cy, r: 20, color: '#FFD700' }

    let time = 0
    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.004

      // Orbit rings
      planetNodes.forEach((_, i) => {
        const orbitR = Math.min(W, H) * 0.32 * ((i + 1) / planetNodes.length * 0.3 + 0.7)
        ctx.beginPath()
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Connections from AIRA
      planetNodes.forEach((node, i) => {
        ctx.beginPath()
        ctx.moveTo(airaNode.x, airaNode.y)
        const midX = (airaNode.x + node.x) / 2
        const midY = (airaNode.y + node.y) / 2
        const ctrlX = midX + Math.sin(time + i) * 12
        const ctrlY = midY + Math.cos(time + i) * 12
        ctx.quadraticCurveTo(ctrlX, ctrlY, node.x, node.y)
        ctx.strokeStyle = node.color + '12'
        ctx.lineWidth = 0.7
        ctx.stroke()

        // Data pulse
        const t = (time * 0.25 + i * 0.12) % 1
        const px = (1 - t) * (1 - t) * airaNode.x + 2 * (1 - t) * t * ctrlX + t * t * node.x
        const py = (1 - t) * (1 - t) * airaNode.y + 2 * (1 - t) * t * ctrlY + t * t * node.y
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = node.color + '30'
        ctx.fill()
      })

      // Planet nodes
      planetNodes.forEach((node) => {
        // Glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 2)
        glow.addColorStop(0, node.color + '10')
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r * 2, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(node.x - node.r * 0.3, node.y - node.r * 0.3, 0, node.x, node.y, node.r)
        grad.addColorStop(0, node.color)
        grad.addColorStop(1, node.color + '88')
        ctx.fillStyle = grad
        ctx.fill()

        // Label
        ctx.font = '500 10px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#52525B'
        ctx.fillText(node.name, node.x, node.y + node.r + 15)
      })

      // AIRA core
      const airaGlow = ctx.createRadialGradient(airaNode.x, airaNode.y, 0, airaNode.x, airaNode.y, airaNode.r * 2.5)
      airaGlow.addColorStop(0, 'rgba(255,215,0,0.12)')
      airaGlow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(airaNode.x, airaNode.y, airaNode.r * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = airaGlow
      ctx.fill()

      // Pulse
      const pulseR = airaNode.r + 6 + Math.sin(time * 2) * 3
      ctx.beginPath()
      ctx.arc(airaNode.x, airaNode.y, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,215,0,0.08)'
      ctx.lineWidth = 0.8
      ctx.stroke()

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

      ctx.font = '700 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFD700'
      ctx.fillText('AIRA', airaNode.x, airaNode.y + airaNode.r + 17)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlanetsPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  const nonAiraPlanets = PLANETS.filter(p => p.id !== 'aira')

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0c' }}>
      <Sidebar apiOnline={apiOnline} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04]"
                style={{ background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(20px)' }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span style={{ color: '#FFD700' }}>9 Planets</span>
              <span style={{ color: '#3F3F46' }}> · </span>
              <span style={{ color: '#52525B' }}>1 Mission</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#3F3F46' }}>
              Each planet works independently — click to run its full intelligence
            </p>
          </div>
          <Link href="/project/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <Sparkles className="w-4 h-4" />
            Launch All Planets
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Neural Network Visual */}
            <div className="rounded-2xl mb-10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', height: '420px' }}>
              <PlanetsNeuralNetwork />
            </div>

            {/* AIRA Center Card */}
            <div className="mb-10 p-6 rounded-2xl text-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,215,0,0.04), rgba(255,165,0,0.02))',
                   border: '1px solid rgba(255,215,0,0.08)',
                 }}>
              <span className="text-3xl mb-3 block">☀️</span>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#FFD700' }}>AIRA</h2>
              <p className="text-xs mb-2" style={{ color: '#C8A951' }}>Central Intelligence · CEO · Orchestrator</p>
              <p className="text-sm italic max-w-lg mx-auto" style={{ color: '#71717A' }}>
                &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
              </p>
            </div>

            {/* Section Title */}
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight">Self-Sufficient Planets</h2>
              <p className="text-sm mt-0.5" style={{ color: '#3F3F46' }}>
                Click any planet to open its standalone workspace — no AIRA required
              </p>
            </div>

            {/* Planet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonAiraPlanets.map((planet, i) => {
                const info = PLANET_WORKSPACE_INFO[planet.id]
                return (
                  <motion.div
                    key={planet.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={`/planets/${planet.id}`}
                      className="group block rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${planet.color}06`
                        e.currentTarget.style.borderColor = `${planet.color}20`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.015)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                      }}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110"
                               style={{
                                 background: `${planet.color}10`,
                                 border: `1px solid ${planet.color}20`,
                               }}>
                            {planet.symbol}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm" style={{ color: planet.color }}>
                              {planet.name}
                            </h3>
                            <p className="text-[10px]" style={{ color: '#52525B' }}>
                              {info.capability}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                       style={{ color: '#27272A' }} />
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed mb-4" style={{ color: '#52525B' }}>
                        {planet.personality}
                      </p>

                      {/* Process steps preview */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {planet.voice.slice(0, 2).map((quote, qi) => (
                          <span key={qi} className="text-[10px] px-2 py-0.5 rounded-md"
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  color: '#3F3F46',
                                  border: '1px solid rgba(255,255,255,0.03)',
                                }}>
                            &ldquo;{quote.slice(0, 50)}...&rdquo;
                          </span>
                        ))}
                      </div>

                      {/* Action bar */}
                      <div className="flex items-center justify-between pt-3"
                           style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                              style={{ background: `${planet.color}10`, color: planet.color }}>
                          {info.action}
                        </span>
                        <span className="text-[10px] flex items-center gap-1"
                              style={{ color: '#3F3F46' }}>
                          <Zap className="w-2.5 h-2.5" />
                          Standalone
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Bottom info */}
            <div className="mt-12 text-center pb-8">
              <p className="text-xs" style={{ color: '#27272A' }}>
                Each planet is a fully self-contained AI agent — it researches, designs, codes, tests, deploys, and evolves completely on its own
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
