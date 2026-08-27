'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, FolderOpen, Trash2, ChevronRight, Sparkles,
  Brain,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { listProjects, deleteProject, checkHealth } from '@/lib/api'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUS_META: Record<string, { label: string; dot: string; color: string }> = {
  completed: { label: 'Completed', dot: 'bg-emerald-500', color: '#10B981' },
  running: { label: 'Running', dot: 'bg-primary animate-pulse', color: '#6366F1' },
  failed: { label: 'Failed', dot: 'bg-red-500', color: '#EF4444' },
  pending: { label: 'Pending', dot: 'bg-yellow-500', color: '#F59E0B' },
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

  return (
    <div className="flex min-h-screen" style={{ background: '#09090B' }}>
      <Sidebar apiOnline={apiOnline} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-sm mt-1" style={{ color: '#71717A' }}>
                Every mission AIRA has orchestrated
              </p>
            </div>
            <Link href="/project/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 rounded-2xl text-center gradient-border"
              style={{ background: 'rgba(99,102,241,0.03)' }}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                   style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">No projects yet</h2>
              <p className="text-sm mb-6" style={{ color: '#71717A' }}>
                Launch your first mission and AIRA&apos;s planets will build it for you.
              </p>
              <Link href="/project/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                <Sparkles className="w-4 h-4" />
                Start First Project
              </Link>
            </motion.div>
          )}

          {!loading && projects.length > 0 && (
            <div className="space-y-2">
              {projects.map((project, i) => {
                const meta = STATUS_META[project.status] || STATUS_META.pending
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-4 p-4 rounded-xl glass-card"
                  >
                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {project.idea || 'AI Project'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#52525B' }}>
                          {project.id.slice(0, 8)} •{' '}
                          {project.created_at
                            ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                            : 'just now'}
                        </p>
                      </div>
                    </button>

                    <span className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                          style={{ background: `${meta.color}12`, color: meta.color }}>
                      {meta.label}
                    </span>

                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors flex-shrink-0"
                      style={{ color: '#52525B' }}
                      title="Open project"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                      style={{ color: '#52525B' }}
                      title="Delete project"
                    >
                      <Trash2 className={clsx('w-4 h-4', deleting === project.id && 'animate-pulse')} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!loading && projects.length > 0 && (
            <p className="flex items-center gap-2 text-xs mt-6" style={{ color: '#52525B' }}>
              <Brain className="w-3.5 h-3.5" />
              Generated projects are saved under backend/outputs/ and can be downloaded from each project&apos;s workspace.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
