'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, FileText, MessageCircle, Activity, Zap, CheckCircle } from 'lucide-react'
import { useOfficeStore } from '@/store/officeStore'
import { getRoster } from './roster'
import type { AgentId, AgentLocation } from '@/types/office'

const CAPABILITIES: Record<AgentId, string[]> = {
  postman: ['Project delivery', 'Document transport', 'Package handling'],
  aira: ['Goal decomposition', 'Task orchestration', 'Quality validation', 'Error recovery'],
  datta: ['Task planning', 'Dependency management', 'Team coordination', 'Integration'],
  mercury: ['Market research', 'Competitor analysis', 'Technology scouting', 'MSME compliance'],
  mars: ['System design', 'Tech stack selection', 'API design', 'Scalability planning'],
  venus: ['Design systems', 'Wireframes', 'Prototyping', 'User journeys'],
  earth: ['Full-stack development', 'API implementation', 'Database design', 'Code generation'],
  jupiter: ['Database design', 'Data pipelines', 'Schema modeling', 'Data analytics'],
  saturn: ['AI/ML models', 'Predictive systems', 'Intelligent components', 'Learning pipelines'],
  uranus: ['Security audits', 'Vulnerability review', 'Threat modeling', 'Hardening'],
  neptune: ['Test suites', 'Security audits', 'Performance testing', 'Bug detection'],
  pluto: ['Docker', 'CI/CD pipelines', 'Cloud deployment', 'Monitoring'],
  ceres: ['Documentation', 'User guides', 'Reports', 'Technical writing'],
}

const GENDER_ICON: Record<string, string> = { female: '♀', male: '♂' }

const STATE_DESCRIPTIONS: Record<string, { label: string; color: string; icon: string }> = {
  idle:      { label: 'Idle',       color: '#9CA3AF', icon: '⏸' },
  walking:   { label: 'Moving',     color: '#3B82F6', icon: '🚶' },
  meeting:   { label: 'In Meeting', color: '#D97706', icon: '🏢' },
  at_desk:   { label: 'At Desk',    color: '#6B7280', icon: '🪑' },
  working:   { label: 'Working',    color: '#10B981', icon: '⚡' },
  reporting: { label: 'Reporting',  color: '#059669', icon: '📋' },
  completed: { label: 'Completed',  color: '#10B981', icon: '✅' },
  sleeping:  { label: 'Sleeping',   color: '#9CA3AF', icon: '💤' },
  error:     { label: 'Error',      color: '#EF4444', icon: '❌' },
  arriving:  { label: 'Arriving',   color: '#059669', icon: '📮' },
}

const ROOM_LABELS: Record<string, string> = {
  aira_cabin: "AIRA's Cabin",
  datta_cabin: "Datta's Cabin",
  meeting_room: 'Meeting Room',
  mercury_cabin: 'Mercury Cabin',
  mars_cabin: 'Mars Cabin',
  venus_cabin: 'Venus Cabin',
  earth_cabin: 'Earth Cabin',
  neptune_cabin: 'Neptune Cabin',
  pluto_cabin: 'Pluto Cabin',
  dormitory: 'Dormitory',
  reception: 'Reception',
  hallway: 'Hallway',
}

interface AgentDetailPanelProps {
  agentId: AgentId | null
  onClose: () => void
}

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
  const agents = useOfficeStore((s) => s.agents)
  const agent = agentId ? agents[agentId] : null
  const human = agentId ? getRoster(agentId) : null

  if (!agent || !human || !agentId) return null

  const metaColor = human.planetColor
  const capabilities = CAPABILITIES[agentId] || []
  const stateInfo = STATE_DESCRIPTIONS[agent.state] || STATE_DESCRIPTIONS.idle

  return (
    <AnimatePresence>
      {agentId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#FFFCF9] border-l border-[#2C2420]/10 z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2C2420]/8" style={{ background: `${metaColor}05` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 font-bold"
                    style={{
                      background: `${metaColor}15`,
                      borderColor: `${metaColor}40`,
                      color: metaColor,
                    }}
                  >
                    {human.gender === 'female' ? '♀' : '♂'}
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: metaColor }}>
                      {human.name}
                    </h2>
                    <p className="text-[11px] text-[#A19B95]">
                      {human.agentName} · {human.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#EDE5DC] transition-colors"
                >
                  <X className="w-4 h-4 text-[#716B65]" />
                </button>
              </div>

              {/* Status badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: `${stateInfo.color}15`, color: stateInfo.color }}
                >
                  <span>{stateInfo.icon}</span>
                  {stateInfo.label}
                </span>
                <span className="text-[10px] text-[#A19B95]">
                  in {ROOM_LABELS[agent.room] || agent.room}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Identity */}
              <div className="p-3 rounded-xl" style={{ background: `${metaColor}05`, border: `1px solid ${metaColor}15` }}>
                <p className="text-xs italic" style={{ color: metaColor }}>
                  &ldquo;{human.personality}&rdquo;
                </p>
                <p className="text-[9px] text-[#A19B95] mt-2">
                  Personality · {human.gender === 'female' ? 'She' : 'He'} rides a {human.bicycleColor} bicycle to work.
                </p>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="p-3 rounded-xl bg-[#F5F0EB]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-[#A19B95]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95]">
                      Current Task
                    </span>
                  </div>
                  <p className="text-xs text-[#5A544E]">{agent.currentTask}</p>
                </div>
              )}

              {/* Progress */}
              {agent.progress !== undefined && agent.progress > 0 && (
                <div className="p-3 rounded-xl bg-[#F5F0EB]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95]">
                      Progress
                    </span>
                    <span className="text-xs font-bold" style={{ color: metaColor }}>
                      {agent.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-[#E4DDD5]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${metaColor}, ${metaColor}CC)` }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Last Activity */}
              {agent.lastMessage && (
                <div className="p-3 rounded-xl bg-[#F5F0EB]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageCircle className="w-3 h-3 text-[#A19B95]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95]">
                      Latest Activity
                    </span>
                  </div>
                  <p className="text-xs text-[#5A544E] leading-relaxed">{agent.lastMessage}</p>
                </div>
              )}

              {/* Personality Quip */}
              {agent.lastQuip && (
                <div className="p-3 rounded-xl border" style={{ borderColor: `${metaColor}20` }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3" style={{ color: metaColor }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: metaColor }}>
                      Personality
                    </span>
                  </div>
                  <p className="text-xs italic" style={{ color: metaColor }}>
                    &ldquo;{agent.lastQuip}&rdquo;
                  </p>
                </div>
              )}

              {/* Capabilities */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95] mb-2">
                  Capabilities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[9px] font-medium px-2 py-1 rounded-lg"
                      style={{ background: `${metaColor}08`, color: metaColor, border: `1px solid ${metaColor}15` }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Personality */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19B95] mb-2">
                  Personality
                </p>
                <p className="text-xs text-[#716B65] leading-relaxed">{human.personality}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
