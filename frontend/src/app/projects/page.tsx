'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Trash2, ChevronRight, Sparkles,
  Brain, FolderOpen,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { listProjects, deleteProject, checkHealth } from '@/lib/api'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUS_META: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: '#10B981' },
  running: { label: 'Running', color: '#6366F1' },
  failed: { label: 'Failed', color: '#EF4444' },
  pending: { label: 'Pending', color: '#F59E0B' },
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
    <div className="flex min-h-screen" style={{ background: '#0a0a0c' }}>
      <Sidebar apiOnline={apiOnline} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-sm mt-1" style={{ color: '#52525B' }}>
                Every mission AIRA has orchestrated
              </p>
            </div>
            <Link href="/project/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 rounded-2xl text-center gradient-border"
              style={{ background: 'rgba(99,102,241,0.02)' }}
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                   style={{ background: 'rgba(99,102,241,0.08)' }}>
                <FolderOpen className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">No projects yet</h2>
              <p className="text-sm mb-6" style={{ color: '#52525B' }}>
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
            <div className="space-y-1.5">
              {projects.map((project, i) => {
                const meta = STATUS_META[project.status] || STATUS_META.pending
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-center gap-3 p-3.5 rounded-xl glass-card"
                  >
                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {project.idea || 'AI Project'}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#3F3F46' }}>
                          {project.id.slice(0, 8)} &bull;{' '}
                          {project.created_at
                            ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                            : 'just now'}
                        </p>
                      </div>
                    </button>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
                          style={{ background: `${meta.color}10`, color: meta.color }}>
                      {meta.label}
                    </span>

                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors flex-shrink-0"
                      style={{ color: '#3F3F46' }}
                      title="Open project"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                      style={{ color: '#3F3F46' }}
                      title="Delete project"
                    >
                      <Trash2 className={clsx('w-3.5 h-3.5', deleting === project.id && 'animate-pulse')} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!loading && projects.length > 0 && (
            <p className="flex items-center gap-2 text-[11px] mt-5" style={{ color: '#3F3F46' }}>
              <Brain className="w-3 h-3" />
              Generated projects are saved under backend/outputs/ and can be downloaded from each project&apos;s workspace.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
