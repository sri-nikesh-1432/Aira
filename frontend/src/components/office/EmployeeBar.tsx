'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_META: Record<AgentId, { name: string; symbol: string; role: string; color: string }> = {
  postman:  { name: 'Postman',  symbol: '📮', role: 'Delivery',    color: '#059669' },
  aira:     { name: 'AIRA',     symbol: '☀️', role: 'CEO',         color: '#D4A574' },
  datta:    { name: 'Datta',    symbol: '👨‍💼', role: 'Project Mgr', color: '#8B5A2B' },
  mercury:  { name: 'Mercury',  symbol: '☿',  role: 'Research',    color: '#9CA3AF' },
  mars:     { name: 'Mars',     symbol: '♂',  role: 'Architect',   color: '#DC2626' },
  venus:    { name: 'Venus',    symbol: '♀',  role: 'UI/UX',       color: '#D97706' },
  earth:    { name: 'Earth',    symbol: '🌍', role: 'Developer',   color: '#2563EB' },
  neptune:  { name: 'Neptune',  symbol: '♆',  role: 'QA',          color: '#4B7BE8' },
  pluto:    { name: 'Pluto',    symbol: '🪐', role: 'DevOps',      color: '#7C3AED' },
}

const STATE_ICONS: Record<string, string> = {
  idle: '⏸',
  walking: '🚶',
  meeting: '🏢',
  at_desk: '🪑',
  working: '⚡',
  reporting: '📋',
  completed: '✅',
  sleeping: '💤',
  error: '❌',
  arriving: '📮',
}

const DISPLAY_AGENTS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto']

export function EmployeeBar({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)

  const handleAgentClick = (id: AgentId) => {
    if (selectedAgent === id) {
      setSelectedAgent(null)
    } else {
      setSelectedAgent(id)
      onAgentClick?.(id)
    }
  }

  const selectedData = selectedAgent ? agents[selectedAgent] : null
  const selectedMeta = selectedAgent ? AGENT_META[selectedAgent] : null

  return (
    <div className="relative">
      {/* Detail popup */}
      <AnimatePresence>
        {selectedAgent && selectedData && selectedMeta && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40"
          >
            <div
              className="w-56 p-3.5 rounded-xl bg-[#FFFCF9] border shadow-lg"
              style={{ borderColor: `${selectedMeta.color}30` }}
            >
              {/* Agent header */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                  style={{
                    background: `${selectedMeta.color}12`,
                    borderColor: `${selectedMeta.color}30`,
                  }}
                >
                  {selectedMeta.symbol}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: selectedMeta.color }}>
                    {selectedMeta.name}
                  </p>
                  <p className="text-[10px] text-[#A19B95]">{selectedMeta.role}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">{STATE_ICONS[selectedData.state] || '•'}</span>
                <span className="text-[10px] font-medium capitalize" style={{ color: selectedMeta.color }}>
                  {selectedData.state}
                </span>
              </div>

              {/* Current task */}
              {selectedData.currentTask && (
                <div className="mb-2 p-2 rounded-lg bg-[#F5F0EB]">
                  <p className="text-[9px] font-bold text-[#A19B95] uppercase tracking-wider mb-0.5">Current Task</p>
                  <p className="text-[10px] text-[#5A544E]">{selectedData.currentTask}</p>
                </div>
              )}

              {/* Progress */}
              {selectedData.progress !== undefined && selectedData.progress > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#A19B95]">Progress</span>
                    <span className="text-[9px] font-bold" style={{ color: selectedMeta.color }}>
                      {selectedData.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[#E4DDD5]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: selectedMeta.color }}
                      animate={{ width: `${selectedData.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] text-[#A19B95]">📍</span>
                <span className="text-[9px] text-[#716B65] capitalize">
                  {selectedData.room.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Last quip */}
              {selectedData.lastQuip && (
                <p className="text-[9px] italic mt-1.5 text-[#A19B95]">
                  &ldquo;{selectedData.lastQuip}&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFCF9] border-t border-[#2C2420]/5 overflow-x-auto">
        {DISPLAY_AGENTS.map((id) => {
          const agent = agents[id]
          const meta = AGENT_META[id]
          const isWorking = agent.state === 'working'
          const isCompleted = agent.state === 'completed' || agent.state === 'sleeping'
          const isError = agent.state === 'error'
          const isActive = isWorking || agent.state === 'meeting' || agent.state === 'reporting'
          const isSelected = selectedAgent === id

          return (
            <motion.button
              key={id}
              onClick={() => handleAgentClick(id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all flex-shrink-0 min-w-[140px]"
              style={{
                background: isSelected
                  ? `${meta.color}15`
                  : isActive
                    ? `${meta.color}08`
                    : isError
                      ? '#FEF2F2'
                      : 'rgba(255,252,249,0.5)',
                borderColor: isSelected
                  ? `${meta.color}50`
                  : isActive
                    ? `${meta.color}30`
                    : isError
                      ? '#FECACA'
                      : 'rgba(44,36,32,0.06)',
              }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all"
                style={{
                  background: isActive ? `${meta.color}15` : '#F5F0EB',
                  border: `1px solid ${isActive ? `${meta.color}30` : 'transparent'}`,
                }}
              >
                {isWorking ? '💻' : meta.symbol}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold" style={{ color: meta.color }}>
                    {meta.name}
                  </span>
                  <span className="text-[8px]">{STATE_ICONS[agent.state] || '•'}</span>
                </div>
                <p className="text-[9px] text-[#A19B95] truncate">
                  {agent.currentTask || meta.role}
                </p>
              </div>

              {/* Progress circle */}
              {(isWorking || isCompleted) && agent.progress !== undefined && (
                <div className="w-6 h-6 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#E4DDD5" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={meta.color}
                      strokeWidth="3"
                      strokeDasharray={`${(agent.progress / 100) * 94.2} 94.2`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
