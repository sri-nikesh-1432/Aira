'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { TopBar } from '@/components/office/TopBar'
import { LeftPanel } from '@/components/office/LeftPanel'
import { OfficeCanvas } from '@/components/office/OfficeCanvas'
import { RightPanel } from '@/components/office/RightPanel'
import { TeamStatusBar } from '@/components/office/TeamStatusBar'
import { AgentDetailPanel } from '@/components/office/AgentDetailPanel'
import type { AgentId } from '@/types/office'
import { createProject, streamProject, checkHealth } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function OfficePage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)
  const router = useRouter()
  const { user } = useAuthStore()

  const officeStore = useOfficeStore()
  const phase = useOfficeStore((s) => s.phase)
  const projectId = useOfficeStore((s) => s.projectId)

  // Check API health on mount
  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  // Track running state from phase
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'completed') {
      setIsRunning(true)
    } else if (phase === 'completed') {
      setIsRunning(false)
    }
  }, [phase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const handleSubmitProject = useCallback(async (idea: string) => {
    if (!idea.trim() || isRunning) return

    setShowWelcome(false)
    setIsRunning(true)
    officeStore.reset()
    officeStore.setProject('pending', idea)

    try {
      const result = await createProject({ idea })
      const pid = result.project_id
      officeStore.setProject(pid, idea)

      // Connect to SSE stream
      cleanupRef.current = streamProject(pid, (event) => {
        officeStore.processStreamEvent(event)
        if (event.event === 'completed' || event.event === 'error') {
          setIsRunning(false)
        }
      }, () => {
        setIsRunning(false)
      })
    } catch (e: any) {
      console.error('Failed to create project:', e)
      setIsRunning(false)
      // If unauthorized, redirect to login
      if (e?.response?.status === 401) {
        router.push('/login')
      }
    }
  }, [isRunning, officeStore, router])

  const handleRunDemo = useCallback(() => {
    setShowWelcome(false)
    officeStore.runDemo()
    setIsRunning(true)
  }, [officeStore])

  const handleAgentClick = useCallback((agentId: AgentId) => {
    setSelectedAgent(agentId === selectedAgent ? null : agentId)
  }, [selectedAgent])

  return (
    <div className="h-screen flex flex-col bg-[#0A0E14] overflow-hidden">
      {/* Top Bar */}
      <TopBar
        onSubmitProject={handleSubmitProject}
        onRunDemo={handleRunDemo}
        isRunning={isRunning}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <LeftPanel />

        {/* Office Canvas (center) */}
        <div className="flex-1 overflow-hidden relative">
          {/* Welcome overlay when no project is active */}
          <AnimatePresence>
            {showWelcome && phase === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A0E14]/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center max-w-lg px-6"
                >
                  {/* AIRA Logo */}
                  <motion.div
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl"
                    style={{
                      background: 'linear-gradient(135deg, #FFD70015, #FF8F0015)',
                      border: '2px solid #FFD70040',
                      boxShadow: '0 0 40px #FFD70015',
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 40px #FFD70015',
                        '0 0 60px #FFD70025',
                        '0 0 40px #FFD70015',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ☀️
                  </motion.div>

                  <h1 className="text-2xl font-extrabold mb-2">
                    <span className="text-gradient">AIRA</span>{' '}
                    <span className="text-white">AI Software Company</span>
                  </h1>
                  <p className="text-sm text-[#556677] mb-6 leading-relaxed">
                    Watch 10 AI agents build your product in a living virtual office.
                    <br />
                    Describe your project idea or run a demo to see the magic.
                  </p>

                  {/* API Status */}
                  {apiOnline === false && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-400">
                        Backend API is offline. Start it with:{' '}
                        <code className="bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          cd backend && uvicorn main:app --reload
                        </code>
                      </p>
                    </div>
                  )}

                  {apiOnline === true && !user && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        Sign in to submit real projects. Demo mode works without login.
                      </p>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111820] border border-[#1A2332]">
                      <span className="text-xs">⌨️</span>
                      <span className="text-[10px] text-[#AABBCC]">
                        Type your project idea in the input box above
                      </span>
                    </div>
                    <div className="text-[10px] text-[#445566]">or</div>
                    <button
                      onClick={handleRunDemo}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF980015] border border-[#FF980030] hover:bg-[#FF980025] transition-colors"
                    >
                      <span className="text-xs">▶️</span>
                      <span className="text-[10px] text-[#FF9800] font-semibold">
                        Run Demo
                      </span>
                    </button>
                  </div>

                  {/* Auto-dismiss hint */}
                  <p className="text-[9px] text-[#334455] mt-6">
                    This welcome screen will hide when a project starts
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Office Canvas */}
          <OfficeCanvas onAgentClick={handleAgentClick} />
        </div>

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Bottom Team Status Bar */}
      <TeamStatusBar onAgentClick={handleAgentClick} />

      {/* Agent Detail Panel (slide-in) */}
      <AgentDetailPanel
        agentId={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  )
}
