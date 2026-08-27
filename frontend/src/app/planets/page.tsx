'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowUpRight, Zap } from 'lucide-react'
import { PLANETS } from '@/types'
import { checkHealth } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'

const PLANET_WORKSPACE_INFO: Record<string, {
  capability: string
  action: string
}> = {
  mercury: { capability: 'Research & Intelligence', action: 'Run Research' },
  mars: { capability: 'Architecture & Planning', action: 'Design System' },
  venus: { capability: 'UI/UX & Experience', action: 'Design UI' },
  earth: { capability: 'Development & Engineering', action: 'Write Code' },
  jupiter: { capability: 'Business Strategy', action: 'Build Strategy' },
  saturn: { capability: 'Documentation', action: 'Create Docs' },
  neptune: { capability: 'Quality Assurance', action: 'Run Tests' },
  uranus: { capability: 'Meta-Evolution', action: 'Analyze Patterns' },
  pluto: { capability: 'Deployment & Operations', action: 'Deploy' },
}

export default function PlanetsPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  useEffect(() => { checkHealth().then(setApiOnline) }, [])

  const nonAiraPlanets = PLANETS.filter(p => p.id !== 'aira')

  return (
    <div className="flex min-h-screen bg-[#F5F0EB]">
      <Sidebar apiOnline={apiOnline} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#2C2420]/8 bg-white/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2420]">
              <span className="text-amber-600">9 Planets</span>
              <span className="text-[#D4C8BC]"> · </span>
              <span className="text-[#A19B95]">1 Mission</span>
            </h1>
            <p className="text-sm mt-0.5 text-[#A19B95]">
              Each planet works independently — click to run its full intelligence
            </p>
          </div>
          <Link href="/project/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #8B5A2B, #6B3F1F)' }}>
            <Sparkles className="w-4 h-4" />
            Launch All Planets
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* AIRA Center Card */}
            <div className="mb-10 p-6 rounded-2xl text-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
              <span className="text-3xl mb-3 block">☀️</span>
              <h2 className="text-xl font-bold mb-1 text-amber-700">AIRA</h2>
              <p className="text-xs mb-2 text-amber-500">Central Intelligence · CEO · Orchestrator</p>
              <p className="text-sm italic max-w-lg mx-auto text-[#A19B95]">
                &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
              </p>
            </div>

            {/* Section Title */}
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-[#2C2420]">Self-Sufficient Planets</h2>
              <p className="text-sm mt-0.5 text-[#A19B95]">
                Click any planet to open its standalone workspace — no AIRA required
              </p>
            </div>

            {/* Planet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonAiraPlanets.map((planet) => {
                const info = PLANET_WORKSPACE_INFO[planet.id]
                return (
                  <Link
                    key={planet.id}
                    href={`/planets/${planet.id}`}
                    className="group block rounded-2xl p-5 bg-white border border-[#2C2420]/8 hover:border-[#2C2420]/12 hover:shadow-md transition-all duration-200"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                             style={{ background: `${planet.color}10`, border: `1px solid ${planet.color}20` }}>
                          {planet.symbol}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</h3>
                          <p className="text-[10px] text-[#A19B95]">{info.capability}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#D4C8BC] group-hover:text-[#8B5A2B] transition-colors" />
                    </div>
                    <p className="text-xs leading-relaxed mb-4 text-[#716B65]">{planet.personality}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: `${planet.color}10`, color: planet.color }}>
                        {info.action}
                      </span>
                      <span className="text-[10px] text-[#A19B95] flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        Standalone
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
