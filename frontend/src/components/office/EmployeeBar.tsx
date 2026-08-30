'use client'

import { motion } from 'framer-motion'
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
  neptune:  { name: 'Neptune',  symbol: '♆',  role: 'QA',          color: '#2563EB' },
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

interface EmployeeBarProps {
  onAgentClick?: (agent: AgentId) => void
}

export function EmployeeBar({ onAgentClick }: EmployeeBarProps) {
  const agents = useOfficeStore((s) => s.agents)

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFCF9] border-t border-[#2C2420]/5 overflow-x-auto">
      {DISPLAY_AGENTS.map((id) => {
        const agent = agents[id]
        const meta = AGENT_META[id]
        const isWorking = agent.state === 'working'
        const isCompleted = agent.state === 'completed' || agent.state === 'sleeping'
        const isError = agent.state === 'error'
        const isActive = isWorking || agent.state === 'meeting' || agent.state === 'reporting'

        return (
          <motion.button
            key={id}
            onClick={() => onAgentClick?.(id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all flex-shrink-0 min-w-[140px]"
            style={{
              background: isActive
                ? `${meta.color}08`
                : isError
                  ? '#FEF2F2'
                  : 'rgba(255,252,249,0.5)',
              borderColor: isActive
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

            {/* Progress */}
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
  )
}
