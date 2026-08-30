'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  neptune:  { name: 'Neptune',  symbol: '♆',  role: 'QA',             color: '#4B7BE8' },
  pluto:    { name: 'Pluto',    symbol: '🪐', role: 'DevOps',         color: '#7C3AED' },
}

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  idle:      { label: '⏸ Idle',      color: '#9CA3AF' },
  walking:   { label: '🚶 Moving',   color: '#3B82F6' },
  meeting:   { label: '🏢 Meeting',  color: '#D97706' },
  at_desk:   { label: '🪑 At Desk',  color: '#6B7280' },
  working:   { label: '⚡ Working',  color: '#10B981' },
  reporting: { label: '📋 Reporting', color: '#059669' },
  completed: { label: '✅ Done',     color: '#10B981' },
  sleeping:  { label: '💤 Sleeping', color: '#9CA3AF' },
  error:     { label: '❌ Error',    color: '#EF4444' },
  arriving:  { label: '📮 Arriving', color: '#059669' },
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

const PHASE_STEPS = [
  { key: 'project_arriving', label: 'Project Arrives', emoji: '📮' },
  { key: 'aira_analyzing', label: 'AIRA Analyzes', emoji: '☀️' },
  { key: 'datta_planning', label: 'Datta Plans', emoji: '👨‍💼' },
  { key: 'meeting_in_progress', label: 'Team Meeting', emoji: '🏢' },
  { key: 'task_distribution', label: 'Tasks Assigned', emoji: '📋' },
  { key: 'agents_working', label: 'Agents Working', emoji: '⚡' },
  { key: 'datta_integrating', label: 'Integration', emoji: '🔗' },
  { key: 'aira_validating', label: 'Validation', emoji: '✅' },
  { key: 'completed', label: 'Complete', emoji: '🎉' },
]

type Tab = 'overview' | 'tasks' | 'agents'

