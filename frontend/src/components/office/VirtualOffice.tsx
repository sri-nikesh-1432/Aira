'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { AgentSprite } from './AgentSprite'
import type { AgentId, OfficeRoom, OfficeEvent } from '@/types/office'

// ─── Room layout definitions ──────────────────────────────────────────────────
// The office is rendered as a CSS grid with positioned rooms.
// Grid layout (11 cols x 7 rows):
//
//   Row 0: [Mercury Cabin] [   Meeting Room   ] [Mars Cabin]
//   Row 1: [Venus Cabin  ] [  AIRA Cabin      ] [Earth Cabin]
//   Row 2: [Neptune Cabin] [  Datta Cabin     ] [Pluto Cabin]
//   Row 3: [     Reception / Mailbox / Postman entrance         ]
//   Row 4: [              Dormitory (all beds)                  ]

const ROOM_CONFIGS: Record<OfficeRoom, {
  label: string
  emoji: string
  color: string
  gridArea?: string
  className?: string
}> = {
  aira_cabin:    { label: 'AIRA',    emoji: '☀️', color: '#D4A574', className: 'col-start-6 col-span-2 row-start-1 row-span-1' },
  meeting_room:  { label: 'Meeting Room', emoji: '🏢', color: '#8B5A2B', className: 'col-start-3 col-span-4 row-start-1 row-span-1' },
  mercury_cabin: { label: 'Mercury', emoji: '☿', color: '#9CA3AF', className: 'col-start-1 col-span-2 row-start-1 row-span-1' },
  mars_cabin:    { label: 'Mars',    emoji: '♂', color: '#DC2626', className: 'col-start-9 col-span-2 row-start-1 row-span-1' },
  venus_cabin:   { label: 'Venus',   emoji: '♀', color: '#D97706', className: 'col-start-1 col-span-2 row-start-2 row-span-1' },
  earth_cabin:   { label: 'Earth',   emoji: '🌍', color: '#2563EB', className: 'col-start-9 col-span-2 row-start-2 row-span-1' },
  neptune_cabin: { label: 'Neptune', emoji: '♆', color: '#2563EB', className: 'col-start-1 col-span-2 row-start-3 row-span-1' },
  pluto_cabin:   { label: 'Pluto',   emoji: '🪐', color: '#7C3AED', className: 'col-start-9 col-span-2 row-start-3 row-span-1' },
  datta_cabin:   { label: 'Datta',   emoji: '👨‍💼', color: '#8B5A2B', className: 'col-start-5 col-span-2 row-start-3 row-span-1' },
  dormitory:     { label: 'Dormitory', emoji: '🛏️', color: '#6B7280', className: 'col-start-3 col-span-4 row-start-3 row-span-1' },
  reception:     { label: 'Reception', emoji: '📮', color: '#059669', className: 'col-start-3 col-span-6 row-start-4 row-span-1' },
  hallway:       { label: '', emoji: '', color: 'transparent', className: '' },
}

// ─── Agent position maps (which room each agent should be in for display) ────
const AGENT_ROOM_MAP: Record<AgentId, OfficeRoom> = {
  postman:  'reception',
  aira:     'aira_cabin',
  datta:    'datta_cabin',
  mercury:  'mercury_cabin',
  mars:     'mars_cabin',
  venus:    'venus_cabin',
  earth:    'earth_cabin',
  neptune:  'neptune_cabin',
  pluto:    'pluto_cabin',
}

// ─── Individual Room Component ────────────────────────────────────────────────
function OfficeRoomTile({
  room,
  agents,
}: {
  room: OfficeRoom
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
}) {
  const config = ROOM_CONFIGS[room]
  if (!config || room === 'hallway') return null

  const agentsInRoom = Object.values(agents).filter(
    (a) => a.room === room && a.state !== 'idle'
  )

  const isMailbox = room === 'reception'

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${config.className}`}
      style={{
        background: agentsInRoom.length > 0
          ? `linear-gradient(135deg, ${config.color}08, ${config.color}15)`
          : 'rgba(255,252,249,0.5)',
        borderColor: agentsInRoom.length > 0
          ? `${config.color}30`
          : 'rgba(44,36,32,0.06)',
        minHeight: room === 'reception' ? '64px' : '100px',
      }}
    >
      {/* Room label */}
      <div className="absolute top-2 left-3 right-3 flex items-center gap-1.5 z-10">
        <span className="text-sm">{config.emoji}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        {agentsInRoom.length > 0 && (
          <span
            className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: `${config.color}15`, color: config.color }}
          >
            {agentsInRoom.length}
          </span>
        )}
      </div>

      {/* Mailbox special content */}
      {isMailbox && <MailboxContent />}

      {/* Agent sprites in room */}
      <div className="absolute inset-0 flex items-end justify-center gap-2 pb-2 pt-8 px-2">
        <AnimatePresence>
          {agentsInRoom.map((agent) => (
            <AgentSprite key={agent.agent} agent={agent} size="sm" />
          ))}
        </AnimatePresence>
      </div>

      {/* Active glow */}
      {agentsInRoom.some((a) => a.state === 'working') && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: `inset 0 0 20px ${config.color}10, 0 0 15px ${config.color}08`,
            animation: 'officeGlow 3s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )
}

// ─── Mailbox Content ──────────────────────────────────────────────────────────
function MailboxContent() {
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  return (
    <div className="flex items-center justify-center h-full pt-4">
      <div className="text-center">
        <div className="text-2xl mb-1">📮</div>
        <motion.div
          key={mailboxStatus}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10px] font-bold"
          style={{
            color: mailboxStatus === 'new_project'
              ? '#059669'
              : mailboxStatus === 'processing'
                ? '#D97706'
                : '#9CA3AF',
          }}
        >
          {mailboxStatus === 'new_project'
            ? '📬 NEW PROJECT!'
            : mailboxStatus === 'processing'
              ? '⏳ PROCESSING...'
              : '📭 No new projects'}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Dormitory Component ──────────────────────────────────────────────────────
function DormitoryTile({
  agents,
}: {
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
}) {
  const sleepingAgents = Object.values(agents).filter(
    (a) => a.room === 'dormitory' && (a.state === 'sleeping' || a.state === 'idle')
  )

  const config = ROOM_CONFIGS.dormitory

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${config.className}`}
      style={{
        background: 'rgba(255,252,249,0.5)',
        borderColor: 'rgba(44,36,32,0.06)',
        minHeight: '100px',
      }}
    >
      <div className="absolute top-2 left-3 right-3 flex items-center gap-1.5 z-10">
        <span className="text-sm">{config.emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
          Dormitory
        </span>
        {sleepingAgents.length > 0 && (
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
            {sleepingAgents.length} sleeping
          </span>
        )}
      </div>

      {/* Bed slots */}
      <div className="flex items-end justify-center gap-1.5 pb-2 pt-8 px-2 flex-wrap">
        {sleepingAgents.map((agent) => (
          <div key={agent.agent} className="flex flex-col items-center gap-0.5">
            <AgentSprite agent={agent} size="xs" />
            <div className="text-[8px] text-gray-400">💤</div>
          </div>
        ))}
        {sleepingAgents.length === 0 && (
          <p className="text-[10px] text-gray-300 pt-6">All agents active</p>
        )}
      </div>
    </div>
  )
}

