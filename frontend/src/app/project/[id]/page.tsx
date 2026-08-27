'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, CheckCircle, AlertCircle,
  FileText, Code2, Layers, Palette, Rocket, Star,
  ChevronRight, ChevronDown, Copy, ExternalLink,
  Monitor, Terminal, FolderOpen, FolderClosed,
  RefreshCw, Play, Maximize2, X, File,
  Archive, Check, Loader2, Eye, Globe, Zap,
  Brain,
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { PlanetCard } from '@/components/planets/PlanetCard'
import { PLANETS, type PlanetId, type PlanetStatus, type Project, type StreamEvent } from '@/types'
import { getProject, streamProject, startPreview, getPreviewStatus, stopPreview, api } from '@/lib/api'
import { clsx } from 'clsx'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FileNode {
  name: string
  path: string
  size: number
  ext: string
  isDir?: boolean
  children?: FileNode[]
}

type WorkspaceTab = 'planets' | 'computer' | 'research' | 'architecture' | 'design' | 'code' | 'deployment'

// ─── File tree builder ────────────────────────────────────────────────────────
function buildTree(files: FileNode[]): FileNode[] {
  const root: FileNode[] = []
  const map: Record<string, FileNode> = {}

  files.forEach(file => {
    const parts = file.path.split('/')
    let current = root

    parts.forEach((part, i) => {
      const pathSoFar = parts.slice(0, i + 1).join('/')
      if (i === parts.length - 1) {
        current.push({ ...file, name: part })
      } else {
        if (!map[pathSoFar]) {
          const dir: FileNode = { name: part, path: pathSoFar, size: 0, ext: '', isDir: true, children: [] }
          map[pathSoFar] = dir
          current.push(dir)
        }
        current = map[pathSoFar].children!
      }
    })
  })

  return root
}

