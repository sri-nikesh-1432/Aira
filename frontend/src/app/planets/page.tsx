'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowUpRight, Zap, Search } from 'lucide-react'
import { PLANETS } from '@/types'
import { checkHealth } from '@/lib/api'
import { Sidebar } from '@/components/layout/Sidebar'

const PLANET_WORKSPACE_INFO: Record<string, {
  capability: string
  action: string
  skills: string[]
}> = {
  mercury: { capability: 'Research & Intelligence', action: 'Run Research', skills: ['Market Analysis', 'Competitor Research', 'User Studies'] },
  mars: { capability: 'Architecture & Planning', action: 'Design System', skills: ['System Design', 'Tech Stack', 'Scalability'] },
  venus: { capability: 'UI/UX & Experience', action: 'Design UI', skills: ['Wireframes', 'Design System', 'Prototyping'] },
  earth: { capability: 'Development & Engineering', action: 'Write Code', skills: ['Full-Stack Dev', 'API Design', 'Database'] },
  jupiter: { capability: 'Business Strategy', action: 'Build Strategy', skills: ['Business Plan', 'Revenue Model', 'GTM Strategy'] },
  saturn: { capability: 'Documentation', action: 'Create Docs', skills: ['Technical Docs', 'API Reference', 'User Guides'] },
  neptune: { capability: 'Quality Assurance', action: 'Run Tests', skills: ['Test Suites', 'Security Audit', 'Performance'] },
  uranus: { capability: 'Meta-Evolution', action: 'Analyze Patterns', skills: ['Pattern Recognition', 'Optimization', 'Learning'] },
  pluto: { capability: 'Deployment & Operations', action: 'Deploy', skills: ['CI/CD', 'Docker', 'Cloud Deploy'] },
}

export default function PlanetsPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => { checkHealth().then(setApiOnline) }, [])

  const nonAiraPlanets = PLANETS.filter(p => p.id !== 'aira')
  const filteredPlanets = searchQuery
    ? nonAiraPlanets.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        PLANET_WORKSPACE_INFO[p.id]?.capability.toLowerCase().includes(searchQuery.toLowerCase()) ||
        PLANET_WORKSPACE_INFO[p.id]?.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : nonAiraPlanets

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
              Each planet works independently — click to open its workspace
            </p>
          </div>
          <Link href="/project/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 btn-primary">
            <Sparkles className="w-4 h-4" />
            Launch All Planets
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* AIRA Center Card */}
            <div className="mb-10 p-6 rounded-2xl text-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
              <div className="relative">
                <span className="text-4xl mb-3 block">☀️</span>
                <h2 className="text-xl font-bold mb-1 text-amber-700">AIRA</h2>
                <p className="text-xs mb-2 text-amber-500 font-medium">Central Intelligence · CEO · Orchestrator</p>
                <p className="text-sm italic max-w-lg mx-auto text-[#A19B95]">
                  &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A19B95]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search planets by name, role, or capability..."
                className="input-field pl-10"
              />
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
              {filteredPlanets.map((planet, i) => {
                const info = PLANET_WORKSPACE_INFO[planet.id]
                return (
                  <Link
                    key={planet.id}
                    href={`/planets/${planet.id}`}
                    className="group block rounded-2xl bg-white border border-[#2C2420]/8 hover:border-[#2C2420]/12 hover:shadow-lg hover:shadow-[#8B5A2B]/5 transition-all duration-300 overflow-hidden"
                    style={{ textDecoration: 'none', animationDelay: `${i * 60}ms` }}
                  >
                    {/* Top accent bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${planet.color}, ${planet.color}44)` }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                               style={{ background: `${planet.color}10`, border: `1px solid ${planet.color}20` }}>
                            {planet.symbol}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</h3>
                            <p className="text-[10px] text-[#A19B95] font-medium">{info.capability}</p>
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#EDE5DC] group-hover:bg-[#8B5A2B] group-hover:text-white transition-all duration-300">
                          <ArrowUpRight className="w-4 h-4 text-[#716B65] group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed mb-4 text-[#716B65] line-clamp-2">{planet.personality}</p>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {info.skills.map(skill => (
                          <span key={skill} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ background: `${planet.color}08`, color: planet.color, border: `1px solid ${planet.color}15` }}>
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#2C2420]/5">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                              style={{ background: `${planet.color}10`, color: planet.color }}>
                          {info.action}
                        </span>
                        <span className="text-[10px] text-[#A19B95] flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          Standalone
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {filteredPlanets.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 mx-auto mb-3 text-[#D4C8BC]" />
                <p className="text-sm font-medium text-[#716B65]">No planets match &ldquo;{searchQuery}&rdquo;</p>
                <button onClick={() => setSearchQuery('')} className="text-sm text-primary mt-2 hover:underline">
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
