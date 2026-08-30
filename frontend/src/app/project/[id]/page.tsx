'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, CheckCircle, AlertCircle,
  FileText, Code2, Layers, Palette, Rocket, Star,
  ChevronRight, ChevronDown, Copy, ExternalLink,
  Monitor, Terminal, FolderOpen, FolderClosed,
  RefreshCw, Play, X, File,
  Archive, Check, Loader2, Eye, Globe,
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { PlanetCard } from '@/components/planets/PlanetCard'
import { VirtualOffice, EventFeed, CommandCenter, EmployeeBar, AgentDetailPanel, OfficeCanvas, LeftPanel, RightPanel, TeamStatusBar, TopBar } from '@/components/office'
import { useOfficeStore } from '@/store/officeStore'
import { PLANETS, type PlanetId, type Project, type StreamEvent } from '@/types'
import type { AgentId } from '@/types/office'
import { getProject, streamProject, startPreview, getPreviewStatus, stopPreview, api } from '@/lib/api'
import { clsx } from 'clsx'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FileNode {
  name: string
  path: string
  size: number
  ext: string
  isDir?: boolean
  children?: FileNode[]
}

type WorkspaceTab = 'office' | 'planets' | 'computer' | 'research' | 'architecture' | 'design' | 'code' | 'deployment'

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