// ─── Walking hallway overlay ──────────────────────────────────────────────────
function WalkingAgents({
  agents,
}: {
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
}) {
  const walking = Object.values(agents).filter(
    (a) => a.state === 'walking' || a.state === 'reporting' || a.state === 'arriving'
  )

  if (walking.length === 0) return null

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center gap-4 z-20 pointer-events-none">
      <AnimatePresence>
        {walking.map((agent) => (
          <motion.div
            key={agent.agent}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: agent.state === 'reporting' ? [0, 10, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <AgentSprite agent={agent} size="sm" />
            <div className="text-[9px] text-[#8B5A2B] font-medium mt-0.5 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">
              {agent.state === 'reporting' ? '📋 Reporting...' : '🚶 Moving...'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Virtual Office Component ────────────────────────────────────────────
export function VirtualOffice() {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)

  const rooms: OfficeRoom[] = [
    'mercury_cabin', 'meeting_room', 'mars_cabin',
    'venus_cabin', 'aira_cabin', 'earth_cabin',
    'neptune_cabin', 'datta_cabin', 'pluto_cabin',
    'reception',
  ]

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F5F0EB] overflow-hidden">
      {/* Office header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C2420]/5 bg-[#FFFCF9]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <div>
            <p className="text-xs font-bold text-[#2C2420]">AIRA Virtual Office</p>
            <p className="text-[9px] text-[#A19B95] capitalize">
              Phase: {phase.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        {projectIdea && (
          <div className="text-right max-w-xs">
            <p className="text-[10px] text-[#A19B95] truncate">{projectIdea}</p>
          </div>
        )}
      </div>

      {/* Office grid */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="grid grid-cols-11 grid-rows-5 gap-2 h-full min-h-[420px]">
          {rooms.map((room) => {
            if (room === 'dormitory') {
              return <DormitoryTile key={room} agents={agents} />
            }
            return <OfficeRoomTile key={room} room={room} agents={agents} />
          })}
        </div>
      </div>

      {/* Walking agents overlay */}
      <WalkingAgents agents={agents} />

      {/* Workflow phase indicator */}
      <WorkflowIndicator phase={phase} />
    </div>
  )
}

// ─── Workflow Phase Indicator ─────────────────────────────────────────────────
const PHASE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  idle:               { label: 'Standing By',    emoji: '⏸️', color: '#9CA3AF' },
  project_arriving:   { label: 'Project Arriving', emoji: '📮', color: '#059669' },
  aira_analyzing:     { label: 'AIRA Analyzing',  emoji: '☀️', color: '#D4A574' },
  datta_planning:     { label: 'Datta Planning',  emoji: '👨‍💼', color: '#8B5A2B' },
  meeting_in_progress:{ label: 'Team Meeting',    emoji: '🏢', color: '#8B5A2B' },
  task_distribution:  { label: 'Tasks Assigned',  emoji: '📋', color: '#D97706' },
  agents_working:     { label: 'Agents Working',  emoji: '⚡', color: '#6366F1' },
  reporting:          { label: 'Reporting',        emoji: '📋', color: '#059669' },
  datta_integrating:  { label: 'Integration',      emoji: '🔗', color: '#8B5A2B' },
  aira_validating:    { label: 'Final Validation', emoji: '✅', color: '#10B981' },
  iteration:          { label: 'Iteration',        emoji: '🔄', color: '#D97706' },
  completed:          { label: 'Complete',         emoji: '🎉', color: '#10B981' },
}

function WorkflowIndicator({ phase }: { phase: string }) {
  const info = PHASE_LABELS[phase] || PHASE_LABELS.idle

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
      <motion.div
        key={phase}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#2C2420]/8 shadow-sm"
      >
        <span className="text-sm">{info.emoji}</span>
        <span className="text-[11px] font-semibold" style={{ color: info.color }}>
          {info.label}
        </span>
        {phase !== 'idle' && phase !== 'completed' && (
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: info.color }} />
        )}
      </motion.div>
    </div>
  )
}
