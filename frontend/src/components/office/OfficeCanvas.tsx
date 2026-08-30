'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId, AgentOfficeState } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT DEFINITIONS — All planets + leadership
// ═══════════════════════════════════════════════════════════════════════════════

const AGENT_DEFS: Record<string, {
  name: string; symbol: string; color: string; role: string
  hat: string; shirt: string; screenColor: string
  cabinLabel: string; subtitle: string
}> = {
  postman:  { name: 'Postman', symbol: '📮', color: '#4CAF50', role: 'Delivery',       hat: '#2E7D32', shirt: '#66BB6A', screenColor: '#4CAF50', cabinLabel: '', subtitle: '' },
  aira:     { name: 'AIRA',    symbol: '☀️', color: '#FFD700', role: 'CEO',            hat: '#F9A825', shirt: '#FFD54F', screenColor: '#FFD700', cabinLabel: 'AIRA', subtitle: 'Managing Director' },
  datta:    { name: 'Datta',   symbol: '💼', color: '#FF9800', role: 'Project Manager', hat: '#E65100', shirt: '#FFB74D', screenColor: '#FF9800', cabinLabel: 'DATTA', subtitle: 'Project Manager' },
  mercury:  { name: 'Mercury', symbol: '☿',  color: '#90A4AE', role: 'Research',       hat: '#546E7A', shirt: '#78909C', screenColor: '#90A4AE', cabinLabel: 'MERCURY', subtitle: 'Research' },
  mars:     { name: 'Mars',    symbol: '♂',  color: '#EF5350', role: 'Architect',      hat: '#C62828', shirt: '#E57373', screenColor: '#EF5350', cabinLabel: 'MARS', subtitle: 'Architect' },
  venus:    { name: 'Venus',   symbol: '♀',  color: '#FFB74D', role: 'UI/UX Designer', hat: '#EF6C00', shirt: '#FFCC80', screenColor: '#FFB74D', cabinLabel: 'VENUS', subtitle: 'UI/UX Designer' },
  earth:    { name: 'Earth',   symbol: '🌍', color: '#42A5F5', role: 'Developer',      hat: '#1565C0', shirt: '#64B5F6', screenColor: '#42A5F5', cabinLabel: 'EARTH', subtitle: 'Developer' },
  jupiter:  { name: 'Jupiter', symbol: '♃',  color: '#C8A951', role: 'Business',       hat: '#8D6E00', shirt: '#D4A574', screenColor: '#C8A951', cabinLabel: 'JUPITER', subtitle: 'Business' },
  saturn:   { name: 'Saturn',  symbol: '♄',  color: '#A89070', role: 'Documentation',  hat: '#5D4037', shirt: '#A1887F', screenColor: '#A89070', cabinLabel: 'SATURN', subtitle: 'Documentation' },
  neptune:  { name: 'Neptune', symbol: '♆',  color: '#5C6BC0', role: 'QA Engineer',    hat: '#283593', shirt: '#7986CB', screenColor: '#5C6BC0', cabinLabel: 'NEPTUNE', subtitle: 'QA Engineer' },
  uranus:   { name: 'Uranus',  symbol: '♅',  color: '#7EC8C8', role: 'Meta-Evolution', hat: '#00695C', shirt: '#80CBC4', screenColor: '#7EC8C8', cabinLabel: 'URANUS', subtitle: 'Meta-Evolution' },
  pluto:    { name: 'Pluto',   symbol: '🪐', color: '#AB47BC', role: 'DevOps',         hat: '#6A1B9A', shirt: '#BA68C8', screenColor: '#AB47BC', cabinLabel: 'PLUTO', subtitle: 'DevOps Engineer' },
}

// The 6 main planet employees shown in the reference image's cabin row
const MAIN_PLANETS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto']
const ALL_PLANETS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto']