export function CommandCenter() {
  const phase = useOfficeStore((s) => s.phase)
  const agents = useOfficeStore((s) => s.agents)
  const projectIdea = useOfficeStore((s) => s.projectIdea)
  const events = useOfficeStore((s) => s.events)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const progress = PHASE_PROGRESS[phase] || 0

  // Count agent states
  const working = Object.values(agents).filter((a) => a.state === 'working').length
  const sleeping = Object.values(agents).filter((a) => a.state === 'sleeping' || a.state === 'idle').length
  const meeting = Object.values(agents).filter((a) => a.state === 'meeting').length
  const errors = Object.values(agents).filter((a) => a.state === 'error').length
  const reporting = Object.values(agents).filter((a) => a.state === 'reporting').length

  // Find current phase step index
  const currentStepIndex = PHASE_STEPS.findIndex((s) => s.key === phase)

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
        {/* Tabs */}
        <div className="flex gap-1 mt-2">
          {(['overview', 'tasks', 'agents'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[9px] px-2 py-1 rounded-md font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                  : 'text-[#A19B95] hover:bg-[#F5F0EB]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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

            {/* Workflow steps */}
            <div className="p-3 rounded-xl bg-[#F5F0EB]">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95] mb-2">
                Workflow Pipeline
              </p>
              <div className="space-y-1">
                {PHASE_STEPS.map((step, i) => {
                  const isPast = currentStepIndex >= 0 && i < currentStepIndex
                  const isCurrent = step.key === phase
                  const isFuture = currentStepIndex >= 0 ? i > currentStepIndex : true

                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      {/* Step indicator */}
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[8px]"
                        style={{
                          background: isCurrent ? '#8B5A2B' : isPast ? '#10B981' : '#E4DDD5',
                          color: isCurrent || isPast ? 'white' : '#A19B95',
                        }}
                      >
                        {isPast ? '✓' : step.emoji}
                      </div>
                      <span
                        className="text-[9px]"
                        style={{
                          color: isCurrent ? '#8B5A2B' : isPast ? '#10B981' : '#D4C8BC',
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <motion.div
                          className="w-1 h-1 rounded-full bg-[#8B5A2B] ml-auto"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Agent stats */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-[8px] text-emerald-600 font-medium">Working</p>
                <p className="text-base font-bold text-emerald-700">{working}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
                <p className="text-[8px] text-gray-500 font-medium">Idle</p>
                <p className="text-base font-bold text-gray-600">{sleeping}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <p className="text-[8px] text-amber-600 font-medium">Meeting</p>
                <p className="text-base font-bold text-amber-700">{meeting}</p>
              </div>
            </div>

            {/* Quick agent status */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95] mb-2">
                Agent Status
              </p>
              <div className="space-y-1">
                {(['aira', 'datta', 'mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto'] as AgentId[]).map((id) => {
                  const agent = agents[id]
                  const meta = AGENT_META[id]
                  const stateInfo = STATE_LABELS[agent.state] || STATE_LABELS.idle

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[#F5F0EB] transition-colors"
                    >
                      <span className="text-[10px]">{meta.symbol}</span>
                      <span className="text-[9px] font-semibold w-12" style={{ color: meta.color }}>
                        {meta.name}
                      </span>
                      <div className="flex-1 h-1 rounded-full bg-[#E4DDD5] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: meta.color }}
                          animate={{
                            width: agent.state === 'working' ? '100%'
                              : agent.state === 'completed' ? '100%'
                              : agent.state === 'sleeping' ? '0%'
                              : agent.state === 'meeting' ? '60%'
                              : agent.state === 'reporting' ? '80%'
                              : '20%',
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span
                        className="text-[8px] w-16 text-right truncate"
                        style={{ color: stateInfo.color }}
                      >
                        {stateInfo.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent events count */}
            <div className="p-2 rounded-lg bg-[#F5F0EB] flex items-center justify-between">
              <p className="text-[9px] text-[#A19B95]">
                {events.length} events logged
              </p>
              {errors > 0 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-bold">
                  {errors} error{errors > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TaskLedger agents={agents} phase={phase} events={events} />
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <AgentDetail agents={agents} />
        )}
      </div>
    </div>
  )
}

// ─── Task Ledger ─────────────────────────────────────────────────────────────
function TaskLedger({
  agents,
  phase,
  events,
}: {
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
  phase: string
  events: ReturnType<typeof useOfficeStore.getState>['events']
}) {
  const tasks = [
    { id: 'T-001', name: 'Research & Intelligence', agent: 'mercury', deps: [] },
    { id: 'T-002', name: 'Architecture & Planning', agent: 'mars', deps: ['T-001'] },
    { id: 'T-003', name: 'UI/UX Design', agent: 'venus', deps: ['T-002'] },
    { id: 'T-004', name: 'Development & Implementation', agent: 'earth', deps: ['T-002', 'T-003'] },
    { id: 'T-005', name: 'Quality Assurance', agent: 'neptune', deps: ['T-004'] },
    { id: 'T-006', name: 'Deployment & Operations', agent: 'pluto', deps: ['T-004'] },
  ]

  const getTaskStatus = (agentId: string) => {
    const agent = agents[agentId as AgentId]
    if (!agent) return 'blocked'
    if (agent.state === 'working') return 'active'
    if (agent.state === 'completed' || agent.state === 'sleeping') return 'completed'
    if (agent.state === 'meeting') return 'in-meeting'
    return 'waiting'
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    active:     { bg: '#ECFDF5', text: '#10B981', border: '#D1FAE5' },
    completed:  { bg: '#F0F9FF', text: '#3B82F6', border: '#DBEAFE' },
    waiting:    { bg: '#FFFBEB', text: '#F59E0B', border: '#FEF3C7' },
    'in-meeting': { bg: '#FFF7ED', text: '#F97316', border: '#FFEDD5' },
    blocked:    { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
  }

  return (
    <div className="space-y-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95]">
        Task Ledger
      </p>
      {tasks.map((task) => {
        const status = getTaskStatus(task.agent)
        const meta = AGENT_META[task.agent as AgentId]
        const colors = statusColors[status]
        const agent = agents[task.agent as AgentId]

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-2.5 rounded-lg border"
            style={{ background: colors.bg, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono font-bold" style={{ color: colors.text }}>
                  {task.id}
                </span>
                <span className="text-[10px]">{meta?.symbol}</span>
                <span className="text-[9px] font-semibold" style={{ color: meta?.color }}>
                  {task.name}
                </span>
              </div>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                style={{ background: `${colors.text}15`, color: colors.text }}
              >
                {status}
              </span>
            </div>
            {/* Current task info */}
            {agent?.currentTask && (
              <p className="text-[8px] text-[#716B65] mt-1 truncate">
                Task: {agent.currentTask}
              </p>
            )}
            {/* Progress */}
            {agent?.progress !== undefined && agent.progress > 0 && (
              <div className="mt-1.5 h-1 rounded-full overflow-hidden bg-white/50">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta?.color }}
                  animate={{ width: `${agent.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            {/* Dependencies */}
            {task.deps.length > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[7px] text-[#A19B95]">depends on:</span>
                {task.deps.map((dep) => (
                  <span key={dep} className="text-[7px] font-mono text-[#716B65] bg-white/50 px-1 rounded">
                    {dep}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Agent Detail ────────────────────────────────────────────────────────────
function AgentDetail({
  agents,
}: {
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
}) {
  const displayAgents: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto']

  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95]">
        Agent Health & Status
      </p>
      {displayAgents.map((id) => {
        const agent = agents[id]
        const meta = AGENT_META[id]
        const stateInfo = STATE_LABELS[agent.state] || STATE_LABELS.idle

        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-lg bg-[#F5F0EB] border border-[#2C2420]/4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
              >
                {meta.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: meta.color }}>
                    {meta.name}
                  </span>
                  <span className="text-[8px] text-[#A19B95]">{meta.role}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: stateInfo.color,
                      animation: agent.state === 'working' ? 'statusDotPulse 2s infinite' : undefined,
                    }}
                  />
                  <span className="text-[8px]" style={{ color: stateInfo.color }}>
                    {stateInfo.label}
                  </span>
                </div>
              </div>
            </div>
            {/* Task info */}
            {agent.currentTask && (
              <p className="text-[8px] text-[#716B65] truncate">
                📋 {agent.currentTask}
              </p>
            )}
            {/* Progress bar */}
            {(agent.state === 'working' || agent.state === 'completed') && agent.progress !== undefined && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-[8px] font-bold" style={{ color: meta.color }}>
                  {agent.progress}%
                </span>
              </div>
            )}
            {/* Last message */}
            {agent.lastMessage && (
              <p className="text-[7px] text-[#A19B95] mt-1 italic truncate">
                &ldquo;{agent.lastMessage}&rdquo;
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
