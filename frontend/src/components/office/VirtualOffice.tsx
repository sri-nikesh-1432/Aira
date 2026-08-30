'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { AgentSprite } from './AgentSprite'
import type { AgentId, OfficeRoom, OfficeEvent, AgentOfficeState, AgentLocation } from '@/types/office'

// ─── Agent metadata ──────────────────────────────────────────────────────────
const AGENT_META: Record<AgentId, {
  name: string
  symbol: string
  color: string
  role: string
  cabin: OfficeRoom
}> = {
  postman:  { name: 'Postman',  symbol: '📮', color: '#059669', role: 'Delivery',       cabin: 'reception' },
  aira:     { name: 'AIRA',     symbol: '☀️', color: '#D4A574', role: 'CEO',            cabin: 'aira_cabin' },
  datta:    { name: 'Datta',    symbol: '👨‍💼', color: '#8B5A2B', role: 'Project Manager', cabin: 'datta_cabin' },
  mercury:  { name: 'Mercury',  symbol: '☿',  color: '#9CA3AF', role: 'Research',       cabin: 'mercury_cabin' },
  mars:     { name: 'Mars',     symbol: '♂',  color: '#DC2626', role: 'Architect',      cabin: 'mars_cabin' },
  venus:    { name: 'Venus',    symbol: '♀',  color: '#D97706', role: 'UI/UX',          cabin: 'venus_cabin' },
  earth:    { name: 'Earth',    symbol: '🌍', color: '#2563EB', role: 'Developer',      cabin: 'earth_cabin' },
  neptune:  { name: 'Neptune',  symbol: '♆',  color: '#4B7BE8', role: 'QA',             cabin: 'neptune_cabin' },
  pluto:    { name: 'Pluto',    symbol: '🪐', color: '#7C3AED', role: 'DevOps',         cabin: 'pluto_cabin' },
}

// ─── State descriptions ──────────────────────────────────────────────────────
const STATE_DESCRIPTIONS: Record<AgentOfficeState, string> = {
  idle:      'Standing by',
  walking:   'Moving between rooms',
  meeting:   'In team meeting',
  at_desk:   'At desk, ready',
  working:   'Actively working',
  reporting: 'Reporting results',
  completed: 'Task complete',
  sleeping:   'Resting in dormitory',
  error:     'Encountered error',
  arriving:  'Arriving at office',
}

// ─── Room definitions with positions ─────────────────────────────────────────
interface RoomDef {
  id: OfficeRoom
  label: string
  emoji: string
  color: string
  gridCol: string
  gridRow: string
  minHeight?: string
}

