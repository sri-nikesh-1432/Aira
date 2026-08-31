'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { TopBar } from '@/components/office/TopBar'
import { OfficeCanvas } from '@/components/office/OfficeCanvas'
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

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'completed') {
      setIsRunning(true)
    } else if (phase === 'completed') {
      setIsRunning(false)
    }
  }, [phase])

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
    <div className="h-screen w-full flex flex-col bg-[#04070f] overflow-hidden">
      {/* Top Bar (minimal overlay) */}
      <TopBar onSubmitProject={handleSubmitProject} onRunDemo={handleRunDemo} isRunning={isRunning} />

      {/* Full-screen world */}
      <div className="flex-1 overflow-hidden relative">
        <OfficeCanvas onAgentClick={handleAgentClick} />

        {/* Welcome overlay */}
        <AnimatePresence>
          {showWelcome && phase === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-[#04070f]/70 backdrop-blur-sm"
              onClick={() => setShowWelcome(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center max-w-lg px-6"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #FFD70015, #FF8F0015)',
                    border: '2px solid #FFD70040',
                    boxShadow: '0 0 40px #FFD70015',
                  }}
                  animate={{ boxShadow: ['0 0 40px #FFD70015', '0 0 60px #FFD70025', '0 0 40px #FFD70015'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ☀️
                </motion.div>

                <h1 className="text-xl font-extrabold mb-2">
                  <span className="text-[#FFD700]">AIRA</span>{' '}
                  <span className="text-white">AI Software Company</span>
                </h1>
                <p className="text-xs text-[#556677] mb-5 leading-relaxed">
                  Explore a living company world — villas, dormitories, offices, roads.
                  <br />
                  Watch 10 human employees build your product, driven by real events.
                </p>

                {apiOnline === false && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mx-auto max-w-md">
                    <p className="text-xs text-red-400">
                      Backend API is offline. Start it with:{' '}
                      <code className="bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">cd backend && uvicorn main:app --reload</code>
                    </p>
                  </div>
                )}

                <p className="text-[9px] text-[#334455] mt-4 max-w-xs mx-auto">
                  Describe your project idea above, or drag / zoom the world by scrolling.
                  <br />
                  Click any employee to see their status.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Small agent status strip (bottom) */}
      <TeamStatusBar onAgentClick={handleAgentClick} />

      {/* Agent detail modal (appears on click) */}
      <AgentDetailPanel agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  )
}
