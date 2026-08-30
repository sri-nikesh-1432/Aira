'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_META: Record<string, { name: string; symbol: string; color: string; role: string }> = {
  mercury:  { name: 'Mercury', symbol: '☿',  color: '#90A4AE', role: 'Research' },
  mars:     { name: 'Mars',    symbol: '♂',  color: '#EF5350', role: 'Architect' },
  venus:    { name: 'Venus',   symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer' },
  earth:    { name: 'Earth',   symbol: '🌍', color: '#42A5F5', role: 'Developer' },
  jupiter:  { name: 'Jupiter', symbol: '♃',  color: '#C8A951', role: 'Business' },
  saturn:   { name: 'Saturn',  symbol: '♄',  color: '#A89070', role: 'Documentation' },
  neptune:  { name: 'Neptune', symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer' },
  uranus:   { name: 'Uranus',  symbol: '♅',  color: '#7EC8C8', role: 'Meta-Evolution' },
  pluto:    { name: 'Pluto',   symbol: '🪐', color: '#AB47BC', role: 'DevOps' },
  datta:    { name: 'Datta',   symbol: '💼', color: '#FF9800', role: 'Project Manager' },
  aira:     { name: 'AIRA',    symbol: '☀️', color: '#FFD700', role: 'CEO' },
}

const STATE_LABELS: Record<string, string> = {
  idle: 'Idle', walking: 'Moving', meeting: 'Meeting', at_desk: 'Ready',
  working: 'Working', reporting: 'Reporting', completed: 'Done',
  sleeping: 'Sleeping', error: 'Error', arriving: 'Arriving',
}

const DISPLAY_AGENTS = ['mercury', 'mars', 'venus', 'earth', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto', 'datta', 'aira']

export function TeamStatusBar({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)

  return (
    <div className="flex items-stretch gap-1 px-2 py-1.5 bg-[#0A0E14] border-t border-[#1A2332] overflow-x-auto">
      {DISPLAY_AGENTS.map((id) => {
        const agent = (agents as Record<string, any>)[id]
        const meta = AGENT_META[id]
        if (!meta || !agent) return null

        const isWorking = agent.state === 'working'
        const isSleeping = agent.state === 'sleeping' || agent.state === 'idle'
        const isCompleted = agent.state === 'completed'
        const isMeeting = agent.state === 'meeting'
        const stateLabel = STATE_LABELS[agent.state] || agent.state

        return (
          <motion.button
            key={id}
            onClick={() => onAgentClick?.(id as AgentId)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-[80px] p-1.5 rounded-lg border transition-all cursor-pointer text-left"
            style={{
              background: isWorking ? `${meta.color}10` : isCompleted ? '#0D281810' : isMeeting ? '#2A1A0010' : '#111820',
              borderColor: isWorking ? `${meta.color}30` : '#1A2332',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px]">{meta.symbol}</span>
              <span className="text-[9px] font-bold truncate" style={{ color: meta.color }}>
                {meta.name}
              </span>
            </div>
            <p className="text-[7px] text-[#556677] truncate mb-0.5">{meta.role}</p>
            <div className="flex items-center gap-1 mb-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: isWorking ? '#4CAF50' : isCompleted ? '#4CAF50' : isMeeting ? '#FF9800' : isSleeping ? '#555' : '#F44336',
                  animation: isWorking ? 'statusDotPulse 2s infinite' : undefined,
                }}
              />
              <span className="text-[7px] font-medium"
                style={{ color: isWorking ? '#4CAF50' : isCompleted ? '#4CAF50' : isMeeting ? '#FF9800' : isSleeping ? '#555' : '#F44336' }}>
                {stateLabel}
              </span>
            </div>
            {agent.currentTask && (
              <p className="text-[6px] text-[#666] truncate mb-0.5">{agent.currentTask}</p>
            )}
            {(isWorking || isCompleted) && agent.progress !== undefined && agent.progress > 0 && (
              <div className="h-0.5 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: meta.color }}
                  animate={{ width: `${agent.progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
