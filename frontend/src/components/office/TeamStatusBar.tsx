'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_META: Record<AgentId, {
  name: string
  symbol: string
  color: string
  role: string
}> = {
  postman:  { name: 'Postman',  symbol: '📮', color: '#4CAF50', role: 'Delivery' },
  aira:     { name: 'AIRA',     symbol: '☀️', color: '#FFD700', role: 'CEO' },
  datta:    { name: 'Datta',    symbol: '💼', color: '#FF9800', role: 'Project Manager' },
  mercury:  { name: 'Mercury',  symbol: '☿',  color: '#90A4AE', role: 'Research' },
  mars:     { name: 'Mars',     symbol: '♂',  color: '#EF5350', role: 'Architect' },
  venus:    { name: 'Venus',    symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer' },
  earth:    { name: 'Earth',    symbol: '🌍', color: '#42A5F5', role: 'Developer' },
  neptune:  { name: 'Neptune',  symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer' },
  pluto:    { name: 'Pluto',    symbol: '🪐', color: '#AB47BC', role: 'DevOps Engineer' },
}

const STATE_LABELS: Record<string, string> = {
  idle: 'Idle',
  walking: 'Moving',
  meeting: 'Meeting',
  at_desk: 'Ready',
  working: 'Working',
  reporting: 'Reporting',
  completed: 'Done',
  sleeping: 'Sleeping',
  error: 'Error',
  arriving: 'Arriving',
}

const DISPLAY_AGENTS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto', 'datta', 'aira']

export function TeamStatusBar({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)

  return (
    <div className="flex items-stretch gap-1.5 px-3 py-2 bg-[#0A0E14] border-t border-[#1A2332]">
      {DISPLAY_AGENTS.map((id) => {
        const agent = agents[id]
        const meta = AGENT_META[id]
        const isWorking = agent.state === 'working'
        const isSleeping = agent.state === 'sleeping' || agent.state === 'idle'
        const isCompleted = agent.state === 'completed'
        const isMeeting = agent.state === 'meeting'
        const stateLabel = STATE_LABELS[agent.state] || agent.state

        return (
          <motion.button
            key={id}
            onClick={() => onAgentClick?.(id)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-0 p-2 rounded-lg border transition-all cursor-pointer text-left"
            style={{
              background: isWorking ? `${meta.color}12`
                : isCompleted ? '#0D2818'
                : isMeeting ? '#2A1A00'
                : '#111820',
              borderColor: isWorking ? `${meta.color}40`
                : isCompleted ? '#1B5E2030'
                : isMeeting ? '#FF980030'
                : '#1A2332',
            }}
          >
            {/* Header: Symbol + Name */}
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs">{meta.symbol}</span>
              <span
                className="text-[10px] font-bold truncate"
                style={{ color: meta.color }}
              >
                {meta.name}
              </span>
            </div>
            {/* Role */}
            <p className="text-[8px] text-[#556677] truncate mb-1">{meta.role}</p>
            {/* Status */}
            <div className="flex items-center gap-1 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: isWorking ? '#4CAF50' : isCompleted ? '#4CAF50'
                    : isMeeting ? '#FF9800' : isSleeping ? '#555' : '#F44336',
                  animation: isWorking ? 'statusDotPulse 2s infinite' : undefined,
                }}
              />
              <span
                className="text-[8px] font-medium"
                style={{
                  color: isWorking ? '#4CAF50' : isCompleted ? '#4CAF50'
                    : isMeeting ? '#FF9800' : isSleeping ? '#555' : '#F44336',
                }}
              >
                {stateLabel}
              </span>
            </div>
            {/* Current task */}
            {agent.currentTask && (
              <p className="text-[7px] text-[#888] truncate mb-1">
                {agent.currentTask}
              </p>
            )}
            {/* Progress bar */}
            {(isWorking || isCompleted) && agent.progress !== undefined && agent.progress > 0 && (
              <div className="h-1 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta.color }}
                  animate={{ width: `${agent.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
