'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, FolderOpen, Sparkles, CheckCircle, Zap, ChevronRight, Globe,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { listProjects, checkHealth } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
    listProjects().then((data) => setProjects(data.projects || [])).catch(() => setProjects([])).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    running: projects.filter((p) => p.status === 'running').length,
    agents: 10,
  }

  return (
    <div className="flex min-h-screen bg-[#F5F0EB]">
      <Sidebar apiOnline={apiOnline} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#2C2420]">Dashboard</h1>
              <p className="text-sm mt-1 text-[#A19B95]">AIRA OS — Orchestrating 9 AI Planets + 1 Central Intelligence</p>
            </div>
            <Link href="/project/new" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>

          {apiOnline === false && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6 bg-amber-50 border border-amber-200">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700">Backend API is offline</p>
                <p className="text-xs text-[#716B65]">Start: <code className="text-amber-600 text-[11px] bg-amber-100 px-1.5 py-0.5 rounded">cd backend && uvicorn main:app --reload</code></p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Projects', value: stats.total, color: '#8B5A2B', icon: FolderOpen },
              { label: 'Completed', value: stats.completed, color: '#10B981', icon: CheckCircle },
              { label: 'Running', value: stats.running, color: '#D4A574', icon: Zap },
              { label: 'AI Agents', value: stats.agents, color: '#8B5A2B', icon: Sparkles },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/6">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-medium text-[#A19B95]">{stat.label}</p>
                  <stat.icon className="w-3.5 h-3.5 text-[#D4C8BC]" />
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {!loading && projects.length === 0 && (
                <div className="flex-1 p-8 rounded-2xl text-center bg-[#FFFCF9] border border-[#2C2420]/6">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl bg-[#8B5A2B]/5">🚀</div>
                  <h2 className="text-xl font-bold mb-2 text-[#2C2420]">Ready to build something amazing?</h2>
                  <p className="text-sm mb-6 max-w-md mx-auto text-[#716B65]">Describe your project and AIRA's 9 planets will build it for you.</p>
                  <Link href="/project/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                    <Sparkles className="w-4 h-4" /> Start First Project
                  </Link>
                </div>
              )}

              {!loading && projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold mb-2.5 uppercase tracking-wider text-[#A19B95]">Recent Projects</h2>
                  <div className="space-y-1.5">
                    {projects.slice(0, 5).map((project, i) => (
                      <Link key={project.id} href={`/project/${project.id}`}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFCF9] border border-[#2C2420]/6 hover:border-[#2C2420]/12 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0',
                            project.status === 'completed' && 'bg-emerald-500',
                            project.status === 'running' && 'bg-[#8B5A2B] animate-pulse',
                            project.status === 'failed' && 'bg-red-500',
                            project.status === 'pending' && 'bg-amber-500',
                          )} />
                          <div>
                            <p className="text-sm font-medium text-[#2C2420] truncate max-w-xs">{project.idea || 'AI Project'}</p>
                            <p className="text-[11px] text-[#A19B95]">{project.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : ''}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D4C8BC] group-hover:text-[#8B5A2B] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/6">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A19B95]">The 9 Planets</h2>
                  <Link href="/planets" className="text-[11px] font-medium text-[#8B5A2B] hover:text-[#6B3F1F] transition-colors">View all →</Link>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PLANETS.filter((p) => p.id !== 'aira').map((p) => (
                    <Link key={p.name} href={`/planets/${p.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#EDE5DC] transition-all" style={{ textDecoration: 'none' }}>
                      <span className="text-sm">{p.symbol}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium" style={{ color: p.color }}>{p.name}</p>
                        <p className="text-[9px] text-[#A19B95] truncate">{p.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 p-5 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/6 flex flex-col items-center">
              <h2 className="text-xs font-semibold mb-3 self-start uppercase tracking-wider text-[#A19B95]">Solar System</h2>
              <div className="w-full h-48 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8B5A2B] to-[#6B3F1F] flex items-center justify-center text-2xl shadow-lg">☀️</div>
                  {PLANETS.filter(p => p.id !== 'aira').map((p, i) => {
                    const angle = (i / 9) * Math.PI * 2
                    const r = 60 + (i % 3) * 15
                    return (
                      <div key={p.id} className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[8px]"
                           style={{ left: `calc(50% + ${Math.cos(angle) * r}px - 10px)`, top: `calc(50% + ${Math.sin(angle) * r}px - 10px)`,
                             background: `${p.color}20`, border: `1.5px solid ${p.color}40`, color: p.color }}>
                        {p.symbol}
                      </div>
                    )
                  })}
                </div>
              </div>
              <p className="text-[11px] text-center mt-3 italic text-[#A19B95]">"I don't solve problems alone. I orchestrate intelligence."</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