const ROOM_DEFS: RoomDef[] = [
  // Row 1: Side cabins + Meeting Room
  { id: 'mercury_cabin', label: 'Mercury Cabin',  emoji: '☿',  color: '#9CA3AF', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  { id: 'meeting_room',  label: 'Meeting Room',   emoji: '🏢', color: '#8B5A2B', gridCol: 'col-span-3', gridRow: 'row-span-1', minHeight: '120px' },
  { id: 'mars_cabin',    label: 'Mars Cabin',     emoji: '♂',  color: '#DC2626', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  // Row 2: Side cabins + AIRA + Datta
  { id: 'venus_cabin',   label: 'Venus Cabin',    emoji: '♀',  color: '#D97706', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  { id: 'aira_cabin',    label: 'AIRA',           emoji: '☀️', color: '#D4A574', gridCol: 'col-span-1', gridRow: 'row-span-1', minHeight: '110px' },
  { id: 'earth_cabin',   label: 'Earth Cabin',    emoji: '🌍', color: '#2563EB', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  // Row 3: Side cabins + Datta + Dorm
  { id: 'neptune_cabin', label: 'Neptune Cabin',  emoji: '♆',  color: '#4B7BE8', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  { id: 'datta_cabin',   label: 'Datta Cabin',    emoji: '👨‍💼', color: '#8B5A2B', gridCol: 'col-span-1', gridRow: 'row-span-1' },
  { id: 'pluto_cabin',   label: 'Pluto Cabin',    emoji: '🪐', color: '#7C3AED', gridCol: 'col-span-2', gridRow: 'row-span-1' },
  // Row 4: Dormitory
  { id: 'dormitory',     label: 'Dormitory',       emoji: '🛏️', color: '#6B7280', gridCol: 'col-span-7', gridRow: 'row-span-1', minHeight: '80px' },
  // Row 5: Reception
  { id: 'reception',     label: 'Reception & Mailbox', emoji: '📮', color: '#059669', gridCol: 'col-span-7', gridRow: 'row-span-1', minHeight: '64px' },
]

// ─── Individual Room Component ────────────────────────────────────────────────
function RoomTile({
  room,
  agents,
  onAgentClick,
}: {
  room: RoomDef
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
  onAgentClick?: (agent: AgentId) => void
}) {
  const agentsInRoom: AgentLocation[] = Object.values(agents).filter(
    (a) => a.room === room.id && a.state !== 'idle'
  )
  const allInRoom: AgentLocation[] = Object.values(agents).filter((a) => a.room === room.id)
  const hasWorking = agentsInRoom.some((a) => a.state === 'working')
  const hasMeeting = agentsInRoom.some((a) => a.state === 'meeting')
  const isDormitory = room.id === 'dormitory'
  const isReception = room.id === 'reception'
  const isMeetingRoom = room.id === 'meeting_room'

  const sleepingAgents = isDormitory
    ? Object.values(agents).filter((a) => a.room === 'dormitory' && (a.state === 'sleeping' || a.state === 'idle'))
    : []

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all duration-700 ${room.gridCol} ${room.gridRow}`}
      style={{
        background: hasWorking
          ? `linear-gradient(135deg, ${room.color}06, ${room.color}12)`
          : hasMeeting
            ? `linear-gradient(135deg, ${room.color}08, ${room.color}18)`
            : 'rgba(255,252,249,0.6)',
        borderColor: agentsInRoom.length > 0
          ? `${room.color}30`
          : 'rgba(44,36,32,0.06)',
        minHeight: room.minHeight || '100px',
      }}
    >
      {/* Room label */}
      <div className="absolute top-1.5 left-2.5 right-2.5 flex items-center gap-1.5 z-10">
        <span className="text-xs">{room.emoji}</span>
        <span
          className="text-[9px] font-bold uppercase tracking-wider"
          style={{ color: room.color }}
        >
          {room.label}
        </span>
        {agentsInRoom.length > 0 && !isDormitory && (
          <span
            className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: `${room.color}15`, color: room.color }}
          >
            {agentsInRoom.length}
          </span>
        )}
        {isDormitory && sleepingAgents.length > 0 && (
          <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-500">
            💤 {sleepingAgents.length}
          </span>
        )}
      </div>

      {/* Meeting room special content */}
      {isMeetingRoom && hasMeeting && (
        <MeetingRoomContent agents={agentsInRoom} />
      )}

      {/* Dormitory beds */}
      {isDormitory && (
        <DormitoryContent agents={agents} />
      )}

      {/* Reception / Mailbox */}
      {isReception && <ReceptionContent agents={agents} />}

      {/* AIRA cabin special content */}
      {room.id === 'aira_cabin' && (
        <AIRACabinContent agents={agents} />
      )}

      {/* Datta cabin special content */}
      {room.id === 'datta_cabin' && (
        <DattaCabinContent agents={agents} />
      )}

      {/* Generic agent sprites in room */}
      {!isDormitory && !isReception && !isMeetingRoom && room.id !== 'aira_cabin' && room.id !== 'datta_cabin' && (
        <div className="absolute inset-0 flex items-end justify-center gap-1.5 pb-2 pt-7 px-1.5">
          <AnimatePresence>
            {agentsInRoom.map((agent) => (
              <AgentSprite
                key={agent.agent}
                agent={agent}
                size="sm"
                onClick={() => onAgentClick?.(agent.agent)}
              />
            ))}
          </AnimatePresence>
          {agentsInRoom.length === 0 && (
            <div className="pt-8 text-center w-full">
              <p className="text-[8px] text-gray-300">Empty</p>
            </div>
          )}
        </div>
      )}

      {/* Active glow */}
      {(hasWorking || hasMeeting) && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            animation: isMeetingRoom ? 'meetingActiveGlow 3s ease-in-out infinite' : 'roomActiveGlow 3s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )
}

// ─── AIRA Cabin Content ──────────────────────────────────────────────────────
function AIRACabinContent({ agents }: { agents: ReturnType<typeof useOfficeStore.getState>['agents'] }) {
  const aira = agents.aira
  const isActive = aira && (aira.state === 'working' || aira.state === 'completed')

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-500"
          style={{
            background: isActive ? 'linear-gradient(135deg, #FFD70020, #D4A57420)' : '#D4A57408',
            borderColor: isActive ? '#D4A574' : '#D4A57440',
            boxShadow: isActive ? '0 0 20px #D4A57440' : 'none',
          }}
        >
          ☀️
        </div>
        {isActive && (
          <div
            className="absolute -inset-2 rounded-full border border-dashed"
            style={{
              borderColor: '#D4A57440',
              animation: 'spin 8s linear infinite',
            }}
          />
        )}
      </div>
      <p className="text-[9px] font-bold mt-1.5" style={{ color: aira?.state === 'working' ? '#D4A574' : '#D4A57480' }}>
        AIRA
      </p>
      {aira?.currentTask && (
        <p className="text-[7px] text-[#A19B95] mt-0.5 max-w-[80px] text-center truncate">
          {aira.currentTask}
        </p>
      )}
    </div>
  )
}

// ─── Datta Cabin Content ─────────────────────────────────────────────────────
function DattaCabinContent({ agents }: { agents: ReturnType<typeof useOfficeStore.getState>['agents'] }) {
  const datta = agents.datta
  const isActive = datta && (datta.state === 'working' || datta.state === 'meeting')

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500"
        style={{
          background: isActive ? '#8B5A2B15' : '#8B5A2B08',
          borderColor: isActive ? '#8B5A2B' : '#8B5A2B30',
          boxShadow: isActive ? '0 0 15px #8B5A2B30' : 'none',
        }}
      >
        👨‍💼
      </div>
      <p className="text-[8px] font-bold mt-1" style={{ color: isActive ? '#8B5A2B' : '#8B5A2B60' }}>
        Datta
      </p>
    </div>
  )
}

// ─── Meeting Room Content ────────────────────────────────────────────────────
function MeetingRoomContent({ agents }: { agents: AgentLocation[] }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
      {/* Meeting table */}
      <div
        className="relative px-4 py-2 rounded-lg mb-2"
        style={{ background: '#8B5A2B08', border: '1px dashed #8B5A2B30' }}
      >
        <p className="text-[8px] font-bold text-[#8B5A2B] text-center uppercase tracking-wider">
          📋 Project Kickoff
        </p>
      </div>
      {/* Agents at meeting */}
      <div className="flex items-center justify-center gap-1 flex-wrap px-2">
        <AnimatePresence>
          {agents.filter((a: AgentLocation) => a.state === 'meeting').map((agent: AgentLocation) => (
            <motion.div
              key={agent.agent}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs border"
                style={{
                  background: `${AGENT_META[agent.agent]?.color}15`,
                  borderColor: `${AGENT_META[agent.agent]?.color}40`,
                }}
              >
                {AGENT_META[agent.agent]?.symbol}
              </div>
              <p className="text-[6px] mt-0.5" style={{ color: AGENT_META[agent.agent]?.color }}>
                {AGENT_META[agent.agent]?.name}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Dormitory Content ───────────────────────────────────────────────────────
function DormitoryContent({ agents }: { agents: ReturnType<typeof useOfficeStore.getState>['agents'] }) {
  const sleeping: AgentLocation[] = Object.values(agents).filter(
    (a) => a.room === 'dormitory' && (a.state === 'sleeping' || a.state === 'idle')
  )
  const active: AgentLocation[] = Object.values(agents).filter(
    (a) => a.room !== 'dormitory' && a.state !== 'idle' && a.state !== 'sleeping'
  )

  return (
    <div className="absolute inset-0 flex items-center gap-3 pt-6 px-3">
      {/* Sleeping beds */}        <div className="flex items-center gap-1 flex-wrap flex-1 justify-center">
        {sleeping.map((agent: AgentLocation) => (
          <motion.div
            key={agent.agent}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <AgentSprite agent={agent} size="xs" showLabel={false} />
            <p className="text-[6px] text-gray-400 mt-0.5">💤</p>
          </motion.div>
        ))}
        {sleeping.length === 0 && (
          <p className="text-[8px] text-gray-300">All agents active</p>
        )}
      </div>
      {/* Activity summary */}
      {active.length > 0 && (
        <div className="flex items-center gap-1 text-[8px] text-[#716B65] flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {active.length} active
        </div>
      )}
    </div>
  )
}

// ─── Reception / Mailbox Content ─────────────────────────────────────────────
function ReceptionContent({ agents }: { agents: ReturnType<typeof useOfficeStore.getState>['agents'] }) {
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)
  const postman = agents.postman
  const isPostmanArriving = postman && (postman.state === 'arriving' || postman.state === 'walking')

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 pt-4">
      {/* Postman */}
      <div className="flex flex-col items-center">
        <motion.div
          animate={isPostmanArriving ? { x: [0, 5, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2"
          style={{
            background: isPostmanArriving ? '#05966915' : '#05966908',
            borderColor: isPostmanArriving ? '#059669' : '#05966930',
          }}
        >
          🚶
        </motion.div>
        <p className="text-[7px] text-gray-400 mt-0.5">Postman</p>
      </div>

      {/* Mailbox */}
      <div className="flex flex-col items-center">
        <motion.div
          key={mailboxStatus}
          initial={{ scale: 0.8 }}
          animate={{ scale: mailboxStatus === 'new_project' ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: mailboxStatus === 'new_project' ? Infinity : 0 }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2"
          style={{
            background: mailboxStatus === 'new_project' ? '#05966915'
              : mailboxStatus === 'processing' ? '#D9770610'
              : '#6B728008',
            borderColor: mailboxStatus === 'new_project' ? '#059669'
              : mailboxStatus === 'processing' ? '#D9770640'
              : '#6B728030',
          }}
        >
          📮
        </motion.div>
        <motion.p
          key={mailboxStatus}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[8px] font-bold mt-1"
          style={{
            color: mailboxStatus === 'new_project' ? '#059669'
              : mailboxStatus === 'processing' ? '#D97706'
              : '#9CA3AF',
          }}
        >
          {mailboxStatus === 'new_project' ? '📬 NEW PROJECT!'
            : mailboxStatus === 'processing' ? '⏳ PROCESSING...'
            : '📭 No new projects'}
        </motion.p>
      </div>
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

// ─── Walking Agents Overlay ──────────────────────────────────────────────────
function WalkingAgents({
  agents,
}: {
  agents: ReturnType<typeof useOfficeStore.getState>['agents']
}) {
  const walking: AgentLocation[] = Object.values(agents).filter(
    (a) => a.state === 'walking' || a.state === 'reporting' || a.state === 'arriving'
  )

  if (walking.length === 0) return null

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center gap-3 z-20 pointer-events-none">
      <AnimatePresence>
        {walking.map((agent) => {
          const meta = AGENT_META[agent.agent]
          return (
            <motion.div
              key={agent.agent}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: agent.state === 'reporting' ? [0, 8, 0] : agent.state === 'arriving' ? [-8, 0, 8] : 0,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.5,
                x: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="flex flex-col items-center"
            >
              <AgentSprite agent={agent} size="sm" showLabel={false} />
              <div
                className="text-[8px] font-bold mt-0.5 bg-white/90 px-2 py-0.5 rounded-full shadow-sm"
                style={{ color: meta?.color || '#8B5A2B' }}
              >
                {agent.state === 'reporting' ? '📋 Reporting...' : agent.state === 'arriving' ? '📮 Arriving...' : '🚶 Moving...'}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Virtual Office Component ────────────────────────────────────────────
export function VirtualOffice({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)

  // Count stats
  const working = Object.values(agents).filter(a => a.state === 'working').length
  const sleeping = Object.values(agents).filter(a => a.state === 'sleeping' || a.state === 'idle').length
  const meeting = Object.values(agents).filter(a => a.state === 'meeting').length
  const walking = Object.values(agents).filter(a => a.state === 'walking' || a.state === 'reporting').length
  const total = Object.keys(agents).length

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F5F0EB] overflow-hidden">
      {/* Office header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C2420]/5 bg-[#FFFCF9]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <div>
            <p className="text-[11px] font-bold text-[#2C2420]">AIRA Virtual Office</p>
            <p className="text-[9px] text-[#A19B95] capitalize">
              Phase: {phase.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Agent count badges */}
          <div className="flex items-center gap-1.5">
            {working > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                ⚡ {working} working
              </span>
            )}
            {meeting > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-200">
                🏢 {meeting} meeting
              </span>
            )}
            {walking > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                🚶 {walking} moving
              </span>
            )}
            {sleeping > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-500 font-bold border border-gray-200">
                💤 {sleeping} idle
              </span>
            )}
          </div>
          {projectIdea && (
            <div className="text-right max-w-[200px] hidden lg:block">
              <p className="text-[9px] text-[#A19B95] truncate">{projectIdea}</p>
            </div>
          )}
        </div>
      </div>

      {/* Office grid */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="grid grid-cols-7 grid-rows-5 gap-2 h-full min-h-[480px]">
          {ROOM_DEFS.map((room) => (
            <RoomTile key={room.id} room={room} agents={agents} onAgentClick={onAgentClick} />
          ))}
        </div>
      </div>

      {/* Walking agents overlay */}
      <WalkingAgents agents={agents} />

      {/* Workflow phase indicator */}
      <WorkflowIndicator phase={phase} />
    </div>
  )
}
