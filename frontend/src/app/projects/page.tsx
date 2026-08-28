'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Trash2, ChevronRight, Sparkles,
  Brain, FolderOpen, Search, X, Clock, CheckCircle,
  AlertCircle, Loader2,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { listProjects, deleteProject, checkHealth } from '@/lib/api'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: 'Completed', color: '#10B981', icon: CheckCircle },
  running: { label: 'Running', color: '#6366F1', icon: Loader2 },
  failed: { label: 'Failed', color: '#EF4444', icon: AlertCircle },
  pending: { label: 'Pending', color: '#F59E0B', icon: Clock },
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const filteredProjects = useMemo(() => {
    let result = projects
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        (p.idea || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }
    return result
  }, [projects, searchQuery, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length }
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })
    return counts
  }, [projects])

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
    <div className="flex min-h-screen bg-[#F5F0EB]">
      <Sidebar apiOnline={apiOnline} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#2C2420]">Projects</h1>
              <p className="text-sm mt-1 text-[#A19B95]">
                Every mission AIRA has orchestrated
              </p>
            </div>
            <Link href="/project/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] btn-primary">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {/* Search + Filters */}
          {!loading && projects.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A19B95]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="input-field pl-10 pr-9"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[#EDE5DC]">
                    <X className="w-3.5 h-3.5 text-[#A19B95]" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {['all', 'completed', 'running', 'failed'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      statusFilter === s
                        ? 'bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/20'
                        : 'hover:bg-[#EDE5DC] text-[#716B65] border border-transparent'
                    )}>
                    {s === 'all' ? 'All' : STATUS_META[s]?.label || s}
                    <span className="ml-1 text-[10px] opacity-60">{statusCounts[s] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 rounded-2xl text-center"
              style={{ background: 'rgba(139,90,43,0.03)' }}
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                   style={{ background: 'rgba(139,90,43,0.08)' }}>
                <FolderOpen className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-[#2C2420]">No projects yet</h2>
              <p className="text-sm mb-6 text-[#A19B95]">
                Launch your first mission and AIRA&apos;s planets will build it for you.
              </p>
              <Link href="/project/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] btn-primary">
                <Sparkles className="w-4 h-4" />
                Start First Project
              </Link>
            </motion.div>
          )}

          {!loading && projects.length > 0 && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-10 h-10 mx-auto mb-3 text-[#D4C8BC]" />
              <p className="text-sm font-medium text-[#716B65]">No projects match &ldquo;{searchQuery}&rdquo;</p>
              <button onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                className="text-sm text-primary mt-2 hover:underline">
                Clear filters
              </button>
            </div>
          )}

          {!loading && filteredProjects.length > 0 && (
            <div className="space-y-1.5">
              {filteredProjects.map((project, i) => {
                const meta = STATUS_META[project.status] || STATUS_META.pending
                const StatusIcon = meta.icon
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
                        <p className="text-sm font-medium text-[#2C2420] truncate">
                          {project.idea || 'AI Project'}
                        </p>
                        <p className="text-[11px] mt-0.5 text-[#A19B95]">
                          {project.id.slice(0, 8)} &bull;{' '}
                          {project.created_at
                            ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                            : 'just now'}
                        </p>
                      </div>
                    </button>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
                          style={{ background: `${meta.color}10`, color: meta.color }}>
                      <StatusIcon className={clsx('w-2.5 h-2.5', project.status === 'running' && 'animate-spin')} />
                      {meta.label}
                    </span>

                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="p-1.5 rounded-lg hover:bg-[#EDE5DC] transition-colors flex-shrink-0 text-[#A19B95]"
                      title="Open project"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 text-[#A19B95] hover:text-red-500"
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
            <p className="flex items-center gap-2 text-[11px] mt-5 text-[#A19B95]">
              <Brain className="w-3 h-3" />
              Generated projects are saved under backend/outputs/ and can be downloaded from each project&apos;s workspace.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
