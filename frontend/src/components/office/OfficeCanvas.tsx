'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId, AgentLocation, AgentOfficeState } from '@/types/office'

// ─── Agent metadata ──────────────────────────────────────────────────────────
const AGENT_META: Record<AgentId, {
  name: string
  symbol: string
  color: string
  role: string
  hat: string
  deskColor: string
  screenContent: string
}> = {
  postman:  { name: 'Postman',  symbol: '📮', color: '#4CAF50', role: 'Delivery',       hat: '#388E3C', deskColor: '#5D4037', screenContent: '' },
  aira:     { name: 'AIRA',     symbol: '☀️', color: '#FFD700', role: 'CEO',            hat: '#F9A825', deskColor: '#3E2723', screenContent: '📊' },
  datta:    { name: 'Datta',    symbol: '💼', color: '#FF9800', role: 'Project Manager', hat: '#E65100', deskColor: '#4E342E', screenContent: '📋' },
  mercury:  { name: 'Mercury',  symbol: '☿',  color: '#90A4AE', role: 'Research',       hat: '#607D8B', deskColor: '#455A64', screenContent: '🔍' },
  mars:     { name: 'Mars',     symbol: '♂',  color: '#EF5350', role: 'Architect',      hat: '#C62828', deskColor: '#37474F', screenContent: '🏗️' },
  venus:    { name: 'Venus',    symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer', hat: '#EF6C00', deskColor: '#4E342E', screenContent: '🎨' },
  earth:    { name: 'Earth',    symbol: '🌍', color: '#42A5F5', role: 'Developer',      hat: '#1565C0', deskColor: '#263238', screenContent: '💻' },
  neptune:  { name: 'Neptune',  symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer',    hat: '#283593', deskColor: '#37474F', screenContent: '🧪' },
  pluto:    { name: 'Pluto',    symbol: '🪐', color: '#AB47BC', role: 'DevOps Engineer', hat: '#6A1B9A', deskColor: '#212121', screenContent: '🚀' },
}

const STATE_WORK_LABELS: Record<AgentOfficeState, string> = {
  idle: '',
  walking: 'Moving...',
  meeting: 'In Meeting',
  at_desk: 'Ready',
  working: 'Working...',
  reporting: 'Reporting...',
  completed: 'Done',
  sleeping: 'Sleeping',
  error: 'Error!',
  arriving: 'Arriving...',
}

// ─── Room positions on the 800x500 canvas ────────────────────────────────────
interface RoomRect {
  x: number; y: number; w: number; h: number
  label: string
  bgColor: string
  borderColor: string
  emoji: string
}

const ROOMS: Record<string, RoomRect> = {
  reception:     { x: 10,   y: 10,   w: 100, h: 100, label: 'MAILBOX',          bgColor: '#1B2838', borderColor: '#2A4060', emoji: '📮' },
  aira_office:   { x: 120,  y: 10,   w: 130, h: 100, label: 'AIRA',             bgColor: '#1E2A1E', borderColor: '#3A5A3A', emoji: '☀️' },
  datta_office:  { x: 260,  y: 10,   w: 130, h: 100, label: 'DATTA',            bgColor: '#2A1E10', borderColor: '#5A4020', emoji: '💼' },
  meeting_room:  { x: 400,  y: 10,   w: 200, h: 100, label: 'MEETING ROOM',     bgColor: '#1A1A2E', borderColor: '#3A3A5E', emoji: '🏢' },
  mercury_cabin: { x: 10,   y: 120,  w: 118, h: 90,  label: 'MERCURY',          bgColor: '#1C2333', borderColor: '#334466', emoji: '☿' },
  mars_cabin:    { x: 138,  y: 120,  w: 118, h: 90,  label: 'MARS',             bgColor: '#2E1A1A', borderColor: '#5A2A2A', emoji: '♂' },
  venus_cabin:   { x: 266,  y: 120,  w: 118, h: 90,  label: 'VENUS',            bgColor: '#2E2A1A', borderColor: '#5A5020', emoji: '♀' },
  earth_cabin:   { x: 394,  y: 120,  w: 118, h: 90,  label: 'EARTH',            bgColor: '#1A1A2E', borderColor: '#2A3A5E', emoji: '🌍' },
  neptune_cabin: { x: 522,  y: 120,  w: 88,  h: 90,  label: 'NEPTUNE',          bgColor: '#1A1E33', borderColor: '#2A3355', emoji: '♆' },
  pluto_cabin:   { x: 620,  y: 120,  w: 88,  h: 90,  label: 'PLUTO',            bgColor: '#231A33', borderColor: '#3A2A55', emoji: '🪐' },
  dormitory:     { x: 10,   y: 220,  w: 340, h: 120, label: 'DORMITORY',        bgColor: '#1A1A1A', borderColor: '#333333', emoji: '🛏️' },
  integration:   { x: 360,  y: 220,  w: 160, h: 120, label: 'INTEGRATION',      bgColor: '#1A2E1A', borderColor: '#2A5A2A', emoji: '🔗' },
  live_preview:  { x: 530,  y: 220,  w: 178, h: 120, label: 'LIVE PREVIEW',     bgColor: '#0D1B2A', borderColor: '#1B3A5C', emoji: '🌐' },
}

// ─── Agent default positions within rooms ─────────────────────────────────────
const AGENT_POSITIONS: Record<string, Record<string, { x: number; y: number }>> = {
  aira_office:   { aira: { x: 65, y: 55 } },
  datta_office:  { datta: { x: 65, y: 55 } },
  mercury_cabin: { mercury: { x: 55, y: 50 } },
  mars_cabin:    { mars: { x: 55, y: 50 } },
  venus_cabin:   { venus: { x: 55, y: 50 } },
  earth_cabin:   { earth: { x: 55, y: 50 } },
  neptune_cabin: { neptune: { x: 40, y: 50 } },
  pluto_cabin:   { pluto: { x: 40, y: 50 } },
  dormitory:     {
    mercury: { x: 40, y: 50 }, mars: { x: 90, y: 50 },
    venus: { x: 140, y: 50 }, earth: { x: 190, y: 50 },
    neptune: { x: 240, y: 50 }, pluto: { x: 290, y: 50 },
  },
  meeting_room:  {
    mercury: { x: 50, y: 50 }, mars: { x: 90, y: 50 },
    venus: { x: 130, y: 50 }, earth: { x: 50, y: 75 },
    neptune: { x: 90, y: 75 }, pluto: { x: 130, y: 75 },
  },
}

// ─── Pixel-art character sprite ───────────────────────────────────────────────
function PixelCharacter({
  agent,
  state,
  x,
  y,
  size = 20,
}: {
  agent: AgentId
  state: AgentOfficeState
  x: number
  y: number
  size?: number
}) {
  const meta = AGENT_META[agent]
  const isWorking = state === 'working'
  const isSleeping = state === 'sleeping' || state === 'idle'
  const isMeeting = state === 'meeting'
  const isWalking = state === 'walking' || state === 'reporting' || state === 'arriving'
  const isCompleted = state === 'completed'

  const hairColor = meta.color
  const skinColor = '#FFCC80'
  const shirtColor = meta.color

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: isSleeping ? 0.5 : 1,
        scale: isSleeping ? 0.85 : 1,
        x: isWalking ? [x - 2, x + 2, x - 2] : x,
        y: isWalking ? [y - 1, y + 1, y - 1] : y,
      }}
      transition={{
        duration: isWalking ? 0.8 : 0.3,
        repeat: isWalking ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {/* Body */}
      <rect
        x={x - size / 2}
        y={y - size / 2 + 4}
        width={size}
        height={size - 6}
        rx={2}
        fill={shirtColor}
        opacity={0.9}
      />
      {/* Head */}
      <circle
        cx={x}
        cy={y - size / 2 + 2}
        r={size / 3}
        fill={skinColor}
      />
      {/* Hair/Hat */}
      <rect
        x={x - size / 3}
        y={y - size / 2 - 2}
        width={size / 1.5}
        height={size / 4}
        rx={2}
        fill={meta.hat}
      />
      {/* Eyes */}
      {!isSleeping && (
        <>
          <circle cx={x - 2} cy={y - size / 2 + 2} r={1} fill="#333" />
          <circle cx={x + 2} cy={y - size / 2 + 2} r={1} fill="#333" />
        </>
      )}
      {/* Sleeping Z's */}
      {isSleeping && (
        <text
          x={x + size / 2 + 2}
          y={y - size / 2 - 2}
          fontSize="7"
          fill="#888"
          fontFamily="monospace"
        >
          💤
        </text>
      )}
      {/* Working glow */}
      {isWorking && (
        <circle
          cx={x}
          cy={y}
          r={size / 1.5}
          fill="none"
          stroke={meta.color}
          strokeWidth={0.5}
          opacity={0.4}
        >
          <animate attributeName="r" values={`${size / 1.5};${size / 1.2};${size / 1.5}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Status dot */}
      <circle
        cx={x + size / 2 - 2}
        cy={y - size / 2}
        r={2.5}
        fill={
          isWorking ? '#4CAF50'
          : isSleeping ? '#666'
          : isMeeting ? '#FF9800'
          : isWalking ? '#2196F3'
          : isCompleted ? '#4CAF50'
          : '#F44336'
        }
        stroke="#0D1B2A"
        strokeWidth={0.5}
      />
      {/* Name label */}
      <text
        x={x}
        y={y + size / 2 + 6}
        textAnchor="middle"
        fontSize="6"
        fill={meta.color}
        fontFamily="Inter, sans-serif"
        fontWeight="bold"
      >
        {meta.name}
      </text>
    </motion.g>
  )
}

// ─── Furniture drawing helpers ────────────────────────────────────────────────
function Desk({ x, y, color = '#3E2723' }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={24} height={12} rx={1} fill={color} />
      <rect x={x + 2} y={y + 1} width={20} height={3} rx={0.5} fill="#555" />
    </g>
  )
}

function Chair({ x, y }: { x: number; y: number }) {
  return (
    <rect x={x} y={y} width={8} height={8} rx={2} fill="#37474F" opacity={0.7} />
  )
}

function Computer({ x, y, on = false, color = '#4FC3F7' }: { x: number; y: number; on?: boolean; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={12} height={9} rx={1} fill="#222" />
      <rect x={x + 1} y={y + 1} width={10} height={6} rx={0.5} fill={on ? color : '#111'} opacity={on ? 0.9 : 0.3} />
      <rect x={x + 4} y={y + 9} width={4} height={2} fill="#333" />
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y + 4} width={6} height={5} rx={1} fill="#5D4037" />
      <circle cx={x + 3} cy={y + 2} r={4} fill="#2E7D32" opacity={0.8} />
    </g>
  )
}

function Bed({ x, y, occupied = false }: { x: number; y: number; occupied?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={28} height={14} rx={2} fill="#1A237E" opacity={0.5} />
      <rect x={x} y={y} width={28} height={4} rx={2} fill="#283593" opacity={0.6} />
      {occupied && (
        <circle cx={x + 14} cy={y + 8} r={3} fill="#FFCC80" opacity={0.6} />
      )}
    </g>
  )
}

function MeetingTable({ x, y }: { x: number; y: number }) {
  return (
    <rect x={x} y={y} width={80} height={30} rx={3} fill="#3E2723" opacity={0.8} />
  )
}

function Whiteboard({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={30} height={20} rx={1} fill="#ECEFF1" opacity={0.3} />
      <line x1={x + 4} y1={y + 5} x2={x + 26} y2={y + 5} stroke="#90A4AE" strokeWidth={0.5} opacity={0.4} />
      <line x1={x + 4} y1={y + 10} x2={x + 20} y2={y + 10} stroke="#90A4AE" strokeWidth={0.5} opacity={0.4} />
    </g>
  )
}

function Mailbox({ x, y, hasNew = false }: { x: number; y: number; hasNew?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={16} height={22} rx={2} fill={hasNew ? '#F44336' : '#5D4037'} />
      <rect x={x + 2} y={y + 2} width={12} height={8} rx={1} fill={hasNew ? '#FFCDD2' : '#795548'} />
      {hasNew && (
        <text x={x + 8} y={y + 8} textAnchor="middle" fontSize="6" fill="#C62828">✉</text>
      )}
    </g>
  )
}

// ─── Main Office Canvas ───────────────────────────────────────────────────────
export function OfficeCanvas() {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  // Map agents to their current room
  const agentsByRoom: Record<string, AgentLocation[]> = {}
  for (const agent of Object.values(agents)) {
    const roomKey = agent.room.replace('_cabin', '_cabin').replace('aira_cabin', 'aira_office').replace('datta_cabin', 'datta_office')
    const normalizedRoom = Object.keys(ROOMS).find(r => r === roomKey) || 'dormitory'
    if (!agentsByRoom[normalizedRoom]) agentsByRoom[normalizedRoom] = []
    agentsByRoom[normalizedRoom].push(agent)
  }

  const canvasW = 720
  const canvasH = 350

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0D1117] overflow-hidden">
      <svg
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A2332" strokeWidth="0.3" />
          </pattern>
          {/* Room shadow filter */}
          <filter id="roomShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={canvasW} height={canvasH} fill="#0D1117" />
        <rect width={canvasW} height={canvasH} fill="url(#grid)" />

        {/* ── ROOMS ── */}
        {Object.entries(ROOMS).map(([key, room]) => {
          const hasAgents = agentsByRoom[key]?.some(a => a.state !== 'sleeping' && a.state !== 'idle')
          const isMeetingActive = key === 'meeting_room' && agentsByRoom[key]?.some(a => a.state === 'meeting')

          return (
            <g key={key}>
              {/* Room background */}
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                rx={4}
                fill={room.bgColor}
                stroke={hasAgents ? room.borderColor : `${room.borderColor}66`}
                strokeWidth={hasAgents ? 1.5 : 0.5}
                filter="url(#roomShadow)"
              />
              {/* Room floor pattern */}
              <rect
                x={room.x + 2}
                y={room.y + 2}
                width={room.w - 4}
                height={room.h - 4}
                rx={2}
                fill="none"
                stroke={`${room.borderColor}22`}
                strokeWidth={0.3}
                strokeDasharray="4 4"
              />
              {/* Room label */}
              <text
                x={room.x + room.w / 2}
                y={room.y + 10}
                textAnchor="middle"
                fontSize="6"
                fill={hasAgents ? '#AABBCC' : '#556677'}
                fontFamily="Inter, sans-serif"
                fontWeight="bold"
                letterSpacing="0.5"
              >
                {room.emoji} {room.label}
              </text>
              {/* Active glow */}
              {hasAgents && (
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  rx={4}
                  fill="none"
                  stroke={room.borderColor}
                  strokeWidth={1}
                  opacity={0.3}
                >
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                </rect>
              )}
            </g>
          )
        })}

        {/* ── FURNITURE ── */}

        {/* AIRA office furniture */}
        <Desk x={160} y={50} color="#3E2723" />
        <Computer x={164} y={42} on={agents.aira?.state === 'working'} color="#FFD700" />
        <Chair x={170} y={64} />
        <Plant x={220} y={70} />

        {/* Datta office furniture */}
        <Desk x={300} y={50} color="#4E342E" />
        <Computer x={304} y={42} on={agents.datta?.state === 'working'} color="#FF9800" />
        <Chair x={310} y={64} />
        <Whiteboard x={340} y={20} />

        {/* Meeting room furniture */}
        <MeetingTable x={440} y={35} />
        <Whiteboard x={410} y={15} />
        {/* Meeting chairs around table */}
        <Chair x={445} y={28} />
        <Chair x={475} y={28} />
        <Chair x={505} y={28} />
        <Chair x={445} y={68} />
        <Chair x={475} y={68} />
        <Chair x={505} y={68} />

        {/* Planet cabin furniture */}
        <Desk x={30} y={145} color="#455A64" />
        <Computer x={34} y={137} on={agents.mercury?.state === 'working'} color="#90A4AE" />
        <Chair x={40} y={158} />

        <Desk x={158} y={145} color="#37474F" />
        <Computer x={162} y={137} on={agents.mars?.state === 'working'} color="#EF5350" />
        <Chair x={168} y={158} />

        <Desk x={286} y={145} color="#4E342E" />
        <Computer x={290} y={137} on={agents.venus?.state === 'working'} color="#FFB74D" />
        <Chair x={296} y={158} />

        <Desk x={414} y={145} color="#263238" />
        <Computer x={418} y={137} on={agents.earth?.state === 'working'} color="#42A5F5" />
        <Chair x={424} y={158} />

        <Desk x={540} y={145} color="#37474F" />
        <Computer x={544} y={137} on={agents.neptune?.state === 'working'} color="#5C6BC0" />
        <Chair x={550} y={158} />

        <Desk x={638} y={145} color="#212121" />
        <Computer x={642} y={137} on={agents.pluto?.state === 'working'} color="#AB47BC" />
        <Chair x={648} y={158} />

        {/* Dormitory beds */}
        <Bed x={25} y={245} occupied={agents.mercury?.room === 'dormitory'} />
        <Bed x={65} y={245} occupied={agents.mars?.room === 'dormitory'} />
        <Bed x={105} y={245} occupied={agents.venus?.room === 'dormitory'} />
        <Bed x={145} y={245} occupied={agents.earth?.room === 'dormitory'} />
        <Bed x={185} y={245} occupied={agents.neptune?.room === 'dormitory'} />
        <Bed x={225} y={245} occupied={agents.pluto?.room === 'dormitory'} />
        {/* Bed labels */}
        <text x={39} y={270} textAnchor="middle" fontSize="5" fill="#556">☿</text>
        <text x={79} y={270} textAnchor="middle" fontSize="5" fill="#556">♂</text>
        <text x={119} y={270} textAnchor="middle" fontSize="5" fill="#556">♀</text>
        <text x={159} y={270} textAnchor="middle" fontSize="5" fill="#556">🌍</text>
        <text x={199} y={270} textAnchor="middle" fontSize="5" fill="#556">♆</text>
        <text x={239} y={270} textAnchor="middle" fontSize="5" fill="#556">🪐</text>

        {/* Reception furniture */}
        <Mailbox x={30} y={50} hasNew={mailboxStatus === 'new_project'} />
        <Desk x={60} y={70} color="#33691E" />

        {/* Integration workspace */}
        <Desk x={380} y={260} color="#1B5E20" />
        <Computer x={384} y={252} on={agents.datta?.state === 'working' && phase === 'datta_integrating'} color="#4CAF50" />
        <Plant x={500} y={280} />

        {/* Live Preview area */}
        <rect x={545} y={240} width={148} height={80} rx={3} fill="#0D1B2A" stroke="#1B3A5C" strokeWidth={0.5} />
        <text x={619} y={250} textAnchor="middle" fontSize="5" fill="#4FC3F7" fontFamily="monospace">
          LIVE PREVIEW
        </text>

        {/* ── CHARACTERS ── */}
        {Object.entries(agents).map(([agentId, agent]) => {
          const room = agent.room
            .replace('_cabin', '_cabin')
            .replace('aira_cabin', 'aira_office')
            .replace('datta_cabin', 'datta_office')
          const normalizedRoom = Object.keys(ROOMS).find(r => r === room) || 'dormitory'
          const roomDef = ROOMS[normalizedRoom]
          if (!roomDef) return null

          // Get position within room
          const roomAgents = agentsByRoom[normalizedRoom] || []
          const indexInRoom = roomAgents.indexOf(agent)
          const positions = AGENT_POSITIONS[normalizedRoom]
          const basePos = positions?.[agentId] || { x: roomDef.w / 2, y: roomDef.h / 2 }

          // Offset if multiple agents in same room
          const offsetX = roomAgents.length > 1 ? (indexInRoom * 16) - (roomAgents.length * 8) : 0

          return (
            <PixelCharacter
              key={agentId}
              agent={agentId as AgentId}
              state={agent.state}
              x={roomDef.x + basePos.x + offsetX}
              y={roomDef.y + basePos.y}
              size={16}
            />
          )
        })}

        {/* Phase overlay */}
        {phase !== 'idle' && phase !== 'completed' && (
          <text
            x={canvasW / 2}
            y={canvasH - 5}
            textAnchor="middle"
            fontSize="7"
            fill="#4FC3F7"
            fontFamily="Inter, sans-serif"
            opacity={0.6}
          >
            {phase.replace(/_/g, ' ').toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  )
}