const STATE_COLORS: Record<AgentOfficeState, string> = {
  idle: '#555', walking: '#2196F3', meeting: '#FF9800', at_desk: '#666',
  working: '#4CAF50', reporting: '#FF9800', completed: '#4CAF50',
  sleeping: '#555', error: '#F44336', arriving: '#4CAF50',
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOM LAYOUT — Matching reference image: 3 rows
// Row 1: Mailbox | AIRA | Datta | Meeting Room
// Row 2: Mercury | Mars | Venus | Earth | Neptune | Pluto
// Row 3: Dormitory | Integration | Live Preview
// ═══════════════════════════════════════════════════════════════════════════════

interface RoomDef {
  id: string; x: number; y: number; w: number; h: number
  label: string; subtitle: string; emoji: string
  floorColor: string; wallColor: string; headerColor: string
}

// SVG viewBox: 1000 x 520
const ROOMS: RoomDef[] = [
  // Row 1: Executive floor
  { id: 'reception',     x: 10,   y: 10,  w: 130,  h: 155, label: 'MAILBOX',      subtitle: '',            emoji: '📮', floorColor: '#3D2B1F', wallColor: '#1A2535', headerColor: '#1B5E20' },
  { id: 'aira_office',   x: 150,  y: 10,  w: 200,  h: 155, label: 'AIRA',         subtitle: 'Managing Director', emoji: '☀️', floorColor: '#3D2B1F', wallColor: '#2A2510', headerColor: '#B8860B' },
  { id: 'datta_office',  x: 360,  y: 10,  w: 200,  h: 155, label: 'DATTA',        subtitle: 'Project Manager',   emoji: '💼', floorColor: '#3D2B1F', wallColor: '#2A1F10', headerColor: '#E65100' },
  { id: 'meeting_room',  x: 570,  y: 10,  w: 420,  h: 155, label: 'MEETING ROOM', subtitle: '',            emoji: '🏢', floorColor: '#3D2B1F', wallColor: '#151525', headerColor: '#1A237E' },

  // Row 2: Planet employee cabins (6 main)
  { id: 'mercury_cabin', x: 10,   y: 175, w: 158,  h: 165, label: 'MERCURY',   subtitle: 'Research',       emoji: '☿',  floorColor: '#3D2B1F', wallColor: '#1A2030', headerColor: '#546E7A' },
  { id: 'mars_cabin',    x: 178,  y: 175, w: 158,  h: 165, label: 'MARS',      subtitle: 'Architect',      emoji: '♂',  floorColor: '#3D2B1F', wallColor: '#2A1515', headerColor: '#C62828' },
  { id: 'venus_cabin',   x: 346,  y: 175, w: 158,  h: 165, label: 'VENUS',     subtitle: 'UI/UX Designer', emoji: '♀',  floorColor: '#3D2B1F', wallColor: '#2A2515', headerColor: '#EF6C00' },
  { id: 'earth_cabin',   x: 514,  y: 175, w: 158,  h: 165, label: 'EARTH',     subtitle: 'Developer',      emoji: '🌍', floorColor: '#3D2B1F', wallColor: '#15202A', headerColor: '#1565C0' },
  { id: 'neptune_cabin', x: 682,  y: 175, w: 158,  h: 165, label: 'NEPTUNE',   subtitle: 'QA Engineer',    emoji: '♆',  floorColor: '#3D2B1F', wallColor: '#15152A', headerColor: '#283593' },
  { id: 'pluto_cabin',   x: 850,  y: 175, w: 140,  h: 165, label: 'PLUTO',     subtitle: 'DevOps Engineer',emoji: '🪐', floorColor: '#3D2B1F', wallColor: '#1A152A', headerColor: '#6A1B9A' },

  // Row 3: Support floor
  { id: 'dormitory',     x: 10,   y: 350, w: 340,  h: 160, label: 'DORMITORY', subtitle: '',              emoji: '🛏️', floorColor: '#2A2520', wallColor: '#151520', headerColor: '#37474F' },
  { id: 'integration',   x: 360,  y: 350, w: 310,  h: 160, label: 'INTEGRATION PROJECT', subtitle: '',     emoji: '🔗', floorColor: '#3D2B1F', wallColor: '#0A200A', headerColor: '#2E7D32' },
  { id: 'live_preview',  x: 680,  y: 350, w: 310,  h: 160, label: 'LIVE PREVIEW', subtitle: '',             emoji: '🌐', floorColor: '#1A1520', wallColor: '#0A1520', headerColor: '#1565C0' },
]

// Map store room → canvas room
function normalizeRoom(room: string): string {
  if (room === 'dormitory') return 'dormitory'
  if (room === 'reception') return 'reception'
  if (room === 'hallway') return 'hallway'
  if (room === 'meeting_room') return 'meeting_room'
  if (room === 'aira_cabin') return 'aira_office'
  if (room === 'datta_cabin') return 'datta_office'
  return room
}

// Agent default rooms
const AGENT_DEFAULT_ROOM: Record<string, string> = {
  postman: 'reception', aira: 'aira_office', datta: 'datta_office',
  mercury: 'mercury_cabin', mars: 'mars_cabin', venus: 'venus_cabin',
  earth: 'earth_cabin', jupiter: 'mercury_cabin', saturn: 'mars_cabin',
  neptune: 'neptune_cabin', uranus: 'venus_cabin', pluto: 'pluto_cabin',
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG FURNITURE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function WoodFloor({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#3D2B1F" />
      {/* Wood planks */}
      {Array.from({ length: Math.floor(h / 8) }).map((_, i) => (
        <line key={i} x1={x} y1={y + i * 8} x2={x + w} y2={y + i * 8} stroke="#4A3525" strokeWidth={0.3} opacity={0.4} />
      ))}
    </g>
  )
}

function Desk({ x, y, w = 30, h = 12 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="#5D4037" />
      <rect x={x + 1} y={y + 1} width={w - 2} height={2} rx={0.5} fill="#6D4C41" opacity={0.6} />
      {/* Legs */}
      <rect x={x + 2} y={y + h} width={2} height={4} fill="#4E342E" />
      <rect x={x + w - 4} y={y + h} width={2} height={4} fill="#4E342E" />
    </g>
  )
}

function Monitor({ x, y, on = false, color = '#4FC3F7' }: { x: number; y: number; on?: boolean; color?: string }) {
  return (
    <g>
      {/* Screen */}
      <rect x={x} y={y} width={14} height={10} rx={1} fill="#111" stroke="#333" strokeWidth={0.3} />
      <rect x={x + 0.8} y={y + 0.8} width={12.4} height={8.4} rx={0.5}
        fill={on ? '#0A1520' : '#0A0A0A'} />
      {on && (
        <>
          <rect x={x + 1.2} y={y + 1.2} width={11.6} height={7.6} rx={0.3} fill={color} opacity={0.15} />
          {/* Screen content lines */}
          <rect x={x + 2} y={y + 2.5} width={6} height={0.8} rx={0.3} fill={color} opacity={0.4} />
          <rect x={x + 2} y={y + 4} width={8} height={0.8} rx={0.3} fill={color} opacity={0.3} />
          <rect x={x + 2} y={y + 5.5} width={5} height={0.8} rx={0.3} fill={color} opacity={0.25} />
          <rect x={x + 2} y={y + 7} width={7} height={0.8} rx={0.3} fill={color} opacity={0.2} />
          {/* Screen glow */}
          <rect x={x - 1} y={y - 1} width={16} height={12} rx={2} fill={color} opacity={0.04}>
            <animate attributeName="opacity" values="0.04;0.08;0.04" dur="3s" repeatCount="indefinite" />
          </rect>
        </>
      )}
      {/* Stand */}
      <rect x={x + 5} y={y + 10} width={4} height={3} fill="#222" />
      <rect x={x + 3} y={y + 13} width={8} height={1.5} rx={0.5} fill="#333" />
    </g>
  )
}

function Chair({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={8} height={8} rx={2} fill="#2A2A35" />
      <rect x={x + 1} y={y - 3} width={6} height={4} rx={1} fill="#333340" />
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y + 4} width={6} height={5} rx={1} fill="#5D4037" />
      <circle cx={x + 3} cy={y + 1} r={4} fill="#2E7D32" opacity={0.7} />
      <circle cx={x + 1} cy={y + 2} r={3} fill="#388E3C" opacity={0.5} />
      <circle cx={x + 5} cy={y + 2} r={3} fill="#1B5E20" opacity={0.5} />
    </g>
  )
}

function Mailbox({ x, y, hasNew = false }: { x: number; y: number; hasNew?: boolean }) {
  return (
    <g>
      {/* Postbox body */}
      <rect x={x} y={y} width={18} height={28} rx={3} fill={hasNew ? '#D32F2F' : '#5D4037'} />
      <rect x={x + 2} y={y + 2} width={14} height={10} rx={2} fill={hasNew ? '#E53935' : '#6D4C41'} />
      {/* Mail slot */}
      <rect x={x + 4} y={y + 5} width={10} height={2} rx={1} fill={hasNew ? '#FFCDD2' : '#8D6E63'} />
      {/* Crown */}
      <rect x={x + 2} y={y - 3} width={14} height={4} rx={2} fill={hasNew ? '#C62828' : '#4E342E'} />
      {hasNew && (
        <>
          <text x={x + 9} y={y + 22} textAnchor="middle" fontSize="7" fill="#FFCDD2">✉</text>
          {/* New project badge */}
          <rect x={x - 10} y={y + 30} width={38} height={12} rx={2} fill="#1B5E20" />
          <text x={x + 9} y={y + 39} textAnchor="middle" fontSize="5" fill="#A5D6A7" fontFamily="Inter" fontWeight="bold">NEW PROJECT</text>
          <text x={x + 9} y={y + 47} textAnchor="middle" fontSize="5" fill="#A5D6A7" fontFamily="Inter" fontWeight="bold">RECEIVED</text>
        </>
      )}
    </g>
  )
}

function MeetingTable({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={90} height={30} rx={4} fill="#5D4037" />
      <rect x={x + 2} y={y + 2} width={86} height={26} rx={3} fill="#6D4C41" opacity={0.5} />
    </g>
  )
}

function Whiteboard({ x, y, w = 32, h = 22, lines = [] }: { x: number; y: number; w?: number; h?: number; lines?: string[] }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="#CFD8DC" opacity={0.15} stroke="#546E7A" strokeWidth={0.3} />
      {lines.length > 0 ? lines.map((line, i) => (
        <text key={i} x={x + 3} y={y + 5 + i * 4} fontSize="3.2" fill="#90A4AE" opacity={0.5} fontFamily="Inter">
          {line}
        </text>
      )) : (
        <>
          <line x1={x + 3} y1={y + 5} x2={x + w - 3} y2={y + 5} stroke="#90A4AE" strokeWidth={0.3} opacity={0.3} />
          <line x1={x + 3} y1={y + 9} x2={x + w - 6} y2={y + 9} stroke="#90A4AE" strokeWidth={0.3} opacity={0.3} />
          <line x1={x + 3} y1={y + 13} x2={x + w - 4} y2={y + 13} stroke="#90A4AE" strokeWidth={0.3} opacity={0.3} />
        </>
      )}
    </g>
  )
}

