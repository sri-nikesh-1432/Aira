'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus, FolderOpen, Sparkles, CheckCircle, Zap,
  ArrowRight, ChevronRight, Globe, Brain,
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
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
    listProjects()
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    running: projects.filter((p) => p.status === 'running').length,
    agents: 10,
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0c' }}>
      <Sidebar apiOnline={apiOnline} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: '#52525B' }}>
                AIRA OS — Orchestrating 9 AI Planets + 1 Central Intelligence
              </p>
            </div>
            <Link href="/project/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {/* API offline warning */}
          {apiOnline === false && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Backend API is offline</p>
                <p className="text-xs" style={{ color: '#71717A' }}>
                  Start the backend: <code className="text-yellow-500 text-[11px]">cd backend && uvicorn main:app --reload</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Projects', value: stats.total, color: '#6366F1', icon: FolderOpen },
              { label: 'Completed', value: stats.completed, color: '#10B981', icon: CheckCircle },
              { label: 'Running', value: stats.running, color: '#3B82F6', icon: Zap },
              { label: 'AI Agents', value: stats.agents, color: '#FFD700', icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-2xl glass-card"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-medium" style={{ color: '#52525B' }}>{stat.label}</p>
                  <stat.icon className="w-3.5 h-3.5" style={{ color: '#3F3F46' }} />
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Solar System showcase */}
            <div className="lg:col-span-1 p-5 rounded-2xl glass-card flex flex-col items-center">
              <h2 className="text-xs font-semibold mb-3 self-start uppercase tracking-wider" style={{ color: '#3F3F46' }}>
                Solar System
              </h2>
              <SolarSystem
                planetStatuses={Object.fromEntries(PLANETS.map((p) => [p.id, p.id === 'aira' ? 'active' : 'idle']))}
                size="sm"
              />
              <p className="text-[11px] text-center mt-3 italic" style={{ color: '#3F3F46' }}>
                &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
              </p>
            </div>

            {/* Recent projects + CTA */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {!loading && projects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 p-8 rounded-2xl text-center gradient-border"
                  style={{ background: 'rgba(99,102,241,0.02)' }}
                >
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                       style={{ background: 'rgba(99,102,241,0.08)' }}>
                    🚀
                  </div>
                  <h2 className="text-xl font-bold mb-2">Ready to build something amazing?</h2>
                  <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#52525B' }}>
                    Describe your project idea and AIRA&apos;s 9 planets will research,
                    architect, design, build, fund, document, test, evolve, and deploy it for you.
                  </p>
                  <Link href="/project/new"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                    <Sparkles className="w-4 h-4" />
                    Start First Project
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}

              {!loading && projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold mb-2.5 uppercase tracking-wider" style={{ color: '#3F3F46' }}>Recent Projects</h2>
                  <div className="space-y-1.5">
                    {projects.slice(0, 5).map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link href={`/project/${project.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl glass-card group">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              'w-1.5 h-1.5 rounded-full flex-shrink-0',
                              project.status === 'completed' && 'bg-emerald-500',
                              project.status === 'running' && 'bg-primary animate-pulse',
                              project.status === 'failed' && 'bg-red-500',
                              project.status === 'pending' && 'bg-yellow-500',
                            )} />
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-xs">
                                {project.idea || 'AI Project'}
                              </p>
                              <p className="text-[11px]" style={{ color: '#3F3F46' }}>
                                {project.created_at
                                  ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 transition-colors group-hover:text-primary"
                                          style={{ color: '#27272A' }} />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Planet Info */}
              <div className="p-4 rounded-2xl glass-card">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F3F46' }}>The 9 Planets</h2>
                  <Link href="/planets" className="text-[11px] font-medium text-primary hover:text-primary-light transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PLANETS.filter((p) => p.id !== 'aira').map((p) => (
                    <Link key={p.name} href="/planets"
                      className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-white/[0.03]"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span className="text-sm">{p.symbol}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium" style={{ color: p.color }}>{p.name}</p>
                        <p className="text-[9px] truncate" style={{ color: '#3F3F46' }}>{p.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