// ─── File Tree Node ───────────────────────────────────────────────────────────
function TreeNode({ node, depth, selected, onSelect }: {
  node: FileNode
  depth: number
  selected: string | null
  onSelect: (f: FileNode) => void
}) {
  const [open, setOpen] = useState(depth < 2)

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded transition-colors hover:bg-white/[0.04]"
          style={{ paddingLeft: `${8 + depth * 12}px`, color: '#71717A' }}
        >
          {open ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {open ? <FolderOpen className="w-3 h-3 flex-shrink-0 text-yellow-400" /> : <FolderClosed className="w-3 h-3 flex-shrink-0 text-yellow-400" />}
          <span className="truncate text-xs">{node.name}</span>
        </button>
        {open && node.children?.map((child, i) => (
          <TreeNode key={i} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  const isSelected = selected === node.path
  return (
    <button
      onClick={() => onSelect(node)}
      className={clsx(
        'flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors',
        isSelected ? 'bg-primary/20 text-primary' : 'hover:text-white hover:bg-white/[0.04]'
      )}
      style={{ paddingLeft: `${8 + depth * 12}px`, color: isSelected ? undefined : '#71717A' }}
    >
      <File className="w-3 h-3 flex-shrink-0 opacity-60" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

const PLANET_COLORS: Record<string, string> = {
  aira: '#FFD700', mercury: '#B5A9A9', mars: '#CF4B2B', venus: '#E8B86D',
  earth: '#4B9CD3', jupiter: '#C8A951', saturn: '#A89070',
  neptune: '#4B7BE8', uranus: '#7EC8C8', pluto: '#9B8EAE'
}
const PLANET_SYMBOLS: Record<string, string> = {
  aira: '☀️', mercury: '☿', mars: '♂', venus: '♀', earth: '🌍',
  jupiter: '♃', saturn: '♄', neptune: '♆', uranus: '♅', pluto: '🪐'
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('planets')
  const [activePlanet, setActivePlanet] = useState<PlanetId | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // AIRA Computer state
  const [files, setFiles] = useState<FileNode[]>([])
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [fileLoading, setFileLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBackendUrl, setPreviewBackendUrl] = useState<string | null>(null)
  const [previewState, setPreviewState] = useState<'idle' | 'starting' | 'ready' | 'error'>('idle')
  const [previewError, setPreviewError] = useState('')
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '$ AIRA Computer initialized',
    '$ Waiting for project to complete...',
  ])
  const [downloadingZip, setDownloadingZip] = useState(false)

  // Load project + stream
  useEffect(() => {
    if (!projectId) return
    let cleanup: (() => void) | null = null

    getProject(projectId).then((p) => {
      setProject(p)
      setLoading(false)

      if (p.status === 'running') {
        cleanup = streamProject(projectId, (ev) => {
          setEvents(prev => [...prev, ev])
          if (ev.planet_statuses) {
            setProject(prev => prev ? { ...prev, planet_statuses: ev.planet_statuses as any } : prev)
          }
          if (ev.final_output) {
            setProject(prev => prev ? { ...prev, status: 'completed', final_output: ev.final_output } : prev)
          }
        }, () => {
          getProject(projectId).then(p2 => {
            setProject(p2)
            if (p2.status === 'completed') {
              loadFiles(projectId)
              addTerminalLine('$ Pipeline complete! Loading generated files...')
            }
          })
        })
      }

      if (p.status === 'completed') {
        loadFiles(projectId)
      }
    }).catch(() => setLoading(false))

    const poll = setInterval(async () => {
      try {
        const p = await getProject(projectId)
        setProject(p)
        if (p.status !== 'running') {
          clearInterval(poll)
          if (p.status === 'completed') loadFiles(projectId)
        }
      } catch {}
    }, 4000)

    return () => { cleanup?.(); clearInterval(poll) }
  }, [projectId])

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [events])

  // Terminal lines from events
  useEffect(() => {
    if (events.length === 0) return
    const latest = events[events.length - 1]
    if (latest.message) {
      addTerminalLine(`[${latest.planet?.toUpperCase() || 'AIRA'}] ${latest.message}`)
    }
  }, [events])

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev.slice(-100), line])
  }

  const loadFiles = async (pid: string) => {
    try {
      const res = await api.get(`/api/projects/${pid}/files`)
      const fileList: FileNode[] = res.data.files || []
      setFiles(fileList)
      setFileTree(buildTree(fileList))
      addTerminalLine(`$ Loaded ${fileList.length} generated files`)
    } catch {}
  }

  const openFile = async (node: FileNode) => {
    setSelectedFile(node)
    setFileContent('')
    setFileLoading(true)
    setActiveTab('computer')
    try {
      const res = await api.get(`/api/projects/${projectId}/file?path=${encodeURIComponent(node.path)}`)
      setFileContent(res.data.content || '')
      addTerminalLine(`$ cat ${node.path}`)
    } catch {
      setFileContent('// Could not load file content')
    } finally {
      setFileLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAll = async () => {
    setDownloadingZip(true)
    addTerminalLine('$ Creating project archive...')
    const url = `${API}/api/projects/${projectId}/download-zip`
    const a = document.createElement('a')
    a.href = url
    a.download = `AIRA-project-${projectId.slice(0, 8)}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloadingZip(false)
    addTerminalLine('$ Download started')
  }

  // Boot the generated product as a live preview
  const launchPreview = async () => {
    setPreviewState('starting')
    setPreviewError('')
    addTerminalLine('$ Booting live preview (installing deps + starting servers)...')
    try {
      const info = await startPreview(projectId)
      if (info?.status === 'error') {
        setPreviewState('error')
        setPreviewError(info.error || 'Preview failed to start')
        addTerminalLine(`$ Preview error: ${info.error || 'unknown'}`)
        return
      }
      if (info?.frontend_url) setPreviewUrl(info.frontend_url)
      if (info?.backend_url) setPreviewBackendUrl(info.backend_url)
      if (info?.status === 'ready') {
        setPreviewState('ready')
        addTerminalLine(`$ Preview ready: ${info.frontend_url}`)
        return
      }

      // Poll until ready
      const poll = setInterval(async () => {
        try {
          const st = await getPreviewStatus(projectId)
          if (st?.frontend_url) setPreviewUrl(st.frontend_url)
          if (st?.backend_url) setPreviewBackendUrl(st.backend_url)
          if (st?.status === 'ready') {
            setPreviewState('ready')
            addTerminalLine(`$ Preview ready: ${st.frontend_url}`)
            clearInterval(poll)
          } else if (st?.status === 'error' || st?.status === 'stopped') {
            setPreviewState('error')
            setPreviewError(st.error || `Preview ${st.status}`)
            addTerminalLine(`$ Preview error: ${st.error || st.status}`)
            clearInterval(poll)
          } else if (st?.message) {
            addTerminalLine(`$ ${st.message}`)
          }
        } catch {
          clearInterval(poll)
          setPreviewState('error')
          setPreviewError('Lost connection while starting preview')
        }
      }, 5000)
    } catch (e: any) {
      setPreviewState('error')
      setPreviewError(e?.response?.data?.detail || 'Failed to start preview')
    }
  }

  const handleStopPreview = async () => {
    try { await stopPreview(projectId) } catch {}
    setPreviewState('idle')
    setPreviewUrl(null)
    setPreviewBackendUrl(null)
    setPreviewError('')
    addTerminalLine('$ Preview stopped')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090B' }}>
        <div className="text-center">              <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090B' }}>
        <div className="text-center">              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-zinc-900">Project not found</p>
          <button onClick={() => router.push('/dashboard')} className="btn-ghost mt-4">Back</button>
        </div>
      </div>
    )
  }

  const isRunning = project.status === 'running'
  const isCompleted = project.status === 'completed'

  const planetMessages = (project.messages || []).reduce<Record<string, { message: string; quip?: string }>>((acc, m) => {
    if (m.planet && m.message) acc[m.planet] = { message: m.message, quip: m.quip }
    return acc
  }, {})

  const tabs: { id: WorkspaceTab; label: string; icon: any }[] = [
    { id: 'planets',      label: 'Live Feed',    icon: Star },
    { id: 'computer',     label: 'AIRA Computer', icon: Monitor },
    { id: 'research',     label: 'Research',      icon: FileText },
    { id: 'architecture', label: 'Architecture',  icon: Layers },
    { id: 'design',       label: 'Design',        icon: Palette },
    { id: 'code',         label: 'Code',          icon: Code2 },
    { id: 'deployment',   label: 'Deployment',    icon: Rocket },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <button onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate text-zinc-900">
            {project.final_output?.project_title || project.request?.idea?.slice(0, 60) || 'AI Project'}
          </h1>
          <p className="text-xs truncate text-zinc-400">{project.request?.idea}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: isRunning ? 'rgba(99,102,241,0.1)' : isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isRunning ? '#6366F1' : isCompleted ? '#10B981' : '#EF4444',
                }}>
            {isRunning   && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            {isCompleted && <CheckCircle className="w-3 h-3" />}
            {isRunning ? 'Running' : isCompleted ? 'Complete' : project.status}
          </span>
          {isCompleted && (
            <>
              <button
                onClick={launchPreview}
                disabled={previewState === 'starting'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                title="Boot the generated app and open it in your browser"
              >
                {previewState === 'starting'
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : previewState === 'ready'
                    ? <Eye className="w-3 h-3" />
                    : <Play className="w-3 h-3" />}
                {previewState === 'starting' ? 'Booting...'
                  : previewState === 'ready' ? 'Preview Ready'
                  : 'Live Preview'}
              </button>
              {previewUrl && previewState === 'ready' && (
                <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/[0.08]"
                   style={{ background: 'rgba(255,255,255,0.05)', color: '#FAFAFA' }}
                   title="Open the generated app in a new tab">
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              )}
              <button
                onClick={downloadAll}
                disabled={downloadingZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                {downloadingZip ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
                Download ZIP
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-zinc-200 flex flex-col overflow-hidden bg-white">
          <div className="p-3 flex justify-center border-b border-zinc-100">
            <SolarSystem
              planetStatuses={project.planet_statuses}
              onPlanetClick={(id) => setActivePlanet(id === activePlanet ? null : id)}
              activePlanet={activePlanet}
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {PLANETS.map((planet) => (
              <PlanetCard
                key={planet.id}
                planet={planet}
                status={project.planet_statuses?.[planet.id] || 'idle'}
                message={planetMessages[planet.id]?.message}
                quip={planetMessages[planet.id]?.quip}
                onClick={() => setActivePlanet(planet.id === activePlanet ? null : planet.id)}
                isActive={activePlanet === planet.id}
              />
            ))}
          </div>

          {isCompleted && project.final_output?.validation && (
            <div className="p-3 border-t border-white/[0.06]">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-xs mb-1.5" style={{ color: '#52525B' }}>Quality Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.final_output.validation.quality_score}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                  <span className="text-sm font-bold text-emerald-500">
                    {project.final_output.validation.quality_score}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200 overflow-x-auto flex-shrink-0 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:text-white hover:bg-white/[0.04]'
                )}
                style={activeTab !== tab.id ? { color: '#71717A' } : {}}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'computer' && isCompleted && files.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                    {files.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'planets' && (
              <PlanetsTab events={events} project={project} logRef={logRef} />
            )}

            {activeTab === 'computer' && (
              <AIRAComputer
                projectId={projectId}
                files={files}
                fileTree={fileTree}
                selectedFile={selectedFile}
                fileContent={fileContent}
                fileLoading={fileLoading}
                terminalLines={terminalLines}
                copied={copied}
                isCompleted={isCompleted}
                isRunning={isRunning}
                previewUrl={previewUrl}
                previewBackendUrl={previewBackendUrl}
                previewState={previewState}
                previewError={previewError}
                onFileSelect={openFile}
                onCopy={copyCode}
                onRefreshFiles={() => loadFiles(projectId)}
                onLaunchPreview={launchPreview}
                onStopPreview={handleStopPreview}
              />
            )}

            {activeTab === 'research' && (
              <OutputTab data={project.final_output?.planet_outputs?.mercury} planet="mercury" />
            )}
            {activeTab === 'architecture' && (
              <OutputTab data={project.final_output?.planet_outputs?.mars} planet="mars" />
            )}
            {activeTab === 'design' && (
              <OutputTab data={project.final_output?.planet_outputs?.venus} planet="venus" />
            )}
            {activeTab === 'code' && (
              <OutputTab data={project.final_output?.planet_outputs?.earth} planet="earth" />
            )}
            {activeTab === 'deployment' && (
              <OutputTab data={project.final_output?.planet_outputs?.pluto} planet="pluto" />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── AIRA Computer ────────────────────────────────────────────────────────────
function AIRAComputer({
  projectId, files, fileTree, selectedFile, fileContent,
  fileLoading, terminalLines, copied, isCompleted, isRunning,
  previewUrl, previewBackendUrl, previewState, previewError,
  onFileSelect, onCopy, onRefreshFiles, onLaunchPreview, onStopPreview,
}: {
  projectId: string; files: FileNode[]; fileTree: FileNode[]
  selectedFile: FileNode | null; fileContent: string; fileLoading: boolean
  terminalLines: string[]; copied: boolean; isCompleted: boolean; isRunning: boolean
  previewUrl: string | null; previewBackendUrl: string | null
  previewState: 'idle' | 'starting' | 'ready' | 'error'; previewError: string
  onFileSelect: (f: FileNode) => void; onCopy: () => void
  onRefreshFiles: () => void; onLaunchPreview: () => void; onStopPreview: () => void
}) {
  const [panel, setPanel] = useState<'code' | 'terminal' | 'preview'>('code')
  const termRef = useRef<HTMLDivElement>(null)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [terminalLines])

  useEffect(() => {
    if (previewState !== 'ready' || !previewBackendUrl) { setBackendOnline(null); return }
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(`${previewBackendUrl}/health`, { signal: AbortSignal.timeout(4000) })
        if (!cancelled) setBackendOnline(res.ok)
      } catch { if (!cancelled) setBackendOnline(false) }
    }
    check()
    const t = setInterval(check, 5000)
    return () => { cancelled = true; clearInterval(t) }
  }, [previewState, previewBackendUrl])

  if (!isCompleted && !isRunning) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <Monitor className="w-16 h-16 mx-auto mb-4" style={{ color: '#27272A' }} />
          <p className="text-lg font-semibold" style={{ color: '#71717A' }}>AIRA Computer</p>
          <p className="text-sm mt-1" style={{ color: '#3F3F46' }}>Start a project to see generated files here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* File tree sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Explorer</span>
          <button onClick={onRefreshFiles} className="p-1 rounded hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#52525B' }} title="Refresh files">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {isRunning && files.length === 0 && (
            <div className="px-3 py-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs" style={{ color: '#52525B' }}>Planets building...</p>
            </div>
          )}
          {fileTree.map((node, i) => (
            <TreeNode key={i} node={node} depth={0} selected={selectedFile?.path || null} onSelect={onFileSelect} />
          ))}
        </div>
        {files.length > 0 && (
          <div className="border-t border-white/[0.06] px-3 py-2">
            <p className="text-xs" style={{ color: '#3F3F46' }}>{files.length} files generated</p>
          </div>
        )}
      </div>

      {/* Code viewer + terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.06] flex-shrink-0"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          {(['code', 'terminal', 'preview'] as const).map((p) => (
            <button key={p} onClick={() => setPanel(p)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
                panel === p ? 'bg-white/[0.08] text-white' : 'hover:text-white'
              )}
              style={panel !== p ? { color: '#52525B' } : {}}>
              {p === 'code' && <Code2 className="w-3 h-3" />}
              {p === 'terminal' && <Terminal className="w-3 h-3" />}
              {p === 'preview' && <Globe className="w-3 h-3" />}
              {p === 'code' ? (selectedFile?.name || 'Code View') : p === 'terminal' ? 'Terminal' : 'Live Preview'}
              {p === 'preview' && previewState === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          ))}
          {selectedFile && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[10px] font-mono" style={{ color: '#3F3F46' }}>{selectedFile.path}</span>
              <button onClick={onCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-white/[0.04]"
                style={{ color: '#52525B' }}>
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {panel === 'code' && (
          <div className="flex-1 overflow-auto">
            {fileLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : fileContent ? (
              <pre className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all min-h-full"
                   style={{ color: '#D4D4D8' }}>
                <code>{fileContent}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Code2 className="w-12 h-12 mb-4 text-zinc-300" />
                <p className="font-medium text-zinc-500">Select a file to view its contents</p>
                <p className="text-sm mt-1 text-zinc-400">
                  {isRunning ? 'Files will appear as planets complete their work' : 'Click any file in the explorer'}
                </p>
              </div>
            )}
          </div>
        )}

        {panel === 'terminal' && (
          <div ref={termRef} className="flex-1 overflow-auto p-4 font-mono text-xs bg-zinc-50">
            {terminalLines.map((line, i) => (
              <div key={i} className={clsx(
                'leading-relaxed',
                line.startsWith('$') ? 'text-emerald-500' :
                line.includes('ERROR') || line.includes('error') ? 'text-red-400' :
                line.includes('[AIRA]') ? 'text-yellow-400' :
                line.includes('[MERCURY]') ? 'text-zinc-400' :
                line.includes('[MARS]') ? 'text-red-300' :
                line.includes('[VENUS]') ? 'text-yellow-300' :
                line.includes('[EARTH]') ? 'text-blue-300' :
                line.includes('[JUPITER]') ? 'text-amber-300' :
                line.includes('[SATURN]') ? 'text-orange-200' :
                line.includes('[NEPTUNE]') ? 'text-indigo-300' :
                line.includes('[URANUS]') ? 'text-cyan-300' :
                line.includes('[PLUTO]') ? 'text-purple-300' :
                'text-zinc-300'
              )}>
                {line}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 mt-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Planets working...</span>
              </div>
            )}
            <div className="h-2" />
          </div>
        )}

        {panel === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {previewState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Globe className="w-14 h-14 mb-4" style={{ color: '#27272A' }} />
                <p className="font-semibold text-lg" style={{ color: '#71717A' }}>Test the real product</p>
                <p className="text-sm mt-1 max-w-md" style={{ color: '#3F3F46' }}>
                  Boot the generated frontend + backend and interact with the app right here —
                  navigate pages, call the API, try the features.
                </p>
                <button onClick={onLaunchPreview} disabled={!isCompleted}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: isCompleted ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : '#E4E4E7' }}>
                  <Play className="w-4 h-4" />
                  {isCompleted ? 'Start Live Preview' : 'Waiting for project to complete...'}
                </button>
                {!isCompleted && (
                  <p className="text-xs mt-2" style={{ color: '#3F3F46' }}>Preview is available once all planets finish.</p>
                )}
              </div>
            )}

            {previewState === 'starting' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="font-medium" style={{ color: '#A1A1AA' }}>Booting generated app...</p>
                <p className="text-sm mt-1" style={{ color: '#3F3F46' }}>
                  Installing dependencies &amp; starting the frontend + backend (first time takes a few minutes)
                </p>
              </div>
            )}

            {previewState === 'error' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="w-10 h-10 mb-4" style={{ color: '#EF4444' }} />
                <p className="font-medium" style={{ color: '#A1A1AA' }}>Preview failed to start</p>
                <p className="text-sm mt-1 max-w-md break-all" style={{ color: '#EF4444' }}>{previewError || 'Unknown error'}</p>
                <button onClick={onLaunchPreview} className="btn-ghost mt-5 text-sm">Try Again</button>
              </div>
            )}

            {previewState === 'ready' && previewUrl && (
              <>
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/[0.06] flex-shrink-0"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#71717A' }}>
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      backendOnline === null ? 'bg-yellow-500 animate-pulse' :
                      backendOnline ? 'bg-emerald-500' : 'bg-red-500'
                    )} />
                    <span>Backend</span>
                    {previewBackendUrl && (
                      <code className="text-[10px] font-mono ml-1" style={{ color: '#3F3F46' }}>{previewBackendUrl}</code>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <a href={previewBackendUrl ? `${previewBackendUrl}/docs` : undefined}
                       target="_blank" rel="noopener noreferrer"
                       className="px-2 py-1 rounded text-xs transition-all hover:bg-white/[0.04]"
                       style={{ color: '#71717A' }}>API Docs</a>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-white/[0.04]"
                       style={{ color: '#71717A' }}>
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                    <button onClick={onStopPreview}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-red-500/10"
                      style={{ color: '#71717A' }}>
                      <X className="w-3 h-3" />
                      Stop
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <iframe
                    src={previewUrl}
                    title="Generated product live preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Live Feed Tab ────────────────────────────────────────────────────────────
function PlanetsTab({ events, project, logRef }: {
  events: StreamEvent[]; project: Project; logRef: React.RefObject<HTMLDivElement>
}) {
  const allMessages = [
    ...(project.messages || []),
    ...events.map(e => ({
      planet: e.planet || 'aira', event: e.event, message: e.message,
      quip: e.quip, timestamp: new Date().toISOString(),
    }))
  ]

  const seen = new Set<string>()
  const unique = allMessages.filter(m => {
    const key = `${m.planet}:${m.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <div className="h-full overflow-y-auto p-6" ref={logRef}>
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Mission brief */}
        <div className="p-4 rounded-2xl mb-6 bg-amber-50 border border-amber-200/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-amber-100">☀️</div>
            <div>
              <p className="font-bold text-sm text-amber-700">AIRA Core</p>
              <p className="text-xs text-zinc-400">Central Intelligence • Orchestrator</p>
            </div>
          </div>
          <p className="text-xs italic text-zinc-400">"I don't solve problems alone. I orchestrate intelligence."</p>
          <p className="text-sm mt-2"><span className="text-zinc-400">Mission: </span>{project.request?.idea}</p>
        </div>

        <AnimatePresence initial={false}>
          {unique.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                   style={{ background: `${PLANET_COLORS[msg.planet] || '#6366F1'}12` }}>
                {PLANET_SYMBOLS[msg.planet] || '⚡'}
              </div>
              <div className="flex-1 p-3 rounded-xl glass-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: PLANET_COLORS[msg.planet] || '#6366F1' }}>
                    {msg.planet?.toUpperCase()}
                  </span>
                  <span className="text-xs" style={{ color: '#3F3F46' }}>{msg.event}</span>
                </div>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>{msg.message}</p>
                {msg.quip && (
                  <p className="text-xs mt-1.5 italic" style={{ color: PLANET_COLORS[msg.planet], opacity: 0.5 }}>
                    "{msg.quip}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {project.status === 'running' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm" style={{ color: '#52525B' }}>Planets working...</p>
          </motion.div>
        )}

        {project.status === 'completed' && project.final_output?.validation && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl mt-4 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="font-bold text-emerald-500">Mission Complete</p>
            </div>
            <p className="text-sm text-zinc-500">{project.final_output.validation.aira_final_note}</p>
            <p className="text-xs mt-2 text-zinc-400">
              {project.final_output.validation.planets_completed}/9 planets • Quality: {project.final_output.validation.quality_score}%
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── Generic planet output tab ────────────────────────────────────────────────
function OutputTab({ data, planet }: { data: any; planet: string }) {
  const color = PLANET_COLORS[planet] || '#6366F1'
  const sym = PLANET_SYMBOLS[planet] || '⚡'

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-4xl mb-3 opacity-20">{sym}</div>
        <p style={{ color: '#52525B' }}>Waiting for {planet} to complete...</p>
      </div>
    )
  }

  if (data.status === 'error') {
    return (        <div className="p-6 m-6 rounded-xl bg-red-50 border border-red-200">
        <p className="font-medium text-red-600">Planet encountered an error</p>
        <p className="text-sm mt-1 text-zinc-500">{data.error}</p>
      </div>
    )
  }

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val == null) return <span style={{ color: '#52525B' }}>—</span>
    if (typeof val === 'string') return <span style={{ color: '#A1A1AA' }}>{val}</span>
    if (typeof val === 'number') return <span className="text-yellow-400">{val}</span>
    if (typeof val === 'boolean') return <span style={{ color: val ? '#10B981' : '#EF4444' }}>{String(val)}</span>
    if (Array.isArray(val)) {
      if (val.length === 0) return <span style={{ color: '#52525B' }}>[ ]</span>
      return (
        <ul className="space-y-0.5 mt-1">
          {val.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-primary text-xs mt-1">•</span>
              <span>{renderValue(item, depth + 1)}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (typeof val === 'object') {
      return (
        <div className={clsx('space-y-2', depth > 0 && 'ml-4 mt-1')}>
          {Object.entries(val).map(([k, v]) => (
            <div key={k}>                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{k.replace(/_/g, ' ')}</span>
              <div className="mt-0.5 text-sm">{renderValue(v, depth + 1)}</div>
            </div>
          ))}
        </div>
      )
    }
    return <span>{String(val)}</span>
  }

  const skip = new Set(['status', 'planet', 'files_generated'])
  const content = Object.fromEntries(Object.entries(data).filter(([k]) => !skip.has(k)))

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-bold capitalize text-sm" style={{ color }}>{planet} Output</span>
          </div>
          {data.personality_quip && (
            <p className="text-xs italic max-w-xs text-right" style={{ color: '#52525B' }}>"{data.personality_quip}"</p>
          )}
        </div>

        {data.files_generated?.length > 0 && (
          <div className="p-4 rounded-xl glass-card">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-zinc-400">Files Generated</p>
            <div className="flex flex-wrap gap-1.5">
              {data.files_generated.map((f: string, i: number) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#71717A' }}>
                  <FileText className="w-2.5 h-2.5" />{f}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.entries(content)
          .filter(([k]) => k !== 'personality_quip')
          .map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl glass-card">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                {key.replace(/_/g, ' ')}
              </p>
              <div className="text-sm">{renderValue(value)}</div>
            </div>
          ))}
      </div>
    </div>
  )
}
