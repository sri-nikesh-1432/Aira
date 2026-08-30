'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId, WorkflowPhase } from '@/types/office'

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

const AGENT_COLORS: Record<AgentId, string> = {
  postman: '#4CAF50', aira: '#FFD700', datta: '#FF9800',
  mercury: '#90A4AE', mars: '#EF5350', venus: '#FFB74D',
  earth: '#42A5F5', neptune: '#5C6BC0', pluto: '#AB47BC',
}

const AGENT_SYMBOLS: Record<AgentId, string> = {
  postman: '📮', aira: '☀️', datta: '💼',
  mercury: '☿', mars: '♂', venus: '♀',
  earth: '🌍', neptune: '♆', pluto: '🪐',
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

  const recentEvents = events.slice(-30)

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-[#0D1117] border-r border-[#1A2332] overflow-hidden">
      {/* PROJECT FLOW */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#556677] mb-2">
          PROJECT FLOW
        </p>
        <div className="space-y-0">
          {FLOW_STEPS.map((step, i) => {
            const isPast = currentIndex >= 0 && i < currentIndex
            const isCurrent = step.key === phase
            const isFuture = currentIndex >= 0 ? i > currentIndex : true

            return (
              <div key={step.key} className="flex items-center gap-2 py-1">
                {/* Number */}
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[7px] font-bold"
                  style={{
                    background: isCurrent ? '#4FC3F7' : isPast ? '#4CAF50' : '#1A2332',
                    color: isCurrent || isPast ? '#0D1117' : '#445566',
                  }}
                >
                  {isPast ? '✓' : i + 1}
                </div>
                {/* Label */}
                <span
                  className="text-[9px] flex-1"
                  style={{
                    color: isCurrent ? '#4FC3F7' : isPast ? '#4CAF50' : '#445566',
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {step.label}
                </span>
                {/* Time */}
                {isPast || isCurrent ? (
                  <span className="text-[7px] text-[#556677]">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-[7px] text-[#334455]">---:--</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* EVENT FEED */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1A2332]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#556677]">
            EVENT FEED
          </p>
          <span className="text-[8px] text-[#334455]">{events.length}</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1.5">
          <AnimatePresence initial={false}>
            {recentEvents.map((event) => {
              const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })
              const color = AGENT_COLORS[event.agent] || '#888'
              const symbol = AGENT_SYMBOLS[event.agent] || '⚡'

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-[7px] text-[#445566] w-8 flex-shrink-0 pt-0.5 font-mono">
                    {time}
                  </span>
                  <span className="text-[9px] flex-shrink-0">{symbol}</span>
                  <p className="text-[9px] text-[#AABBCC] leading-relaxed flex-1">
                    {event.message}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {events.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[9px] text-[#334455]">No events yet</p>
            </div>
          )}
        </div>
      </div>

      {/* POSTMAN CARD */}
      <div className="px-3 py-2.5 border-t border-[#1A2332]">
        <div
          className="p-2.5 rounded-lg border"
          style={{
            background: mailboxStatus === 'new_project' ? '#1B3A1B' : '#1A1A1A',
            borderColor: mailboxStatus === 'new_project' ? '#2E7D32' : '#333',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-[#1B5E20]">
              📮
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4CAF50]">POSTMAN</p>
              <p className="text-[8px] text-[#888]">
                {mailboxStatus === 'new_project'
                  ? 'New Project Delivered!'
                  : 'Standing by'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
