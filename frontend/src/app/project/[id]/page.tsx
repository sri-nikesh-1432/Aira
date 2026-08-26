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
  Archive, Check, Loader2, Eye, Globe
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { PlanetCard } from '@/components/planets/PlanetCard'
import { PLANETS, type PlanetId, type PlanetStatus, type Project, type StreamEvent } from '@/types'
import { getProject, streamProject, startPreview, getPreviewStatus, stopPreview, api } from '@/lib/api'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'

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

// ─── Language detector ───────────────────────────────────────────────────────
function getLang(ext: string): string {
  const map: Record<string, string> = {
    '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
    '.py': 'python', '.md': 'markdown', '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml',
    '.css': 'css', '.html': 'html', '.sh': 'bash', '.env': 'bash', '.txt': 'text',
    '.sql': 'sql', '.dockerfile': 'dockerfile', '.toml': 'toml', '.rs': 'rust',
  }
  return map[ext.toLowerCase()] || 'text'
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
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {open ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {open ? <FolderOpen className="w-3 h-3 flex-shrink-0 text-yellow-400" /> : <FolderClosed className="w-3 h-3 flex-shrink-0 text-yellow-400" />}
          <span className="truncate">{node.name}</span>
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
        isSelected ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <File className="w-3 h-3 flex-shrink-0 opacity-60" />
      <span className="truncate">{node.name}</span>
    </button>
  )
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
    // Trigger browser download of each key file
    for (const f of files.slice(0, 20)) {
      try {
        const url = `${API}/api/projects/${projectId}/download/${encodeURIComponent(f.path)}`
        const a = document.createElement('a')
        a.href = url
        a.download = f.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        await new Promise(r => setTimeout(r, 200))
      } catch {}
    }
    setDownloadingZip(false)
    addTerminalLine('$ Download complete')
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

      // Poll until ready (npm install can take a few minutes)
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
    try {
      await stopPreview(projectId)
    } catch {}
    setPreviewState('idle')
    setPreviewUrl(null)
    setPreviewBackendUrl(null)
    setPreviewError('')
    addTerminalLine('$ Preview stopped')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center space-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-lg font-semibold">Project not found</p>
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
    <div className="min-h-screen space-bg flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-border glass-strong sticky top-0 z-30">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate">
            {project.final_output?.project_title || project.request?.idea?.slice(0, 60) || 'AI Project'}
          </h1>
          <p className="text-xs text-slate-500 truncate">{project.request?.idea}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
            isRunning   && 'bg-primary/10 text-primary',
            isCompleted && 'bg-secondary/10 text-secondary',
            project.status === 'failed' && 'bg-error/10 text-error'
          )}>
            {isRunning   && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            {isCompleted && <CheckCircle className="w-3 h-3" />}
            {isRunning ? 'Running' : isCompleted ? 'Complete' : project.status}
          </span>
          {isCompleted && (
            <>
              <button
                onClick={launchPreview}
                disabled={previewState === 'starting'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-medium transition-all"
                title="Boot the generated app and open it in your browser"
              >
                {previewState === 'starting'
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : previewState === 'ready'
                    ? <Eye className="w-3 h-3" />
                    : <Play className="w-3 h-3" />}
                {previewState === 'starting' ? 'Booting...'
                  : previewState === 'ready' ? 'Open Preview'
                  : 'Live Preview'}
              </button>
              {previewUrl && previewState === 'ready' && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-white/10 text-white text-xs font-medium transition-all"
                  title="Open the generated app in a new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              )}
              <button
                onClick={downloadAll}
                disabled={downloadingZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-all"
              >
                {downloadingZip ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
                Download
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: solar system + planet cards */}
        <aside className="w-72 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="p-3 flex justify-center border-b border-border bg-surface/30">
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
            <div className="p-3 border-t border-border">
              <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20">
                <p className="text-xs text-slate-500 mb-1.5">Quality Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.final_output.validation.quality_score}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-secondary"
                    />
                  </div>
                  <span className="text-sm font-bold text-secondary">
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
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:text-white hover:bg-surface-2'
                )}
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
  projectId: string
  files: FileNode[]
  fileTree: FileNode[]
  selectedFile: FileNode | null
  fileContent: string
  fileLoading: boolean
  terminalLines: string[]
  copied: boolean
  isCompleted: boolean
  isRunning: boolean
  previewUrl: string | null
  previewBackendUrl: string | null
  previewState: 'idle' | 'starting' | 'ready' | 'error'
  previewError: string
  onFileSelect: (f: FileNode) => void
  onCopy: () => void
  onRefreshFiles: () => void
  onLaunchPreview: () => void
  onStopPreview: () => void
}) {
  const [panel, setPanel] = useState<'code' | 'terminal' | 'preview'>('code')
  const termRef = useRef<HTMLDivElement>(null)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [terminalLines])

  // Poll the generated backend's health while the preview is up
  useEffect(() => {
    if (previewState !== 'ready' || !previewBackendUrl) {
      setBackendOnline(null)
      return
    }
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(`${previewBackendUrl}/health`, { signal: AbortSignal.timeout(4000) })
        if (!cancelled) setBackendOnline(res.ok)
      } catch {
        if (!cancelled) setBackendOnline(false)
      }
    }
    check()
    const t = setInterval(check, 5000)
    return () => { cancelled = true; clearInterval(t) }
  }, [previewState, previewBackendUrl])

  if (!isCompleted && !isRunning) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <Monitor className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-semibold">AIRA Computer</p>
          <p className="text-slate-600 text-sm mt-1">Start a project to see generated files here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* File tree sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explorer</span>
          <button
            onClick={onRefreshFiles}
            className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            title="Refresh files"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {isRunning && files.length === 0 && (
            <div className="px-3 py-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-slate-500">Planets building...</p>
            </div>
          )}
          {fileTree.map((node, i) => (
            <TreeNode key={i} node={node} depth={0} selected={selectedFile?.path || null} onSelect={onFileSelect} />
          ))}
        </div>

        {files.length > 0 && (
          <div className="border-t border-border px-3 py-2">
            <p className="text-xs text-slate-600">{files.length} files generated</p>
          </div>
        )}
      </div>

      {/* Code viewer + terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Panel tabs */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-surface/50 flex-shrink-0">
          <button
            onClick={() => setPanel('code')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
              panel === 'code' ? 'bg-surface-2 text-white' : 'text-slate-500 hover:text-white'
            )}
          >
            <Code2 className="w-3 h-3" />
            {selectedFile ? selectedFile.name : 'Code View'}
          </button>
          <button
            onClick={() => setPanel('terminal')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
              panel === 'terminal' ? 'bg-surface-2 text-white' : 'text-slate-500 hover:text-white'
            )}
          >
            <Terminal className="w-3 h-3" />
            Terminal
          </button>
          <button
            onClick={() => setPanel('preview')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
              panel === 'preview' ? 'bg-surface-2 text-white' : 'text-slate-500 hover:text-white'
            )}
          >
            <Globe className="w-3 h-3" />
            Live Preview
            {previewState === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />}
          </button>
          {selectedFile && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-xs text-slate-600 font-mono">{selectedFile.path}</span>
              <button
                onClick={onCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Code panel */}
        {panel === 'code' && (
          <div className="flex-1 overflow-auto">
            {fileLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : fileContent ? (
              <pre className="p-4 text-xs leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-all min-h-full">
                <code>{fileContent}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Code2 className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">Select a file to view its contents</p>
                <p className="text-slate-600 text-sm mt-1">
                  {isRunning ? 'Files will appear as planets complete their work' : 'Click any file in the explorer'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Terminal panel */}
        {panel === 'terminal' && (
          <div
            ref={termRef}
            className="flex-1 overflow-auto p-4 font-mono text-xs"
            style={{ background: '#0D0D1A' }}
          >
            {terminalLines.map((line, i) => (
              <div key={i} className={clsx(
                'leading-relaxed',
                line.startsWith('$') ? 'text-secondary' :
                line.includes('ERROR') || line.includes('error') ? 'text-red-400' :
                line.includes('[AIRA]') ? 'text-yellow-400' :
                line.includes('[MERCURY]') ? 'text-slate-400' :
                line.includes('[MARS]') ? 'text-red-300' :
                line.includes('[VENUS]') ? 'text-yellow-300' :
                line.includes('[EARTH]') ? 'text-blue-300' :
                line.includes('[JUPITER]') ? 'text-amber-300' :
                line.includes('[SATURN]') ? 'text-orange-200' :
                line.includes('[NEPTUNE]') ? 'text-indigo-300' :
                line.includes('[URANUS]') ? 'text-cyan-300' :
                line.includes('[PLUTO]') ? 'text-purple-300' :
                'text-slate-300'
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

        {/* Live Preview panel — the real generated app, embedded */}
        {panel === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {previewState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Globe className="w-14 h-14 text-slate-700 mb-4" />
                <p className="text-slate-400 font-semibold text-lg">Test the real product</p>
                <p className="text-slate-600 text-sm mt-1 max-w-md">
                  Boot the generated frontend + backend and interact with the app right here —
                  navigate pages, call the API, try the features.
                </p>
                <button
                  onClick={onLaunchPreview}
                  disabled={!isCompleted}
                  className="btn-primary flex items-center gap-2 mt-6 px-6 py-3 text-sm"
                >
                  <Play className="w-4 h-4" />
                  {isCompleted ? 'Start Live Preview' : 'Waiting for project to complete...'}
                </button>
                {!isCompleted && (
                  <p className="text-xs text-slate-600 mt-2">Preview is available once all planets finish.</p>
                )}
              </div>
            )}

            {previewState === 'starting' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-slate-300 font-medium">Booting generated app...</p>
                <p className="text-slate-600 text-sm mt-1">
                  Installing dependencies &amp; starting the frontend + backend (first time takes a few minutes)
                </p>
              </div>
            )}

            {previewState === 'error' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="w-10 h-10 text-error mb-4" />
                <p className="text-slate-300 font-medium">Preview failed to start</p>
                <p className="text-error text-sm mt-1 max-w-md break-all">{previewError || 'Unknown error'}</p>
                <button onClick={onLaunchPreview} className="btn-ghost mt-5 text-sm">
                  Try Again
                </button>
              </div>
            )}

            {previewState === 'ready' && previewUrl && (
              <>
                {/* Preview toolbar: backend status + actions */}
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-surface/50 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      backendOnline === null ? 'bg-warning animate-pulse' :
                      backendOnline ? 'bg-secondary' : 'bg-error'
                    )} />
                    <span>Backend</span>
                    {previewBackendUrl && (
                      <code className="text-[10px] text-slate-600 font-mono ml-1">{previewBackendUrl}</code>
                    )}
                    <span className="text-slate-600">
                      {backendOnline === null ? 'checking...' : backendOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <a
                      href={previewBackendUrl ? `${previewBackendUrl}/docs` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      API Docs
                    </a>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                    <button
                      onClick={onStopPreview}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-error hover:bg-error/10 transition-all"
                    >
                      <X className="w-3 h-3" />
                      Stop
                    </button>
                  </div>
                </div>

                {/* The real product, embedded */}
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
  events: StreamEvent[]
  project: Project
  logRef: React.RefObject<HTMLDivElement>
}) {
  const allMessages = [
    ...(project.messages || []),
    ...events.map(e => ({
      planet: e.planet || 'aira',
      event: e.event,
      message: e.message,
      quip: e.quip,
      timestamp: new Date().toISOString(),
    }))
  ]

  // Deduplicate by message content
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
        <div className="p-4 rounded-2xl glass border border-yellow-500/20 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FFD70020' }}>☀️</div>
            <div>
              <p className="font-bold text-sm text-yellow-400">AIRA Core</p>
              <p className="text-xs text-slate-500">Central Intelligence • Orchestrator</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic">"I don't solve problems alone. I orchestrate intelligence."</p>
          <p className="text-sm text-white mt-2"><span className="text-slate-500">Mission: </span>{project.request?.idea}</p>
        </div>

        <AnimatePresence initial={false}>
          {unique.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div
                className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                style={{ background: `${PLANET_COLORS[msg.planet] || '#6366F1'}18` }}
              >
                {PLANET_SYMBOLS[msg.planet] || '⚡'}
              </div>
              <div className="flex-1 p-3 rounded-xl glass border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: PLANET_COLORS[msg.planet] || '#6366F1' }}>
                    {msg.planet?.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-600">{msg.event}</span>
                </div>
                <p className="text-sm text-slate-300">{msg.message}</p>
                {msg.quip && (
                  <p className="text-xs mt-1.5 italic opacity-50" style={{ color: PLANET_COLORS[msg.planet] }}>
                    "{msg.quip}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {project.status === 'running' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Planets working...</p>
          </motion.div>
        )}

        {project.status === 'completed' && project.final_output?.validation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl border border-secondary/30 bg-secondary/5 mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <p className="font-bold text-secondary">Mission Complete</p>
            </div>
            <p className="text-sm text-slate-300">{project.final_output.validation.aira_final_note}</p>
            <p className="text-xs text-slate-500 mt-2">
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
        <p className="text-slate-500">Waiting for {planet} to complete...</p>
      </div>
    )
  }

  if (data.status === 'error') {
    return (
      <div className="p-6 m-6 rounded-xl bg-error/10 border border-error/20">
        <p className="text-error font-medium">Planet encountered an error</p>
        <p className="text-sm text-slate-400 mt-1">{data.error}</p>
      </div>
    )
  }

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val == null) return <span className="text-slate-500">—</span>
    if (typeof val === 'string') return <span className="text-slate-300">{val}</span>
    if (typeof val === 'number') return <span className="text-yellow-400">{val}</span>
    if (typeof val === 'boolean') return <span className={val ? 'text-secondary' : 'text-error'}>{String(val)}</span>
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500">[ ]</span>
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
            <div key={k}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k.replace(/_/g, ' ')}</span>
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
            <p className="text-xs italic text-slate-500 max-w-xs text-right">"{data.personality_quip}"</p>
          )}
        </div>

        {data.files_generated?.length > 0 && (
          <div className="p-4 rounded-xl glass border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Files Generated</p>
            <div className="flex flex-wrap gap-1.5">
              {data.files_generated.map((f: string, i: number) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-surface-2 text-slate-400">
                  <FileText className="w-2.5 h-2.5" />{f}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.entries(content)
          .filter(([k]) => k !== 'personality_quip')
          .map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl glass border border-border">
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
