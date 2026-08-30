'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_META: Record<string, { name: string; symbol: string; color: string; role: string }> = {
  mercury:  { name: 'Mercury', symbol: '☿',  color: '#90A4AE', role: 'Research' },
  mars:     { name: 'Mars',    symbol: '♂',  color: '#EF5350', role: 'Architect' },
  venus:    { name: 'Venus',   symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer' },
  earth:    { name: 'Earth',   symbol: '🌍', color: '#42A5F5', role: 'Developer' },
  neptune:  { name: 'Neptune', symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer' },
  pluto:    { name: 'Pluto',   symbol: '🪐', color: '#AB47BC', role: 'DevOps Engineer' },
  datta:    { name: 'Datta',   symbol: '💼', color: '#FF9800', role: 'Project Manager' },
  aira:     { name: 'AIRA',    symbol: '☀️', color: '#FFD700', role: 'CEO' },
}

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  idle:      { label: 'Idle',      color: '#555' },
  walking:   { label: 'Moving',    color: '#2196F3' },
  meeting:   { label: 'Meeting',   color: '#FF9800' },
  at_desk:   { label: 'Ready',     color: '#666' },
  working:   { label: 'Working',   color: '#4CAF50' },
  reporting: { label: 'Reporting', color: '#FF9800' },
  completed: { label: 'Done',      color: '#4CAF50' },
  sleeping:  { label: 'Sleeping',  color: '#555' },
  error:     { label: 'Error',     color: '#F44336' },
  arriving:  { label: 'Arriving',  color: '#4CAF50' },
}

const DISPLAY_AGENTS = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto', 'datta', 'aira']

export function TeamStatusBar({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)

  return (
    <div className="flex items-stretch gap-1 px-2 py-2 bg-[#0A0E14] border-t border-[#1A2332] overflow-x-auto">
      {DISPLAY_AGENTS.map((id) => {
        const agent = (agents as Record<string, any>)[id]
        const meta = AGENT_META[id]
        if (!meta || !agent) return null

        const isWorking = agent.state === 'working'
        const isSleeping = agent.state === 'sleeping' || agent.state === 'idle'
        const isCompleted = agent.state === 'completed'
        const isMeeting = agent.state === 'meeting'
        const isError = agent.state === 'error'
        const stateInfo = STATE_LABELS[agent.state] || { label: agent.state, color: '#555' }

        return (
          <motion.button
            key={id}
            onClick={() => onAgentClick?.(id as AgentId)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-[90px] p-2 rounded-xl border transition-all cursor-pointer text-left"
            style={{
              background: isWorking ? `${meta.color}08` : isCompleted ? '#0D281808' : isMeeting ? '#2A1A0008' : '#111820',
              borderColor: isWorking ? `${meta.color}30` : isError ? '#F4433630' : '#1A2332',
            }}
          >
            {/* Name row */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[12px]">{meta.symbol}</span>
              <span className="text-[9px] font-bold truncate" style={{ color: meta.color }}>
                {meta.name}
              </span>
            </div>

            {/* Role */}
            <p className="text-[7px] text-[#556677] truncate mb-1">{meta.role}</p>

            {/* Status */}
            <div className="flex items-center gap-1 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: stateInfo.color,
                  animation: isWorking ? 'statusDotPulse 2s infinite' : undefined,
                }}
              />
              <span className="text-[7px] font-semibold" style={{ color: stateInfo.color }}>
                {stateInfo.label}
              </span>
            </div>

            {/* Current task */}
            {agent.currentTask && (
              <p className="text-[6px] text-[#556677] truncate mb-1 leading-tight">{agent.currentTask}</p>
            )}

            {/* Progress bar */}
            {(isWorking || isCompleted) && agent.progress !== undefined && agent.progress > 0 && (
              <div className="h-1 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: meta.color }}
                  animate={{ width: `${agent.progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            )}
          </motion.button>
        )
      })}

      {/* AIRA STATUS mini-card */}
      <div className="w-28 p-2 rounded-xl border border-[#FFD70020] bg-[#1A1510] flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[12px]">☀️</span>
          <span className="text-[9px] font-bold text-[#FFD700]">AIRA STATUS</span>
        </div>
        <p className="text-[7px] text-[#AABBCC]">
          {phase === 'aira_validating' ? 'Validating...' :
           phase === 'completed' ? 'Complete ✓' :
           phase !== 'idle' ? 'Supervising' : 'Standing by'}
        </p>
      </div>
    </div>
  )
}
