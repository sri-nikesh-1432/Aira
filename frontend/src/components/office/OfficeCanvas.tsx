'use client'

import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId, AgentLocation, AgentOfficeState } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT DEFINITIONS — All 10 planets + AIRA + Datta + Postman
// ═══════════════════════════════════════════════════════════════════════════════

const AGENT_DEFS: Record<string, {
  name: string; symbol: string; color: string; role: string
  hat: string; shirt: string; deskTool: string; screenIcon: string
  cabinLabel: string
}> = {
  postman:  { name: 'Postman', symbol: '📮', color: '#4CAF50', role: 'Delivery',       hat: '#2E7D32', shirt: '#66BB6A', deskTool: '',       screenIcon: '',   cabinLabel: '' },
  aira:     { name: 'AIRA',    symbol: '☀️', color: '#FFD700', role: 'CEO',            hat: '#F9A825', shirt: '#FFD54F', deskTool: '📊',    screenIcon: '☀️', cabinLabel: 'AIRA' },
  datta:    { name: 'Datta',   symbol: '💼', color: '#FF9800', role: 'Project Manager', hat: '#E65100', shirt: '#FFB74D', deskTool: '📋',    screenIcon: '💼', cabinLabel: 'DATTA' },
  mercury:  { name: 'Mercury', symbol: '☿',  color: '#90A4AE', role: 'Research',       hat: '#546E7A', shirt: '#78909C', deskTool: '📚',    screenIcon: '🔍', cabinLabel: 'MERCURY' },
  mars:     { name: 'Mars',    symbol: '♂',  color: '#EF5350', role: 'Architect',      hat: '#C62828', shirt: '#E57373', deskTool: '📐',    screenIcon: '🏗️', cabinLabel: 'MARS' },
  venus:    { name: 'Venus',   symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer', hat: '#EF6C00', shirt: '#FFCC80', deskTool: '🎨',    screenIcon: '🖌️', cabinLabel: 'VENUS' },
  earth:    { name: 'Earth',   symbol: '🌍', color: '#42A5F5', role: 'Developer',      hat: '#1565C0', shirt: '#64B5F6', deskTool: '⌨️',    screenIcon: '💻', cabinLabel: 'EARTH' },
  neptune:  { name: 'Neptune', symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer',    hat: '#283593', shirt: '#7986CB', deskTool: '🧪',    screenIcon: '🛡️', cabinLabel: 'NEPTUNE' },
  pluto:    { name: 'Pluto',   symbol: '🪐', color: '#AB47BC', role: 'DevOps',         hat: '#6A1B9A', shirt: '#BA68C8', deskTool: '🚀',    screenIcon: '🐳', cabinLabel: 'PLUTO' },
  jupiter:  { name: 'Jupiter', symbol: '♃',  color: '#C8A951', role: 'Business',       hat: '#8D6E00', shirt: '#D4A574', deskTool: '📈',    screenIcon: '📊', cabinLabel: 'JUPITER' },
  saturn:   { name: 'Saturn',  symbol: '♄',  color: '#A89070', role: 'Documentation',  hat: '#5D4037', shirt: '#A1887F', deskTool: '📝',    screenIcon: '📄', cabinLabel: 'SATURN' },
  uranus:   { name: 'Uranus',  symbol: '♅',  color: '#7EC8C8', role: 'Meta-Evolution', hat: '#00695C', shirt: '#80CBC4', deskTool: '⚡',    screenIcon: '🔄', cabinLabel: 'URANUS' },
}

const PLANET_AGENTS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto']

const STATE_VISUAL: Record<AgentOfficeState, { label: string; dotColor: string; icon: string }> = {
  idle:      { label: 'Idle',      dotColor: '#555',    icon: '⏸' },
  walking:   { label: 'Moving',    dotColor: '#2196F3', icon: '🚶' },
  meeting:   { label: 'Meeting',   dotColor: '#FF9800', icon: '🏢' },
  at_desk:   { label: 'Ready',     dotColor: '#666',    icon: '🪑' },
  working:   { label: 'Working',   dotColor: '#4CAF50', icon: '⚡' },
  reporting: { label: 'Reporting', dotColor: '#FF9800', icon: '📋' },
  completed: { label: 'Done',      dotColor: '#4CAF50', icon: '✅' },
  sleeping:  { label: 'Sleeping',  dotColor: '#555',    icon: '💤' },
  error:     { label: 'Error',     dotColor: '#F44336', icon: '❌' },
  arriving:  { label: 'Arriving',  dotColor: '#4CAF50', icon: '📮' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOM LAYOUT — One connected office floor (SVG coordinate space: 800 x 400)
// ═══════════════════════════════════════════════════════════════════════════════

interface RoomDef {
  id: string; x: number; y: number; w: number; h: number
  label: string; emoji: string; bg: string; border: string
}

const ROOMS: RoomDef[] = [
  // Row 0: Top floor — Executive offices + Meeting room
  { id: 'reception',     x: 8,    y: 8,   w: 90,  h: 95,  label: 'MAILBOX',      emoji: '📮', bg: '#0E1A28', border: '#1A3050' },
  { id: 'aira_office',   x: 105,  y: 8,   w: 120, h: 95,  label: 'AIRA',         emoji: '☀️', bg: '#1A1A10', border: '#3A3A20' },
  { id: 'datta_office',  x: 232,  y: 8,   w: 120, h: 95,  label: 'DATTA',        emoji: '💼', bg: '#1A1510', border: '#3A3020' },
  { id: 'meeting_room',  x: 359,  y: 8,   w: 180, h: 95,  label: 'MEETING ROOM', emoji: '🏢', bg: '#10101A', border: '#252540' },
  { id: 'integration',   x: 546,  y: 8,   w: 120, h: 95,  label: 'INTEGRATION',  emoji: '🔗', bg: '#0A1A0A', border: '#1A3A1A' },
  { id: 'live_preview',  x: 673,  y: 8,   w: 119, h: 95,  label: 'LIVE PREVIEW', emoji: '🌐', bg: '#080D18', border: '#152540' },

  // Row 1: Planet employee cabins
  { id: 'mercury_cabin', x: 8,    y: 110, w: 78,  h: 80,  label: 'MERCURY',   emoji: '☿',  bg: '#12161C', border: '#253040' },
  { id: 'mars_cabin',    x: 93,   y: 110, w: 78,  h: 80,  label: 'MARS',      emoji: '♂',  bg: '#1C1212', border: '#402525' },
  { id: 'venus_cabin',   x: 178,  y: 110, w: 78,  h: 80,  label: 'VENUS',     emoji: '♀',  bg: '#1C1A10', border: '#403A20' },
  { id: 'earth_cabin',   x: 263,  y: 110, w: 78,  h: 80,  label: 'EARTH',     emoji: '🌍', bg: '#10141C', border: '#203040' },
  { id: 'jupiter_cabin', x: 348,  y: 110, w: 78,  h: 80,  label: 'JUPITER',   emoji: '♃',  bg: '#1A1810', border: '#3A3520' },
  { id: 'saturn_cabin',  x: 433,  y: 110, w: 78,  h: 80,  label: 'SATURN',    emoji: '♄',  bg: '#161410', border: '#302820' },
  { id: 'neptune_cabin', x: 518,  y: 110, w: 78,  h: 80,  label: 'NEPTUNE',   emoji: '♆',  bg: '#10121A', border: '#202A40' },
  { id: 'uranus_cabin',  x: 603,  y: 110, w: 78,  h: 80,  label: 'URANUS',    emoji: '♅',  bg: '#101A18', border: '#1A3A35' },
  { id: 'pluto_cabin',   x: 688,  y: 110, w: 104, h: 80,  label: 'PLUTO',     emoji: '🪐', bg: '#14101A', border: '#2A1A40' },

  // Row 2: Bottom floor — Dormitory
  { id: 'dormitory',     x: 8,    y: 197, w: 784, h: 80,  label: 'DORMITORY', emoji: '🛏️', bg: '#0C0C10', border: '#1A1A25' },
]

// Bed positions within dormitory (relative to dorm x,y)
const BED_POSITIONS = [
  { bx: 10,  by: 18, agent: 'mercury' },
  { bx: 75,  by: 18, agent: 'mars' },
  { bx: 140, by: 18, agent: 'venus' },
  { bx: 205, by: 18, agent: 'earth' },
  { bx: 270, by: 18, agent: 'jupiter' },
  { bx: 335, by: 18, agent: 'saturn' },
  { bx: 400, by: 18, agent: 'neptune' },
  { bx: 465, by: 18, agent: 'uranus' },
  { bx: 530, by: 18, agent: 'pluto' },
]

// Map agent → default room
const AGENT_DEFAULT_ROOM: Record<string, string> = {
  postman: 'reception', aira: 'aira_office', datta: 'datta_office',
  mercury: 'mercury_cabin', mars: 'mars_cabin', venus: 'venus_cabin',
  earth: 'earth_cabin', jupiter: 'jupiter_cabin', saturn: 'saturn_cabin',
  neptune: 'neptune_cabin', uranus: 'uranus_cabin', pluto: 'pluto_cabin',
}

// Map store room names → canvas room IDs
function normalizeRoom(room: string): string {
  if (room === 'dormitory') return 'dormitory'
  if (room === 'reception') return 'reception'
  if (room === 'hallway') return 'hallway'
  if (room === 'meeting_room') return 'meeting_room'
  if (room === 'aira_cabin') return 'aira_office'
  if (room === 'datta_cabin') return 'datta_office'
  return room // mercury_cabin, mars_cabin, etc. — already match
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG FURNITURE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function DeskSVG({ x, y, w = 22, h = 10, color = '#3E2723' }: { x: number; y: number; w?: number; h?: number; color?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={1.5} fill={color} />
}

function MonitorSVG({ x, y, on = false, color = '#4FC3F7' }: { x: number; y: number; on?: boolean; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={10} height={7} rx={1} fill="#111" />
      <rect x={x + 0.8} y={y + 0.8} width={8.4} height={5.4} rx={0.5} fill={on ? color : '#0A0A0A'} opacity={on ? 0.85 : 0.2} />
      <rect x={x + 3} y={y + 7} width={4} height={1.5} fill="#222" />
    </g>
  )
}

function ChairSVG({ x, y }: { x: number; y: number }) {
  return <rect x={x} y={y} width={7} height={7} rx={2} fill="#2A2A35" opacity={0.6} />
}

function PlantSVG({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y + 3} width={5} height={4} rx={1} fill="#3E2723" />
      <circle cx={x + 2.5} cy={y + 1} r={3.5} fill="#2E7D32" opacity={0.7} />
    </g>
  )
}

function BedSVG({ x, y, occupied = false }: { x: number; y: number; occupied?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={52} height={18} rx={2} fill="#1A1A28" />
      <rect x={x} y={y} width={52} height={5} rx={2} fill="#252538" />
      {occupied && <circle cx={x + 26} cy={y + 10} r={3} fill="#FFCC80" opacity={0.5} />}
      {occupied && <text x={x + 26} y={y + 16} textAnchor="middle" fontSize="5" fill="#666">💤</text>}
    </g>
  )
}

function MeetingTableSVG({ x, y }: { x: number; y: number }) {
  return <rect x={x} y={y} width={70} height={24} rx={3} fill="#3E2723" opacity={0.85} />
}

function WhiteboardSVG({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={16} rx={1} fill="#CFD8DC" opacity={0.2} />
      <line x1={x + 3} y1={y + 4} x2={x + 23} y2={y + 4} stroke="#90A4AE" strokeWidth={0.4} opacity={0.3} />
      <line x1={x + 3} y1={y + 8} x2={x + 18} y2={y + 8} stroke="#90A4AE" strokeWidth={0.4} opacity={0.3} />
    </g>
  )
}

function MailboxSVG({ x, y, hasNew = false }: { x: number; y: number; hasNew?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={14} height={20} rx={2} fill={hasNew ? '#D32F2F' : '#5D4037'} />
      <rect x={x + 2} y={y + 2} width={10} height={7} rx={1} fill={hasNew ? '#FFCDD2' : '#795548'} />
      {hasNew && <text x={x + 7} y={y + 7} textAnchor="middle" fontSize="5" fill="#C62828">✉</text>}
    </g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL CHARACTER SPRITE
// ═══════════════════════════════════════════════════════════════════════════════

function CharacterSprite({
  agent, state, x, y, size = 14,
}: {
  agent: AgentId; state: AgentOfficeState; x: number; y: number; size?: number
}) {
  const def = AGENT_DEFS[agent]
  const isWorking = state === 'working'
  const isSleeping = state === 'sleeping' || state === 'idle'
  const isMeeting = state === 'meeting'
  const isWalking = state === 'walking' || state === 'reporting' || state === 'arriving'
  const isError = state === 'error'

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: isSleeping ? 0.45 : 1,
        y: isWalking ? [y - 1.5, y + 1.5, y - 1.5] : y,
      }}
      transition={{
        y: isWalking ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
        opacity: { duration: 0.3 },
      }}
    >
      {/* Body / Shirt */}
      <rect x={x - size / 2} y={y - size / 2 + 3} width={size} height={size - 5} rx={2} fill={def.shirt} opacity={0.9} />
      {/* Head */}
      <circle cx={x} cy={y - size / 2 + 1} r={size / 3} fill="#FFCC80" />
      {/* Hat */}
      <rect x={x - size / 3} y={y - size / 2 - 2} width={size / 1.5} height={size / 4} rx={1.5} fill={def.hat} />
      {/* Eyes */}
      {!isSleeping && (
        <>
          <circle cx={x - 1.5} cy={y - size / 2 + 1} r={0.8} fill="#333" />
          <circle cx={x + 1.5} cy={y - size / 2 + 1} r={0.8} fill="#333" />
        </>
      )}
      {/* Sleeping eyes (closed) */}
      {isSleeping && (
        <line x1={x - 2} y1={y - size / 2 + 1} x2={x - 0.5} y2={y - size / 2 + 1} stroke="#333" strokeWidth={0.6} />
      )}
      {/* Sleeping Z */}
      {isSleeping && (
        <text x={x + size / 2 + 1} y={y - size / 2 - 1} fontSize="5" fill="#666" fontFamily="monospace">z</text>
      )}
      {/* Working glow */}
      {isWorking && (
        <circle cx={x} cy={y} r={size / 1.3} fill="none" stroke={def.color} strokeWidth={0.4} opacity={0.35}>
          <animate attributeName="r" values={`${size / 1.3};${size};${size / 1.3}`} dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Error indicator */}
      {isError && (
        <circle cx={x + size / 2} cy={y - size / 2} r={3} fill="#F44336">
          <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Status dot */}
      <circle
        cx={x + size / 2 - 1} cy={y - size / 2 + 0.5}
        r={2} fill={STATE_VISUAL[state]?.dotColor || '#555'}
        stroke="#0D1117" strokeWidth={0.4}
      />
      {/* Name */}
      <text x={x} y={y + size / 2 + 5} textAnchor="middle" fontSize="5" fill={def.color}
        fontFamily="Inter, sans-serif" fontWeight="bold">
        {def.name}
      </text>
    </motion.g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT POSITIONING — Where each agent sits in each room
// ═══════════════════════════════════════════════════════════════════════════════

function getAgentCanvasPosition(agentId: AgentId, room: string, roomIndex: number, totalInRoom: number): { x: number; y: number } {
  const roomDef = ROOMS.find(r => r.id === room)
  if (!roomDef) return { x: 400, y: 200 }

  const cx = roomDef.x + roomDef.w / 2
  const cy = roomDef.y + roomDef.h / 2

  // Special positions for specific rooms
  if (room === 'aira_office') return { x: cx, y: cy + 5 }
  if (room === 'datta_office') return { x: cx, y: cy + 5 }
  if (room === 'meeting_room') {
    // Arrange around meeting table
    const col = roomIndex % 5
    const row = Math.floor(roomIndex / 5)
    return { x: roomDef.x + 30 + col * 28, y: roomDef.y + 25 + row * 30 }
  }
  if (room === 'reception') return { x: cx, y: cy + 8 }
  if (room === 'integration') return { x: cx, y: cy + 5 }
  if (room === 'live_preview') return { x: cx, y: cy + 5 }
  if (room === 'dormitory') {
    // Find bed position
    const bed = BED_POSITIONS.find(b => b.agent === agentId)
    if (bed) return { x: roomDef.x + bed.bx + 26, y: roomDef.y + bed.by + 10 }
    return { x: cx + (roomIndex - 4) * 30, y: cy }
  }

  // Default: cabin center
  return { x: cx, y: cy + 5 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OFFICE CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeCanvas({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  const canvasW = 800
  const canvasH = 285

  // Group agents by room
  const agentsByRoom: Record<string, AgentLocation[]> = {}
  for (const agent of Object.values(agents)) {
    const normRoom = normalizeRoom(agent.room)
    if (!agentsByRoom[normRoom]) agentsByRoom[normRoom] = []
    agentsByRoom[normRoom].push(agent)
  }

  return (
    <div className="relative w-full h-full bg-[#0D1117] overflow-hidden flex items-center justify-center">
      <svg
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="officeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#151E2A" strokeWidth="0.2" />
          </pattern>
          <filter id="roomGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4FC3F7" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={canvasW} height={canvasH} fill="#0D1117" />
        <rect width={canvasW} height={canvasH} fill="url(#officeGrid)" />

        {/* ── ROOMS ── */}
        {ROOMS.map(room => {
          const hasActive = agentsByRoom[room.id]?.some(a =>
            a.state !== 'sleeping' && a.state !== 'idle'
          )
          return (
            <g key={room.id}>
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                rx={3} fill={room.bg}
                stroke={hasActive ? room.border : `${room.border}55`}
                strokeWidth={hasActive ? 1 : 0.4}
              />
              {/* Room floor texture */}
              <rect
                x={room.x + 2} y={room.y + 2} width={room.w - 4} height={room.h - 4}
                rx={1.5} fill="none" stroke={`${room.border}15`} strokeWidth={0.2} strokeDasharray="3 3"
              />
              {/* Label */}
              <text
                x={room.x + 4} y={room.y + 9}
                fontSize="5" fill={hasActive ? '#8899AA' : '#445566'}
                fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="0.3"
              >
                {room.emoji} {room.label}
              </text>
              {/* Active glow border */}
              {hasActive && (
                <rect
                  x={room.x} y={room.y} width={room.w} height={room.h}
                  rx={3} fill="none" stroke={room.border} strokeWidth={0.8} opacity={0.2}
                >
                  <animate attributeName="opacity" values="0.2;0.08;0.2" dur="3s" repeatCount="indefinite" />
                </rect>
              )}
            </g>
          )
        })}

        {/* ── FURNITURE ── */}

        {/* AIRA office: desk + monitor + plant */}
        <DeskSVG x={135} y={42} w={24} h={10} color="#3E2723" />
        <MonitorSVG x={138} y={34} on={agents.aira?.state === 'working'} color="#FFD700" />
        <ChairSVG x={142} y={54} />
        <PlantSVG x={195} y={55} />

        {/* Datta office: desk + monitor + whiteboard */}
        <DeskSVG x={262} y={42} w={24} h={10} color="#4E342E" />
        <MonitorSVG x={265} y={34} on={agents.datta?.state === 'working'} color="#FF9800" />
        <ChairSVG x={270} y={54} />
        <WhiteboardSVG x={310} y={18} />

        {/* Meeting room: large table + chairs */}
        <MeetingTableSVG x={395} y={30} />
        <WhiteboardSVG x={365} y={14} />
        <ChairSVG x={400} y={24} />
        <ChairSVG x={428} y={24} />
        <ChairSVG x={456} y={24} />
        <ChairSVG x={400} y={56} />
        <ChairSVG x={428} y={56} />
        <ChairSVG x={456} y={56} />

        {/* Integration workspace */}
        <DeskSVG x={570} y={40} w={22} h={10} color="#1B5E20" />
        <MonitorSVG x={573} y={32} on={phase === 'datta_integrating'} color="#4CAF50" />
        <PlantSVG x={640} y={55} />

        {/* Live preview screen */}
        <rect x={688} y={25} width={90} height={55} rx={3} fill="#0A1520" stroke="#1B3A5C" strokeWidth={0.4} />
        <text x={733} y={35} textAnchor="middle" fontSize="5" fill="#4FC3F7" fontFamily="monospace" opacity={0.7}>
          LIVE PREVIEW
        </text>

        {/* Reception: mailbox */}
        <MailboxSVG x={25} y={35} hasNew={mailboxStatus === 'new_project'} />
        <DeskSVG x={55} y={55} w={20} h={8} color="#1B5E20" />

        {/* Planet cabin furniture — desks + monitors for each cabin */}
        {[
          { room: 'mercury_cabin', color: '#90A4AE', on: agents.mercury?.state === 'working' },
          { room: 'mars_cabin',    color: '#EF5350', on: agents.mars?.state === 'working' },
          { room: 'venus_cabin',   color: '#FFB74D', on: agents.venus?.state === 'working' },
          { room: 'earth_cabin',   color: '#42A5F5', on: agents.earth?.state === 'working' },
          { room: 'jupiter_cabin', color: '#C8A951', on: agents.jupiter?.state === 'working' },
          { room: 'saturn_cabin',  color: '#A89070', on: agents.saturn?.state === 'working' },
          { room: 'neptune_cabin', color: '#5C6BC0', on: agents.neptune?.state === 'working' },
          { room: 'uranus_cabin',  color: '#7EC8C8', on: agents.uranus?.state === 'working' },
          { room: 'pluto_cabin',   color: '#AB47BC', on: agents.pluto?.state === 'working' },
        ].map(({ room, color, on }) => {
          const r = ROOMS.find(rm => rm.id === room)
          if (!r) return null
          return (
            <g key={room}>
              <DeskSVG x={r.x + 12} y={r.y + 38} w={20} h={8} color="#333" />
              <MonitorSVG x={r.x + 15} y={r.y + 30} on={on} color={color} />
              <ChairSVG x={r.x + 18} y={r.y + 48} />
            </g>
          )
        })}

        {/* Dormitory beds */}
        {BED_POSITIONS.map(bed => {
          const dorm = ROOMS.find(r => r.id === 'dormitory')!
          const agentId = bed.agent as AgentId
          const agent = agents[agentId]
          const isSleeping = agent && (agent.state === 'sleeping' || agent.state === 'idle')
          return (
            <g key={bed.agent}>
              <BedSVG x={dorm.x + bed.bx} y={dorm.y + bed.by} occupied={isSleeping} />
              <text x={dorm.x + bed.bx + 26} y={dorm.y + bed.by + 25} textAnchor="middle"
                fontSize="4" fill="#556" fontFamily="Inter">
                {AGENT_DEFS[agentId]?.symbol}
              </text>
            </g>
          )
        })}

        {/* ── CHARACTERS ── */}
        {Object.entries(agentsByRoom).map(([roomId, roomAgents]) => {
          if (roomId === 'hallway') return null
          return roomAgents.map((agent, idx) => {
            const pos = getAgentCanvasPosition(agent.agent, roomId, idx, roomAgents.length)
            return (
              <g
                key={agent.agent}
                style={{ cursor: 'pointer' }}
                onClick={() => onAgentClick?.(agent.agent)}
              >
                <CharacterSprite
                  agent={agent.agent}
                  state={agent.state}
                  x={pos.x}
                  y={pos.y}
                  size={12}
                />
              </g>
            )
          })
        })}

        {/* Phase watermark */}
        {phase !== 'idle' && (
          <text
            x={canvasW / 2} y={canvasH - 4}
            textAnchor="middle" fontSize="5.5" fill="#4FC3F730"
            fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="1"
          >
            {phase.replace(/_/g, ' ').toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  )
}