function TreeNode({ node, depth, selected, onSelect }: {
  node: FileNode; depth: number; selected: string | null; onSelect: (f: FileNode) => void
}) {
  const [open, setOpen] = useState(depth < 2)
  if (node.isDir) {
    return (
      <div>
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded transition-colors hover:bg-[#EDE5DC]"
          style={{ paddingLeft: `${8 + depth * 12}px`, color: '#716B65' }}>
          {open ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {open ? <FolderOpen className="w-3 h-3 flex-shrink-0 text-[#8B5A2B]" /> : <FolderClosed className="w-3 h-3 flex-shrink-0 text-[#D4C8BC]" />}
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
    <button onClick={() => onSelect(node)}
      className={clsx('flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors',
        isSelected ? 'bg-[#8B5A2B]/10 text-[#8B5A2B]' : 'hover:bg-[#EDE5DC]')}
      style={{ paddingLeft: `${8 + depth * 12}px`, color: isSelected ? undefined : '#716B65' }}>
      <File className="w-3 h-3 flex-shrink-0 opacity-60" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

const PLANET_COLORS: Record<string, string> = {
  aira: '#D4A574', mercury: '#9CA3AF', mars: '#DC2626', venus: '#D97706',
  earth: '#2563EB', jupiter: '#B45309', saturn: '#92400E',
  neptune: '#2563EB', uranus: '#0D9488', pluto: '#7C3AED'
}
const PLANET_SYMBOLS: Record<string, string> = {
  aira: '☀️', mercury: '☿', mars: '♂', venus: '♀', earth: '🌍', jupiter: '♃', saturn: '♄', neptune: '♆', uranus: '♅', pluto: '🪐'
}

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

  const officeStore = useOfficeStore()
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev.slice(-100), line])
  }

  // Load project + stream
  useEffect(() => {
    if (!projectId) return
    let cleanup: (() => void) | null = null

    getProject(projectId).then((p) => {
      setProject(p)
      setLoading(false)

      // Initialize office store with project
      officeStore.setProject(projectId, p.request?.idea || '')

      if (p.status === 'running') {
        cleanup = streamProject(projectId, (ev) => {
          setEvents(prev => [...prev, ev])
          if (ev.planet_statuses) setProject(prev => prev ? { ...prev, planet_statuses: ev.planet_statuses as any } : prev)
          if (ev.final_output) setProject(prev => prev ? { ...prev, status: 'completed', final_output: ev.final_output } : prev)
          // Feed SSE events into office store
          officeStore.processStreamEvent(ev)
        }, () => {
          getProject(projectId).then(p2 => {
            setProject(p2)
            if (p2.status === 'completed') {
              loadFiles(projectId)
              addTerminalLine('$ Pipeline complete! Loading generated files...')
              // Auto-switch to computer tab and start preview
              setActiveTab('computer')
              setTimeout(() => launchPreview(), 1000)
            }
          })
        })
      }

      if (p.status === 'completed') {
        loadFiles(projectId)
        // Check if preview is already running for this project
        checkExistingPreview()
      }
    }).catch(() => setLoading(false))

    // Fallback poll every 12s in case SSE disconnects
    const poll = setInterval(async () => {
      try {
        const p = await getProject(projectId)
        setProject(p)
        if (p.status !== 'running') {
          clearInterval(poll)
          if (p.status === 'completed') loadFiles(projectId)
        }
      } catch {}
    }, 12000)

    return () => { cleanup?.(); clearInterval(poll) }
  }, [projectId])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [events])

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollPreviewRef.current) {
        clearInterval(pollPreviewRef.current)
        pollPreviewRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (events.length === 0) return
    const latest = events[events.length - 1]
    if (latest.message) {
      addTerminalLine(`[${latest.planet?.toUpperCase() || 'AIRA'}] ${latest.message}`)
    }
  }, [events])

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

  // Check if a preview is already running for this project
  const checkExistingPreview = async () => {
    try {
      const st = await getPreviewStatus(projectId)
      if (st?.status === 'ready' && st?.frontend_url) {
        setPreviewUrl(st.frontend_url)
        setPreviewBackendUrl(st.backend_url)
        setPreviewState('ready')
        setActiveTab('computer')
        addTerminalLine(`$ Found existing preview: ${st.frontend_url}`)
      } else if (st?.status === 'starting') {
        setPreviewState('starting')
        if (st?.frontend_url) setPreviewUrl(st.frontend_url)
        if (st?.backend_url) setPreviewBackendUrl(st.backend_url)
        setActiveTab('computer')
        addTerminalLine(`$ Found preview still booting — polling...`)
        pollPreview()
      }
    } catch {}
  }

  const pollPreviewRef = useRef<NodeJS.Timeout | null>(null)

  const pollPreview = () => {
    // Clear any existing poll to prevent duplicate intervals
    if (pollPreviewRef.current) {
      clearInterval(pollPreviewRef.current)
      pollPreviewRef.current = null
    }
    pollPreviewRef.current = setInterval(async () => {
      try {
        const st = await getPreviewStatus(projectId)
        if (st?.frontend_url) setPreviewUrl(st.frontend_url)
        if (st?.backend_url) setPreviewBackendUrl(st.backend_url)
        if (st?.status === 'ready') {
          setPreviewState('ready')
          addTerminalLine(`$ Preview ready: ${st.frontend_url}`)
          clearInterval(pollPreviewRef.current!)
          pollPreviewRef.current = null
          launchPreviewRef.current = false
        } else if (st?.status === 'error' || st?.status === 'stopped') {
          setPreviewState('error')
          setPreviewError(st.error || `Preview ${st.status}`)
          addTerminalLine(`$ Preview error: ${st.error || st.status}`)
          clearInterval(pollPreviewRef.current!)
          pollPreviewRef.current = null
          launchPreviewRef.current = false
        } else if (st?.message) {
          addTerminalLine(`$ ${st.message}`)
        }
      } catch {
        clearInterval(pollPreviewRef.current!)
        pollPreviewRef.current = null
        launchPreviewRef.current = false
        setPreviewState('error')
        setPreviewError('Lost connection while starting preview')
      }
    }, 4000)
  }

  const launchPreviewRef = useRef(false)

  const launchPreview = async () => {
    if (previewState === 'starting' || launchPreviewRef.current) return
    launchPreviewRef.current = true
    setPreviewState('starting')
    setPreviewError('')
    addTerminalLine('$ Booting live preview...')
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
        launchPreviewRef.current = false
        return
      }
      // Backend returned quickly — poll for readiness
      addTerminalLine(`$ Backend started. Polling for frontend readiness...`)
      pollPreview()
    } catch (e: any) {
      setPreviewState('error')
      setPreviewError(e?.response?.data?.detail || 'Failed to start preview')
      launchPreviewRef.current = false
    }
  }

  const handleStopPreview = async () => {
    try { await stopPreview(projectId) } catch {}
    if (pollPreviewRef.current) {
      clearInterval(pollPreviewRef.current)
      pollPreviewRef.current = null
    }
    launchPreviewRef.current = false
    setPreviewState('idle')
    setPreviewUrl(null)
    setPreviewBackendUrl(null)
    setPreviewError('')
    addTerminalLine('$ Preview stopped')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EB]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#8B5A2B] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#716B65]">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EB]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-semibold text-[#2C2420]">Project not found</p>
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
    { id: 'office',       label: 'Virtual Office', icon: Globe },
    { id: 'planets',      label: 'Live Feed',    icon: Star },
    { id: 'computer',     label: 'Live Preview', icon: Monitor },
    { id: 'research',     label: 'Research',      icon: FileText },
    { id: 'architecture', label: 'Architecture',  icon: Layers },
    { id: 'design',       label: 'Design',        icon: Palette },
    { id: 'code',         label: 'Code',          icon: Code2 },
    { id: 'deployment',   label: 'Deployment',    icon: Rocket },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0EB]">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 sticky top-0 z-30 bg-[#FFFCF9]/90 backdrop-blur-xl border-b border-[#2C2420]/8">
        <button onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-[#EDE5DC] transition-colors text-[#716B65]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate text-[#2C2420]">
            {project.final_output?.project_title || project.request?.idea?.slice(0, 60) || 'AI Project'}
          </h1>
          <p className="text-xs truncate text-[#A19B95]">{project.request?.idea}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: isRunning ? 'rgba(139,90,43,0.1)' : isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isRunning ? '#8B5A2B' : isCompleted ? '#10B981' : '#EF4444',
                }}>
            {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] animate-pulse" />}
            {isCompleted && <CheckCircle className="w-3 h-3" />}
            {isRunning ? 'Running' : isCompleted ? 'Complete' : project.status}
          </span>
          {isCompleted && (
            <>
              <button onClick={launchPreview} disabled={previewState === 'starting'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                {previewState === 'starting' ? <Loader2 className="w-3 h-3 animate-spin" />
                  : previewState === 'ready' ? <Eye className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {previewState === 'starting' ? 'Booting...'
                  : previewState === 'ready' ? 'Preview Running' : 'Start Preview'}
              </button>
              {previewUrl && previewState === 'ready' && (
                <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[#EDE5DC]"
                   style={{ background: 'rgba(139,90,43,0.06)', color: '#8B5A2B' }}>
                  <ExternalLink className="w-3 h-3" /> Open
                </a>
              )}
              <button onClick={downloadAll} disabled={downloadingZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(139,90,43,0.1)', color: '#8B5A2B' }}>
                {downloadingZip ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
                Download
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-[#2C2420]/8 flex flex-col overflow-hidden bg-[#FFFCF9]">
          <div className="p-3 flex justify-center border-b border-[#2C2420]/5">
            <SolarSystem planetStatuses={project.planet_statuses}
              onPlanetClick={(id) => setActivePlanet(id === activePlanet ? null : id)}
              activePlanet={activePlanet} size="sm" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {PLANETS.map((planet) => (
              <PlanetCard key={planet.id} planet={planet}
                status={project.planet_statuses?.[planet.id] || 'idle'}
                message={planetMessages[planet.id]?.message}
                quip={planetMessages[planet.id]?.quip}
                onClick={() => setActivePlanet(planet.id === activePlanet ? null : planet.id)}
                isActive={activePlanet === planet.id} />
            ))}
          </div>
          {isCompleted && project.final_output?.validation && (
            <div className="p-3 border-t border-[#2C2420]/5">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
                <p className="text-xs mb-1.5 text-[#716B65]">Quality Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#EDE5DC]">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${project.final_output.validation.quality_score}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
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
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2C2420]/8 overflow-x-auto flex-shrink-0 bg-[#FFFCF9]">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/20'
                    : 'hover:bg-[#EDE5DC] text-[#716B65]')}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'computer' && previewState === 'ready' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {tab.id === 'computer' && isCompleted && files.length > 0 && previewState !== 'ready' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#8B5A2B]/15 text-[#8B5A2B] text-xs">{files.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'office' && (
              <div className="flex flex-col h-full overflow-hidden bg-[#0D1117]">
                {/* Top bar */}
                <TopBar
                  isRunning={isRunning}
                  onSubmitProject={async (idea) => {
                    try {
                      const { createProject } = await import('@/lib/api')
                      const result = await createProject({ idea })
                      // Navigate to the new project's workspace
                      window.location.href = `/project/${result.project_id}`
                    } catch (e) {
                      console.error('Failed to create project:', e)
                    }
                  }}
                />
                {/* Main content: Left Panel + Office + Right Panel */}
                <div className="flex flex-1 overflow-hidden">
                  <LeftPanel />
                  <div className="flex-1 overflow-hidden">
                    <OfficeCanvas onAgentClick={(id) => setSelectedAgent(id)} />
                  </div>
                  <RightPanel />
                </div>
                {/* Bottom team status bar */}
                <TeamStatusBar onAgentClick={(id) => setSelectedAgent(id)} />
              </div>
            )}

            {activeTab === 'planets' && <PlanetsTab events={events} project={project} logRef={logRef} />}

            {activeTab === 'computer' && (
              <AIRAComputer projectId={projectId} files={files} fileTree={fileTree}
                selectedFile={selectedFile} fileContent={fileContent} fileLoading={fileLoading}
                terminalLines={terminalLines} copied={copied} isCompleted={isCompleted} isRunning={isRunning}
                previewUrl={previewUrl} previewBackendUrl={previewBackendUrl}
                previewState={previewState} previewError={previewError}
                onFileSelect={openFile} onCopy={copyCode}
                onRefreshFiles={() => loadFiles(projectId)}
                onLaunchPreview={launchPreview} onStopPreview={handleStopPreview} />
            )}

            {activeTab === 'research' && <OutputTab data={project.final_output?.planet_outputs?.mercury} planet="mercury" />}
            {activeTab === 'architecture' && <OutputTab data={project.final_output?.planet_outputs?.mars} planet="mars" />}
            {activeTab === 'design' && <OutputTab data={project.final_output?.planet_outputs?.venus} planet="venus" />}
            {activeTab === 'code' && <OutputTab data={project.final_output?.planet_outputs?.earth} planet="earth" />}
            {activeTab === 'deployment' && <OutputTab data={project.final_output?.planet_outputs?.pluto} planet="pluto" />}
          </div>
        </main>
      </div>

      {/* Agent Detail Panel */}
      <AgentDetailPanel
        agentId={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  )
}

// ─── AIRA Computer (now: Code + Terminal + Live Preview) ──────────────────────
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
  const [panel, setPanel] = useState<'preview' | 'code' | 'terminal'>(
    previewState === 'ready' ? 'preview' : 'code'
  )
  const termRef = useRef<HTMLDivElement>(null)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  // Auto-switch to preview when ready
  useEffect(() => {
    if (previewState === 'ready') setPanel('preview')
  }, [previewState])

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
          <Monitor className="w-16 h-16 mx-auto mb-4 text-[#D4C8BC]" />
          <p className="text-lg font-semibold text-[#716B65]">Live Preview</p>
          <p className="text-sm mt-1 text-[#A19B95]">Start a project to see generated code and live preview here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* File tree sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-[#2C2420]/8 flex flex-col overflow-hidden bg-[#FFFCF9]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#2C2420]/5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#716B65]">Explorer</span>
          <button onClick={onRefreshFiles} className="p-1 rounded hover:bg-[#EDE5DC] transition-colors text-[#716B65]" title="Refresh files">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {isRunning && files.length === 0 && (
            <div className="px-3 py-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin text-[#8B5A2B] mx-auto mb-2" />
              <p className="text-xs text-[#716B65]">Planets building...</p>
            </div>
          )}
          {fileTree.map((node, i) => (
            <TreeNode key={i} node={node} depth={0} selected={selectedFile?.path || null} onSelect={onFileSelect} />
          ))}
        </div>
        {files.length > 0 && (
          <div className="border-t border-[#2C2420]/5 px-3 py-2">
            <p className="text-xs text-[#716B65]">{files.length} files generated</p>
          </div>
        )}
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sub-tabs: Preview / Code / Terminal */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2C2420]/8 flex-shrink-0 bg-[#F5F0EB]">
          {(['preview', 'code', 'terminal'] as const).map((p) => (
            <button key={p} onClick={() => setPanel(p)}
              className={clsx('flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
                panel === p ? 'bg-[#FFFCF9] text-[#8B5A2B] shadow-sm' : 'hover:bg-[#EDE5DC] text-[#716B65]')}>
              {p === 'preview' && <Globe className="w-3 h-3" />}
              {p === 'code' && <Code2 className="w-3 h-3" />}
              {p === 'terminal' && <Terminal className="w-3 h-3" />}
              {p === 'preview' ? 'Live Preview' : p === 'code' ? (selectedFile?.name || 'Code View') : 'Terminal'}
              {p === 'preview' && previewState === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          ))}
          {selectedFile && panel === 'code' && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#A19B95]">{selectedFile.path}</span>
              <button onClick={onCopy} className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-[#EDE5DC] text-[#716B65]">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* ── Live Preview Panel ────────────────────────────── */}
        {panel === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {previewState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FFFCF9]">
                <Globe className="w-14 h-14 mb-4 text-[#D4C8BC]" />
                <p className="font-semibold text-lg text-[#716B65]">Test the real product</p>
                <p className="text-sm mt-1 max-w-md text-[#A19B95]">
                  This will boot THIS project&apos;s generated frontend + backend on unique ports.
                  You can then interact with it — navigate, test features, call the API.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-[#EDE5DC] max-w-sm text-left">
                  <p className="text-xs font-semibold text-[#716B65] mb-2">What happens:</p>
                  <ol className="text-xs text-[#A19B95] space-y-1 list-decimal list-inside">
                    <li>Install frontend dependencies (first time only)</li>
                    <li>Install backend Python packages</li>
                    <li>Start the backend API on its own port</li>
                    <li>Start the frontend on its own port</li>
                    <li>Show the running app right here</li>
                  </ol>
                </div>
                <button onClick={onLaunchPreview} disabled={!isCompleted}
                  className="btn-primary inline-flex items-center gap-2 mt-6">
                  <Play className="w-4 h-4" />
                  {isCompleted ? 'Start Live Preview' : 'Waiting for project to complete...'}
                </button>
              </div>
            )}

            {previewState === 'starting' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FFFCF9]">
                <Loader2 className="w-10 h-10 animate-spin text-[#8B5A2B] mb-4" />
                <p className="font-medium text-[#716B65]">Booting this project&apos;s app...</p>
                <p className="text-sm mt-1 text-[#A19B95]">
                  Installing dependencies &amp; starting the frontend + backend (first time takes a few minutes)
                </p>
                <p className="text-xs mt-3 text-[#D4C8BC]">Each project runs on its own ports — completely independent</p>
              </div>
            )}

            {previewState === 'error' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FFFCF9]">
                <AlertCircle className="w-10 h-10 mb-4 text-red-400" />
                <p className="font-medium text-[#716B65]">Preview failed to start</p>
                <p className="text-sm mt-1 max-w-md break-all text-red-500">{previewError || 'Unknown error'}</p>
                <button onClick={onLaunchPreview} className="btn-ghost mt-5 text-sm">Try Again</button>
              </div>
            )}

            {previewState === 'ready' && previewUrl && (
              <>
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[#2C2420]/8 flex-shrink-0 bg-[#F5F0EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#716B65]">
                    <span className={clsx('w-2 h-2 rounded-full',
                      backendOnline === null ? 'bg-amber-500 animate-pulse' :
                      backendOnline ? 'bg-emerald-500' : 'bg-red-500')} />
                    <span>Backend</span>
                    {previewBackendUrl && (
                      <code className="text-[10px] font-mono ml-1 text-[#A19B95]">{previewBackendUrl}</code>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <a href={previewBackendUrl ? `${previewBackendUrl}/docs` : undefined}
                       target="_blank" rel="noopener noreferrer"
                       className="px-2 py-1 rounded text-xs transition-all hover:bg-[#EDE5DC] text-[#716B65]">API Docs</a>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-[#EDE5DC] text-[#716B65]">
                      <ExternalLink className="w-3 h-3" /> Open in new tab
                    </a>
                    <button onClick={onStopPreview}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:bg-red-50 text-[#716B65]">
                      <X className="w-3 h-3" /> Stop
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <iframe key={previewUrl} src={previewUrl}
                    title="Generated project live preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Code Panel ────────────────────────────────────── */}
        {panel === 'code' && (
          <div className="flex-1 overflow-auto bg-[#FFFCF9]">
            {fileLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B5A2B]" />
              </div>
            ) : fileContent ? (
              <pre className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all min-h-full text-[#5A544E]">
                <code>{fileContent}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Code2 className="w-12 h-12 mb-4 text-[#D4C8BC]" />
                <p className="font-medium text-[#716B65]">Select a file to view its contents</p>
                <p className="text-sm mt-1 text-[#A19B95]">
                  {isRunning ? 'Files will appear as planets complete their work' : 'Click any file in the explorer'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Terminal Panel ────────────────────────────────── */}
        {panel === 'terminal' && (
          <div ref={termRef} className="flex-1 overflow-auto p-4 font-mono text-xs bg-[#EDE5DC]">
            {terminalLines.map((line, i) => (
              <div key={i} className={clsx('leading-relaxed',
                line.startsWith('$') ? 'text-emerald-600' :
                line.includes('ERROR') || line.includes('error') ? 'text-red-500' :
                line.includes('[AIRA]') ? 'text-[#8B5A2B]' :
                line.includes('[MERCURY]') ? 'text-[#716B65]' :
                line.includes('[MARS]') ? 'text-red-400' :
                line.includes('[VENUS]') ? 'text-[#D97706]' :
                line.includes('[EARTH]') ? 'text-blue-500' :
                line.includes('[JUPITER]') ? 'text-[#B45309]' :
                line.includes('[SATURN]') ? 'text-[#92400E]' :
                line.includes('[NEPTUNE]') ? 'text-blue-400' :
                line.includes('[URANUS]') ? 'text-teal-500' :
                line.includes('[PLUTO]') ? 'text-purple-500' : 'text-[#716B65]'
              )}>{line}</div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 mt-1 text-[#8B5A2B]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Planets working...</span>
              </div>
            )}
            <div className="h-2" />
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
        <div className="p-4 rounded-2xl mb-6 bg-amber-50 border border-amber-200/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-amber-100">☀️</div>
            <div>
              <p className="font-bold text-sm text-amber-700">AIRA Core</p>
              <p className="text-xs text-[#A19B95]">Central Intelligence • Orchestrator</p>
            </div>
          </div>
          <p className="text-xs italic text-[#A19B95]">&ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;</p>
          <p className="text-sm mt-2"><span className="text-[#A19B95]">Mission: </span>{project.request?.idea}</p>
        </div>

        <AnimatePresence initial={false}>
          {unique.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                   style={{ background: `${PLANET_COLORS[msg.planet] || '#8B5A2B'}12` }}>
                {PLANET_SYMBOLS[msg.planet] || '⚡'}
              </div>
              <div className="flex-1 p-3 rounded-xl glass-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: PLANET_COLORS[msg.planet] || '#8B5A2B' }}>
                    {msg.planet?.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#A19B95]">{msg.event}</span>
                </div>
                <p className="text-sm text-[#5A544E]">{msg.message}</p>
                {msg.quip && (
                  <p className="text-xs mt-1.5 italic text-[#A19B95]">&ldquo;{msg.quip}&rdquo;</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {project.status === 'running' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#8B5A2B]/10">
              <div className="w-3 h-3 rounded-full border border-[#8B5A2B] border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#716B65]">Planets working...</p>
          </motion.div>
        )}

        {project.status === 'completed' && project.final_output?.validation && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl mt-4 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="font-bold text-emerald-600">Mission Complete</p>
            </div>
            <p className="text-sm text-[#716B65]">{project.final_output.validation.aira_final_note}</p>
            <p className="text-xs mt-2 text-[#A19B95]">
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
  const color = PLANET_COLORS[planet] || '#8B5A2B'
  const sym = PLANET_SYMBOLS[planet] || '⚡'
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-4xl mb-3 opacity-20">{sym}</div>
        <p className="text-[#716B65]">Waiting for {planet} to complete...</p>
      </div>
    )
  }
  if (data.status === 'error') {
    return (
      <div className="p-6 m-6 rounded-xl bg-red-50 border border-red-200">
        <p className="font-medium text-red-600">Planet encountered an error</p>
        <p className="text-sm mt-1 text-[#716B65]">{data.error}</p>
      </div>
    )
  }
  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val == null) return <span className="text-[#A19B95]">&mdash;</span>
    if (typeof val === 'string') return <span className="text-[#5A544E]">{val}</span>
    if (typeof val === 'number') return <span className="text-[#8B5A2B]">{val}</span>
    if (typeof val === 'boolean') return <span className={val ? 'text-emerald-600' : 'text-red-500'}>{String(val)}</span>
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-[#A19B95]">[ ]</span>
      return (
        <ul className="space-y-0.5 mt-1">
          {val.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#8B5A2B] text-xs mt-1">•</span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A19B95]">{k.replace(/_/g, ' ')}</span>
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
            <p className="text-xs italic max-w-xs text-right text-[#A19B95]">&ldquo;{data.personality_quip}&rdquo;</p>
          )}
        </div>
        {data.files_generated?.length > 0 && (
          <div className="p-4 rounded-xl glass-card">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-[#A19B95]">Files Generated</p>
            <div className="flex flex-wrap gap-1.5">
              {data.files_generated.map((f: string, i: number) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F5F0EB] text-[#716B65]">
                  <FileText className="w-2.5 h-2.5" />{f}
                </span>
              ))}
            </div>
          </div>
        )}
        {Object.entries(content).filter(([k]) => k !== 'personality_quip').map(([key, value]) => (
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
