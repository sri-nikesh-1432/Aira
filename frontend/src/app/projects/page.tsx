'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity, Plus, FolderOpen, Settings, Brain,
  Sparkles, ArrowRight, Trash2, ChevronRight, FolderOpen as FolderIcon
} from 'lucide-react'
import { listProjects, deleteProject, checkHealth } from '@/lib/api'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUS_META: Record<string, { label: string; dot: string }> = {
  completed: { label: 'Completed', dot: 'bg-secondary' },
  running: { label: 'Running', dot: 'bg-primary animate-pulse' },
  failed: { label: 'Failed', dot: 'bg-error' },
  pending: { label: 'Pending', dot: 'bg-warning' },
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const refresh = () => {
    listProjects()
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    checkHealth().then(setApiOnline)
    refresh()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const nav = [
    { icon: Activity, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Plus, label: 'New Project', href: '/project/new', active: false },
    { icon: FolderOpen, label: 'Projects', href: '/projects', active: true },
    { icon: Settings, label: 'Settings', href: '/settings', active: false },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-5 flex flex-col gap-1 sticky top-0 h-screen">
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

        {nav.map((item) => (
          <Link key={item.href} href={item.href}
            className={clsx('sidebar-link', item.active && 'sidebar-link-active')}>
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-text-muted text-sm mt-1">
                Every mission AIRA has orchestrated
              </p>
            </div>
            <Link href="/project/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 rounded-2xl glass border border-primary/20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                   style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FolderIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">No projects yet</h2>
              <p className="text-text-muted text-sm mb-6">
                Launch your first mission and AIRA&apos;s planets will build it for you.
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
            <div className="space-y-3">
              {projects.map((project, i) => {
                const meta = STATUS_META[project.status] || STATUS_META.pending
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-4 p-4 rounded-xl glass border border-border hover:border-primary/30 transition-all"
                  >
                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', meta.dot)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {project.idea || 'AI Project'}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {project.id.slice(0, 8)} •{' '}
                          {project.created_at
                            ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                            : 'just now'}
                        </p>
                      </div>
                    </button>

                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0',
                      project.status === 'completed' && 'bg-secondary/10 text-secondary',
                      project.status === 'running' && 'bg-primary/10 text-primary',
                      project.status === 'failed' && 'bg-error/10 text-error',
                      project.status === 'pending' && 'bg-warning/10 text-warning'
                    )}>
                      {meta.label}
                    </span>

                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-white transition-colors flex-shrink-0"
                      title="Open project"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors flex-shrink-0"
                      title="Delete project"
                    >
                      <Trash2 className={clsx('w-4 h-4', deleting === project.id && 'animate-pulse')} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Footer hint */}
          {!loading && projects.length > 0 && (
            <p className="flex items-center gap-2 text-xs text-text-muted mt-6">
              <Brain className="w-3.5 h-3.5" />
              Generated projects are saved under backend/outputs/ and can be downloaded from each project&apos;s workspace.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
