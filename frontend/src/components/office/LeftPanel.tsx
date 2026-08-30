'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const FLOW_STEPS = [
  { key: 'project_arriving', label: 'New Project Received', icon: '📮' },
  { key: 'aira_analyzing', label: 'Assigned to Datta', icon: '☀️' },
  { key: 'datta_planning', label: 'Team Meeting', icon: '💼' },
  { key: 'meeting_in_progress', label: 'Tasks Assigned', icon: '🏢' },
  { key: 'agents_working', label: 'Work in Progress', icon: '⚡' },
  { key: 'datta_integrating', label: 'Integration', icon: '🔗' },
  { key: 'aira_validating', label: 'Final Validation', icon: '✅' },
  { key: 'completed', label: 'Delivery', icon: '🎉' },
]

const PHASE_ORDER = FLOW_STEPS.map(s => s.key)

const AGENT_SYMBOLS: Record<string, string> = {
  postman: '📮', aira: '☀️', datta: '💼',
  mercury: '☿', mars: '♂', venus: '♀',
  earth: '🌍', jupiter: '♃', saturn: '♄',
  neptune: '♆', uranus: '♅', pluto: '🪐',
}

export function LeftPanel() {
  const phase = useOfficeStore((s) => s.phase)
  const events = useOfficeStore((s) => s.events)
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  const currentIndex = PHASE_ORDER.indexOf(phase)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events.length])

  const recentEvents = events.slice(-40)

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-[#0D1117] border-r border-[#1A2332] overflow-hidden">
      {/* ═══ PROJECT FLOW ═══ */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#556677] mb-2">PROJECT FLOW</p>
        <div className="space-y-0.5">
          {FLOW_STEPS.map((step, i) => {
            const isPast = currentIndex >= 0 && i < currentIndex
            const isCurrent = step.key === phase
            const isFuture = currentIndex >= 0 && i > currentIndex || currentIndex < 0
            return (
              <div key={step.key} className="flex items-center gap-2 py-0.5">
                {/* Number circle */}
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[6px] font-bold transition-all"
                  style={{
                    background: isCurrent ? '#4FC3F7' : isPast ? '#4CAF50' : '#1A2332',
                    color: isCurrent || isPast ? '#FFF' : '#334455',
                    boxShadow: isCurrent ? '0 0 8px #4FC3F740' : 'none',
                  }}
                >
                  {isPast ? '✓' : i + 1}
                </div>
                {/* Label */}
                <span
                  className="text-[8px] flex-1 leading-tight"
                  style={{
                    color: isCurrent ? '#4FC3F7' : isPast ? '#4CAF50' : isFuture ? '#334455' : '#445566',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {step.label}
                </span>
                {/* Timestamp */}
                {(isPast || isCurrent) && (
                  <span className="text-[6px] text-[#445566] font-mono flex-shrink-0">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ EVENT FEED ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1A2332]">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#556677]">EVENT FEED</p>
          <span className="text-[7px] text-[#334455] bg-[#1A2332] px-1.5 py-0.5 rounded">All</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-2.5 py-1 space-y-0.5">
          <AnimatePresence initial={false}>
            {recentEvents.map((event) => {
              const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              const symbol = AGENT_SYMBOLS[event.agent] || '⚡'
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-1.5 py-0.5"
                >
                  <span className="text-[7px] text-[#445566] w-8 flex-shrink-0 pt-px font-mono">{time}</span>
                  <span className="text-[9px] flex-shrink-0 mt-px">{symbol}</span>
                  <p className="text-[7px] text-[#7788AA] leading-relaxed flex-1">{event.message}</p>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {events.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[8px] text-[#334455]">No events yet</p>
              <p className="text-[7px] text-[#223344] mt-1">Submit a project to start</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ POSTMAN CARD ═══ */}
      <div className="px-2 py-2 border-t border-[#1A2332]">
        <div
          className="p-2.5 rounded-xl border transition-all"
          style={{
            background: mailboxStatus === 'new_project' ? 'linear-gradient(135deg, #0D2818, #0A1A12)' : '#111820',
            borderColor: mailboxStatus === 'new_project' ? '#1B5E20' : '#1A2332',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: '#1B5E2020', border: '1px solid #2E7D3240' }}>
              📮
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4CAF50]">POSTMAN</p>
              <p className="text-[7px] text-[#556677]">
                {mailboxStatus === 'new_project' ? 'New Project Delivered!' : 'Standing by'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