function Bed({ x, y, occupied = false, agentSymbol = '' }: { x: number; y: number; occupied?: boolean; agentSymbol?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={30} height={20} rx={2} fill="#1A1A28" stroke="#252538" strokeWidth={0.4} />
      <rect x={x} y={y} width={30} height={6} rx={2} fill="#252538" />
      {/* Pillow */}
      <rect x={x + 3} y={y + 1} width={10} height={4} rx={1.5} fill="#3A3A48" />
      {occupied && (
        <>
          {/* Person in bed */}
          <circle cx={x + 8} cy={y + 12} r={3} fill="#FFCC80" opacity={0.5} />
          <rect x={x + 2} y={y + 14} width={26} height={5} rx={1} fill="#37474F" opacity={0.5} />
          {/* Zzz */}
          <text x={x + 20} y={y + 8} fontSize="4" fill="#666" fontFamily="monospace" opacity={0.6}>z</text>
          <text x={x + 23} y={y + 5} fontSize="3" fill="#555" fontFamily="monospace" opacity={0.4}>z</text>
        </>
      )}
      {agentSymbol && (
        <text x={x + 15} y={y + 28} textAnchor="middle" fontSize="4" fill="#556" fontFamily="Inter">
          {agentSymbol}
        </text>
      )}
    </g>
  )
}

