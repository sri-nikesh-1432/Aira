'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId, WorkflowPhase } from '@/types/office'

const AGENT_META: Record<AgentId, { name: string; symbol: string; role: string; color: string }> = {
  postman:  { name: 'Postman',  symbol: '📮', role: 'Delivery',       color: '#059669' },
  aira:     { name: 'AIRA',     symbol: '☀️', role: 'CEO',            color: '#D4A574' },
  datta:    { name: 'Datta',    symbol: '👨‍💼', role: 'Project Mgr',    color: '#8B5A2B' },
  mercury:  { name: 'Mercury',  symbol: '☿',  role: 'Research',       color: '#9CA3AF' },
  mars:     { name: 'Mars',     symbol: '♂',  role: 'Architect',      color: '#DC2626' },
  venus:    { name: 'Venus',    symbol: '♀',  role: 'UI/UX',          color: '#D97706' },
  earth:    { name: 'Earth',    symbol: '🌍', role: 'Developer',      color: '#2563EB' },
  neptune:  { name: 'Neptune',  symbol: '♆',  role: 'QA',             color: '#2563EB' },
  pluto:    { name: 'Pluto',    symbol: '🪐', role: 'DevOps',         color: '#7C3AED' },
}

const STATE_LABELS: Record<string, string> = {
  idle: '⏸ Idle',
  walking: '🚶 Moving',
  meeting: '🏢 Meeting',
  at_desk: '🪑 At Desk',
  working: '⚡ Working',
  reporting: '📋 Reporting',
  completed: '✅ Done',
  sleeping: '💤 Sleeping',
  error: '❌ Error',
  arriving: '📮 Arriving',
}

const PHASE_PROGRESS: Record<WorkflowPhase, number> = {
  idle: 0,
  project_arriving: 5,
  aira_analyzing: 15,
  datta_planning: 25,
  meeting_in_progress: 35,
  task_distribution: 40,
  agents_working: 60,
  reporting: 75,
  datta_integrating: 85,
  aira_validating: 95,
  iteration: 90,
  completed: 100,
}

export function CommandCenter() {
  const phase = useOfficeStore((s) => s.phase)
  const agents = useOfficeStore((s) => s.agents)
  const projectIdea = useOfficeStore((s) => s.projectIdea)
  const events = useOfficeStore((s) => s.events)

  const progress = PHASE_PROGRESS[phase] || 0

  // Count agent states
  const working = Object.values(agents).filter((a) => a.state === 'working').length
  const sleeping = Object.values(agents).filter((a) => a.state === 'sleeping' || a.state === 'idle').length
  const meeting = Object.values(agents).filter((a) => a.state === 'meeting').length
  const errors = Object.values(agents).filter((a) => a.state === 'error').length

  return (
    <div className="flex flex-col h-full bg-[#FFFCF9]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2C2420]/5">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B65]">
            Command Center
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Overall progress */}
        <div className="p-3 rounded-xl bg-[#F5F0EB]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#716B65]">Overall Progress</span>
            <span className="text-[10px] font-bold text-[#8B5A2B]">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#E4DDD5]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #D4A574, #8B5A2B)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[9px] text-[#A19B95] mt-1 capitalize">
            {phase.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Agent stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-[9px] text-emerald-600 font-medium">Working</p>
            <p className="text-lg font-bold text-emerald-700">{working}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-[9px] text-gray-500 font-medium">Sleeping</p>
            <p className="text-lg font-bold text-gray-600">{sleeping}</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-[9px] text-amber-600 font-medium">In Meeting</p>
            <p className="text-lg font-bold text-amber-700">{meeting}</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-[9px] text-red-500 font-medium">Errors</p>
            <p className="text-lg font-bold text-red-600">{errors}</p>
          </div>
        </div>

        {/* Agent roster */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95] mb-2">
            Agent Roster
          </p>
          <div className="space-y-1.5">
            {(['aira', 'datta', 'mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto'] as AgentId[]).map((id) => {
              const agent = agents[id]
              const meta = AGENT_META[id]
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#F5F0EB] transition-colors"
                >
                  <span className="text-xs">{meta.symbol}</span>
                  <span className="text-[10px] font-semibold text-[#5A544E] w-12">{meta.name}</span>
                  <div className="flex-1 h-1 rounded-full bg-[#E4DDD5] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: meta.color }}
                      animate={{
                        width: agent.state === 'working' ? '100%'
                          : agent.state === 'completed' ? '100%'
                          : agent.state === 'sleeping' ? '0%'
                          : '30%',
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[8px] text-[#A19B95] w-14 text-right truncate">
                    {STATE_LABELS[agent.state] || agent.state}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent events count */}
        <div className="p-2 rounded-lg bg-[#F5F0EB]">
          <p className="text-[9px] text-[#A19B95]">
            {events.length} events logged
          </p>
        </div>
      </div>
    </div>
  )
}
