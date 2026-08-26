'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Brain, Plus, FolderOpen, Settings, Activity,
  Sparkles, Clock, CheckCircle, AlertCircle,
  ArrowRight, Zap, ChevronRight, Server
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { listProjects, checkHealth } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    // Check API health
    checkHealth().then(setApiOnline)

    // Load projects
    listProjects()
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    running: projects.filter((p) => p.status === 'running').length,
    failed: projects.filter((p) => p.status === 'failed').length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-5 flex flex-col gap-1 sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
               style={{ background: 'rgba(255,215,0,0.15)', boxShadow: '0 0 12px rgba(255,215,0,0.2)' }}>
            ☀️
          </div>
          <div>
            <p className="font-bold text-sm">AIRA OS</p>
            <p className="text-xs text-text-muted">Multi-Agent AI</p>
          </div>
        </div>

        {/* Nav */}
        {[
          { icon: Activity, label: 'Dashboard', href: '/dashboard', active: true },
          { icon: Plus, label: 'New Project', href: '/project/new', active: false },
          { icon: FolderOpen, label: 'Projects', href: '/projects', active: false },
          { icon: Settings, label: 'Settings', href: '/settings', active: false },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={clsx(
              'sidebar-link',
              item.active && 'sidebar-link-active'
            )}>
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* API Status */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              apiOnline === null ? 'bg-warning animate-pulse' :
              apiOnline ? 'bg-secondary' : 'bg-error'
            )} />
            <span className="text-xs text-text-muted">
              API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-text-muted px-2 mt-2">© 2026 Sri D</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-text-muted text-sm mt-1">
                AIRA OS — Orchestrating 9 AI Planets + 1 Central Intelligence
              </p>
            </div>
            <Link href="/project/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {/* API offline warning */}
          {apiOnline === false && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning">Backend API is offline</p>
                <p className="text-xs text-text-muted">
                  Start the backend: <code className="text-warning">cd backend && uvicorn main:app --reload</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Projects', value: stats.total, color: '#6366F1', icon: FolderOpen },
              { label: 'Completed', value: stats.completed, color: '#10B981', icon: CheckCircle },
              { label: 'Running', value: stats.running, color: '#3B82F6', icon: Zap },
              { label: 'AI Agents', value: 10, color: '#FFD700', icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl glass border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-text-muted font-medium">{stat.label}</p>
                  <stat.icon className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Solar System showcase */}
            <div className="lg:col-span-1 p-6 rounded-2xl glass border border-border flex flex-col items-center">
              <h2 className="text-sm font-semibold text-text-muted mb-4 self-start">
                AIRA Solar System
              </h2>
              <SolarSystem
                planetStatuses={Object.fromEntries(PLANETS.map((p) => [p.id, p.id === 'aira' ? 'active' : 'idle']))}
                size="sm"
              />
              <p className="text-xs text-text-muted text-center mt-4 italic">
                "I don't solve problems alone. I orchestrate intelligence."
              </p>
            </div>

            {/* Recent projects + CTA */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* CTA if no projects */}
              {!loading && projects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 p-8 rounded-2xl glass border border-primary/20 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                       style={{ background: 'rgba(99,102,241,0.1)' }}>
                    🚀
                  </div>
                  <h2 className="text-xl font-bold mb-2">Ready to build something amazing?</h2>
                  <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
                    Describe your project idea and AIRA's 9 planets will research,
                    architect, design, build, fund, document, test, evolve, and deploy it for you.
                  </p>
                  <Link href="/project/new" className="btn-primary inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start First Project
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}

              {/* Projects list */}
              {!loading && projects.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted mb-3">Recent Projects</h2>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Link href={`/project/${project.id}`}
                          className="flex items-center justify-between p-4 rounded-xl glass border border-border hover:border-primary/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              'w-2 h-2 rounded-full flex-shrink-0',
                              project.status === 'completed' && 'bg-secondary',
                              project.status === 'running' && 'bg-primary animate-pulse',
                              project.status === 'failed' && 'bg-error',
                              project.status === 'pending' && 'bg-warning',
                            )} />
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-xs">
                                {project.idea || 'AI Project'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {project.created_at
                                  ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planet quick info */}
              <div className="p-5 rounded-2xl glass border border-border">
                <h2 className="text-sm font-semibold text-text-muted mb-3">The 9 Planets</h2>
                <div className="grid grid-cols-3 gap-2">
                  {PLANETS.filter((p) => p.id !== 'aira').map((p) => (
                    <div key={p.name}
                         className="flex items-center gap-2 p-2.5 rounded-lg glass border border-border/50">
                      <span className="text-sm">{p.symbol}</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: p.color }}>{p.name}</p>
                        <p className="text-xs text-text-muted" style={{ fontSize: '10px' }}>{p.role}</p>
                      </div>
                    </div>
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