function MiniBrowser({ x, y, w = 60, h = 40 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="#0A1520" stroke="#1B3A5C" strokeWidth={0.4} />
      {/* Browser bar */}
      <rect x={x} y={y} width={w} height={5} rx={2} fill="#111820" />
      <circle cx={x + 3} cy={y + 2.5} r={1} fill="#EF5350" opacity={0.6} />
      <circle cx={x + 6} cy={y + 2.5} r={1} fill="#FFC107" opacity={0.6} />
      <circle cx={x + 9} cy={y + 2.5} r={1} fill="#4CAF50" opacity={0.6} />
      <rect x={x + 14} y={y + 1} width={w - 18} height={3} rx={1} fill="#1A2332" />
      {/* Content */}
      <text x={x + w / 2} y={y + h / 2 + 2} textAnchor="middle" fontSize="4" fill="#4FC3F7" fontFamily="monospace" opacity={0.5}>
        LIVE PREVIEW
      </text>
    </g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL CHARACTER SPRITE — Detailed employee character
// ═══════════════════════════════════════════════════════════════════════════════

function Character({
  agentId, state, x, y, size = 14,
}: {
  agentId: AgentId; state: AgentOfficeState; x: number; y: number; size?: number
}) {
  const def = AGENT_DEFS[agentId]
  if (!def) return null

  const isWorking = state === 'working'
  const isSleeping = state === 'sleeping' || state === 'idle'
  const isWalking = state === 'walking' || state === 'reporting' || state === 'arriving'
  const isError = state === 'error'
  const isMeeting = state === 'meeting'
  const isCompleted = state === 'completed'

  const s = size / 14 // scale factor

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: isSleeping ? 0.4 : 1,
        y: isWalking ? [y - 1, y + 1, y - 1] : y,
      }}
      transition={{
        y: isWalking ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
        opacity: { duration: 0.3 },
      }}
    >
      {/* Shadow */}
      <ellipse cx={x} cy={y + size * 0.6} rx={size * 0.35} ry={size * 0.1} fill="#000" opacity={0.2} />

      {/* Body / Shirt */}
      <rect x={x - size * 0.3} y={y - size * 0.15} width={size * 0.6} height={size * 0.5} rx={2} fill={def.shirt} />

      {/* Arms */}
      {!isSleeping && (
        <>
          <rect x={x - size * 0.42} y={y - size * 0.1} width={size * 0.15} height={size * 0.35} rx={1} fill={def.shirt} opacity={0.8} />
          <rect x={x + size * 0.27} y={y - size * 0.1} width={size * 0.15} height={size * 0.35} rx={1} fill={def.shirt} opacity={0.8} />
        </>
      )}

      {/* Head */}
      <circle cx={x} cy={y - size * 0.35} r={size * 0.22} fill="#FFCC80" />

      {/* Hair / Hat */}
      <rect x={x - size * 0.25} y={y - size * 0.55} width={size * 0.5} height={size * 0.12} rx={1.5} fill={def.hat} />

      {/* Eyes */}
      {!isSleeping ? (
        <>
          <circle cx={x - size * 0.08} cy={y - size * 0.35} r={size * 0.04} fill="#333" />
          <circle cx={x + size * 0.08} cy={y - size * 0.35} r={size * 0.04} fill="#333" />
          {/* Eye whites */}
          <circle cx={x - size * 0.07} cy={y - size * 0.36} r={size * 0.015} fill="#FFF" />
          <circle cx={x + size * 0.09} cy={y - size * 0.36} r={size * 0.015} fill="#FFF" />
        </>
      ) : (
        <>
          {/* Closed eyes */}
          <line x1={x - size * 0.12} y1={y - size * 0.34} x2={x - size * 0.04} y2={y - size * 0.34} stroke="#333" strokeWidth={0.6} />
          <line x1={x + size * 0.04} y1={y - size * 0.34} x2={x + size * 0.12} y2={y - size * 0.34} stroke="#333" strokeWidth={0.6} />
        </>
      )}

      {/* Mouth */}
      {!isSleeping && !isError && (
        <path d={`M ${x - size * 0.05} ${y - size * 0.25} Q ${x} ${y - size * 0.2} ${x + size * 0.05} ${y - size * 0.25}`}
          fill="none" stroke="#333" strokeWidth={0.4} />
      )}

      {/* Sleeping Z */}
      {isSleeping && (
        <g opacity={0.5}>
          <text x={x + size * 0.35} y={y - size * 0.4} fontSize={size * 0.28} fill="#666" fontFamily="monospace" fontWeight="bold">z</text>
          <text x={x + size * 0.5} y={y - size * 0.55} fontSize={size * 0.22} fill="#555" fontFamily="monospace" fontWeight="bold">z</text>
        </g>
      )}

      {/* Working glow ring */}
      {isWorking && (
        <circle cx={x} cy={y} r={size * 0.55} fill="none" stroke={def.color} strokeWidth={0.5} opacity={0.3}>
          <animate attributeName="r" values={`${size * 0.55};${size * 0.65};${size * 0.55}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.15;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Error indicator */}
      {isError && (
        <g>
          <circle cx={x + size * 0.3} cy={y - size * 0.55} r={size * 0.15} fill="#F44336">
            <animate attributeName="r" values={`${size * 0.15};${size * 0.2};${size * 0.15}`} dur="1s" repeatCount="indefinite" />
          </circle>
          <text x={x + size * 0.3} y={y - size * 0.5} textAnchor="middle" fontSize={size * 0.15} fill="#FFF" fontWeight="bold">!</text>
        </g>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <circle cx={x + size * 0.3} cy={y - size * 0.55} r={size * 0.12} fill="#4CAF50" opacity={0.8}>
          <text x={x + size * 0.3} y={y - size * 0.5} textAnchor="middle" fontSize={size * 0.12} fill="#FFF">✓</text>
        </circle>
      )}

      {/* Meeting badge */}
      {isMeeting && (
        <rect x={x - size * 0.2} y={y + size * 0.4} width={size * 0.4} height={size * 0.15} rx={1} fill="#FF9800" opacity={0.8} />
      )}

      {/* Status dot */}
      <circle
        cx={x + size * 0.25} cy={y - size * 0.55}
        r={size * 0.08} fill={STATE_COLORS[state] || '#555'}
        stroke="#0D1117" strokeWidth={0.5}
      />

      {/* Name label */}
      <text x={x} y={y + size * 0.75} textAnchor="middle" fontSize={size * 0.32} fill={def.color}
        fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="0.2">
        {def.name}
      </text>
    </motion.g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT POSITIONING
// ═══════════════════════════════════════════════════════════════════════════════

function getAgentPosition(agentId: AgentId, roomId: string, roomIdx: number, totalInRoom: number): { x: number; y: number } {
  const room = ROOMS.find(r => r.id === roomId)
  if (!room) return { x: 500, y: 260 }

  const cx = room.x + room.w / 2
  const cy = room.y + room.h / 2

  // Executive offices
  if (roomId === 'aira_office') return { x: cx - 10, y: cy + 20 }
  if (roomId === 'datta_office') return { x: cx - 10, y: cy + 20 }

  // Meeting room — arrange around table
  if (roomId === 'meeting_room') {
    const col = roomIdx % 6
    const row = Math.floor(roomIdx / 6)
    return { x: room.x + 60 + col * 45, y: room.y + 30 + row * 40 }
  }

  // Reception
  if (roomId === 'reception') return { x: cx + 10, y: cy + 30 }

  // Dormitory — find bed
  if (roomId === 'dormitory') {
    const bedIdx = ALL_PLANETS.indexOf(agentId)
    if (bedIdx >= 0) {
      const bedX = room.x + 15 + bedIdx * 36
      return { x: bedX + 15, y: room.y + 30 }
    }
    return { x: cx, y: cy }
  }

  // Integration / Live Preview
  if (roomId === 'integration') return { x: cx - 15, y: cy + 20 }
  if (roomId === 'live_preview') return { x: cx - 15, y: cy + 20 }

  // Default: cabin center (sitting at desk)
  return { x: cx - 5, y: cy + 20 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OFFICE CANVAS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeCanvas({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  const canvasW = 1000
  const canvasH = 520

  // Group agents by room
  const agentsByRoom: Record<string, { agent: AgentId; state: AgentOfficeState }[]> = {}
  for (const agent of Object.values(agents)) {
    const normRoom = normalizeRoom(agent.room)
    if (!agentsByRoom[normRoom]) agentsByRoom[normRoom] = []
    agentsByRoom[normRoom].push({ agent: agent.agent, state: agent.state })
  }

  const meetingPhase = phase === 'meeting_in_progress' || phase === 'task_distribution'
  const workingPhase = phase === 'agents_working' || phase === 'reporting' || phase === 'datta_integrating'
  const validatingPhase = phase === 'aira_validating'

  return (
    <div className="relative w-full h-full bg-[#0A0E14] overflow-hidden">
      <svg
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Wood grain pattern */}
          <pattern id="woodFloor" width="40" height="8" patternUnits="userSpaceOnUse">
            <rect width="40" height="8" fill="#3D2B1F" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="#4A3525" strokeWidth="0.3" opacity="0.4" />
            <line x1="0" y1="4" x2="40" y2="4" stroke="#4A3525" strokeWidth="0.2" opacity="0.3" />
          </pattern>
          {/* Grid pattern for background */}
          <pattern id="bgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#151E2A" strokeWidth="0.15" />
          </pattern>
          {/* Room glow filter */}
          <filter id="roomGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4FC3F7" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={canvasW} height={canvasH} fill="#0A0E14" />
        <rect width={canvasW} height={canvasH} fill="url(#bgGrid)" />

        {/* ═══════ ROOMS ═══════ */}
        {ROOMS.map(room => {
          const roomAgents = agentsByRoom[room.id] || []
          const hasActive = roomAgents.some(a => a.state !== 'sleeping' && a.state !== 'idle')
          const hasWorking = roomAgents.some(a => a.state === 'working')

          return (
            <g key={room.id}>
              {/* Room walls */}
              <rect x={room.x} y={room.y} width={room.w} height={room.h} rx={3}
                fill={room.wallColor} stroke={hasActive ? `${room.headerColor}80` : `${room.headerColor}20`}
                strokeWidth={hasActive ? 0.8 : 0.4} />

              {/* Wood floor */}
              <rect x={room.x + 2} y={room.y + 2} width={room.w - 4} height={room.h - 4} rx={2}
                fill="url(#woodFloor)" opacity={0.3} />

              {/* Header bar */}
              <rect x={room.x} y={room.y} width={room.w} height={16} rx={3}
                fill={room.headerColor} opacity={0.6} />
              <rect x={room.x} y={room.y + 13} width={room.w} height={3}
                fill={room.headerColor} opacity={0.4} />

              {/* Room label */}
              <text x={room.x + 6} y={room.y + 11} fontSize="6" fill="#FFF"
                fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="0.5">
                {room.emoji} {room.label}
              </text>
              {room.subtitle && (
                <text x={room.x + room.w - 6} y={room.y + 11} fontSize="4.5" fill="#FFF"
                  fontFamily="Inter, sans-serif" opacity={0.6} textAnchor="end">
                  {room.subtitle}
                </text>
              )}

              {/* Active glow */}
              {hasWorking && (
                <rect x={room.x} y={room.y} width={room.w} height={room.h} rx={3}
                  fill="none" stroke={room.headerColor} strokeWidth={1} opacity={0.15}>
                  <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
                </rect>
              )}
            </g>
          )
        })}

        {/* ═══════ FURNITURE ═══════ */}

        {/* ── MAILBOX ── */}
        <Mailbox x={30} y={45} hasNew={mailboxStatus === 'new_project'} />
        <Desk x={70} y={90} w={25} h={10} />
        <Plant x={110} y={100} />

        {/* ── AIRA OFFICE ── */}
        <Desk x={185} y={65} w={35} h={14} />
        <Monitor x={190} y={50} on={agents.aira?.state === 'working'} color="#FFD700" />
        <Chair x={198} y={82} />
        <Plant x={290} y={90} />
        <Plant x={310} y={95} />
        <Whiteboard x={245} y={35} w={28} h={18} lines={['Objective:', 'Requirements:', 'Constraints:', 'Tech Stack:']} />

        {/* ── DATTA OFFICE ── */}
        <Desk x={395} y={65} w={35} h={14} />
        <Monitor x={400} y={50} on={agents.datta?.state === 'working'} color="#FF9800" />
        <Chair x={408} y={82} />
        <Whiteboard x={460} y={35} w={30} h={18} lines={['Project Board:', '• Tasks', '• Status', '• Dependencies']} />
        <Plant x={530} y={90} />

        {/* ── MEETING ROOM ── */}
        <MeetingTable x={620} y={50} />
        <Whiteboard x={700} y={28} w={45} h={28}
          lines={['PROJECT KICKOFF', '• Requirements', '• Features', '• Tech Stack', '• Deadlines']} />
        {/* Meeting chairs around table */}
        <Chair x={625} y={42} />
        <Chair x={660} y={42} />
        <Chair x={695} y={42} />
        <Chair x={625} y={82} />
        <Chair x={660} y={82} />
        <Chair x={695} y={82} />
        <Chair x={610} y={55} />
        <Chair x={725} y={55} />

        {/* ── PLANET CABINS (6 main) ── */}
        {[
          { room: 'mercury_cabin', color: '#90A4AE', on: agents.mercury?.state === 'working' },
          { room: 'mars_cabin',    color: '#EF5350', on: agents.mars?.state === 'working' },
          { room: 'venus_cabin',   color: '#FFB74D', on: agents.venus?.state === 'working' },
          { room: 'earth_cabin',   color: '#42A5F5', on: agents.earth?.state === 'working' },
          { room: 'neptune_cabin', color: '#5C6BC0', on: agents.neptune?.state === 'working' },
          { room: 'pluto_cabin',   color: '#AB47BC', on: agents.pluto?.state === 'working' },
        ].map(({ room, color, on }) => {
          const r = ROOMS.find(rm => rm.id === room)
          if (!r) return null
          return (
            <g key={room}>
              <Desk x={r.x + 20} y={r.y + 95} w={35} h={12} />
              <Monitor x={r.x + 25} y={r.y + 78} on={on} color={color} />
              <Chair x={r.x + 30} y={r.y + 110} />
              {/* Role-specific items */}
              <Plant x={r.x + r.w - 25} y={r.y + 110} />
              <Plant x={r.x + r.w - 15} y={r.y + 115} />
              {/* Second desk */}
              <Desk x={r.x + 85} y={r.y + 95} w={30} h={10} />
              <Monitor x={r.x + 90} y={r.y + 80} on={on} color={color} />
            </g>
          )
        })}

        {/* ── DORMITORY ── */}
        {ALL_PLANETS.map((agentId, i) => {
          const dorm = ROOMS.find(r => r.id === 'dormitory')!
          const agent = agents[agentId]
          const isSleeping = agent && (agent.state === 'sleeping' || agent.state === 'idle')
          const bedX = dorm.x + 15 + i * 36
          return (
            <Bed key={agentId} x={bedX} y={dorm.y + 25} occupied={!!isSleeping}
              agentSymbol={AGENT_DEFS[agentId]?.symbol || ''} />
          )
        })}

        {/* ── INTEGRATION WORKSPACE ── */}
        <Desk x={395} y={405} w={40} h={14} />
        <Monitor x={400} y={390} on={phase === 'datta_integrating'} color="#4CAF50" />
        <Chair x={410} y={422} />
        {/* Progress bar */}
        <rect x={395} y={445} width={240} height={6} rx={3} fill="#1A2332" />
        <rect x={395} y={445} width={240 * (phase === 'datta_integrating' ? 0.68 : phase === 'completed' ? 1 : 0)} height={6} rx={3}
          fill="#4CAF50" opacity={0.6}>
          <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x={515} y={460} textAnchor="middle" fontSize="4.5" fill="#81C784" fontFamily="Inter" fontWeight="bold">
          Merging all components
        </text>
        <text x={515} y={470} textAnchor="middle" fontSize="4" fill="#66BB6A" fontFamily="Inter" opacity={0.7}>
          {phase === 'datta_integrating' ? 'Generating build...' : phase === 'completed' ? 'Build complete!' : 'Waiting for results...'}
        </text>
        <Plant x={640} y={430} />

        {/* ── LIVE PREVIEW ── */}
        <MiniBrowser x={700} y={385} w={270} h={120} />
        {/* Preview content */}
        <rect x={705} y={395} width={260} height={105} rx={1} fill="#0A1520" />
        <text x={835} y={420} textAnchor="middle" fontSize="5" fill="#4FC3F7" fontFamily="Inter" fontWeight="bold" opacity={0.6}>
          {phase === 'completed' ? '✓ Project Preview Ready' : 'Generating Preview...'}
        </text>

        {/* ═══════ CHARACTERS ═══════ */}
        {Object.entries(agentsByRoom).map(([roomId, roomAgents]) => {
          if (roomId === 'hallway') return null
          return roomAgents.map((a, idx) => {
            const pos = getAgentPosition(a.agent, roomId, idx, roomAgents.length)
            return (
              <g key={a.agent} style={{ cursor: 'pointer' }}
                onClick={() => onAgentClick?.(a.agent)}>
                <Character agentId={a.agent} state={a.state} x={pos.x} y={pos.y} size={13} />
              </g>
            )
          })
        })}

        {/* Phase indicator watermark */}
        {phase !== 'idle' && (
          <text x={canvasW / 2} y={canvasH - 8} textAnchor="middle" fontSize="5"
            fill="#4FC3F7" fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="1.5" opacity={0.15}>
            {phase.replace(/_/g, ' ').toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  )
}
