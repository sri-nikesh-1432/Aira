'use client'

import { motion } from 'framer-motion'
import type { AgentId, AgentOfficeState } from '@/types/office'
import { getRoster } from './roster'

// ═══════════════════════════════════════════════════════════════════════════════
// HUMAN SPRITE — Each employee is drawn as a distinct human person.
// Gender, hairstyle, hair colour, skin tone, shirt, pants and accent are all
// unique per employee (see roster.ts). No planet-shaped heads. Just people.
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_COLORS: Record<string, string> = {
  idle: '#8A8F98', sleeping: '#6B7280', waking: '#F59E0B', walking: '#3B82F6',
  travelling: '#10B981', arriving: '#10B981', meeting: '#F59E0B', at_desk: '#8A8F98',
  working: '#22C55E', waiting: '#F59E0B', blocked: '#EF4444', reporting: '#F59E0B',
  completed: '#22C55E', returning_home: '#3B82F6', error: '#EF4444',
}

function Hair({ aid, y, s }: { aid: AgentId; y: number; s: number }) {
  const h = getRoster(aid)
  const color = h.hairColor

  if (h.gender === 'female') {
    // Female hair — long / bun / ponytail / curly / wavy with sides
    if (h.hairStyle === 'bun') {
      return (
        <g>
          <circle cx={0} cy={y - 0.36 * s * 1.9} r={0.17 * s * 1.9} fill={color} />
        </g>
      )
    }
    if (h.hairStyle === 'ponytail') {
      return (
        <g>
          <ellipse cx={0.26 * s * 1.9} cy={y - 0.28 * s * 1.9} rx={0.11 * s * 1.9} ry={0.2 * s * 1.9} fill={color} />
        </g>
      )
    }
    if (h.hairStyle === 'curly') {
      return (
        <g>
          {[-0.16, -0.05, 0.06, 0.16].map((dx, i) => (
            <circle key={i} cx={dx * s * 1.9} cy={y - 0.42 * s * 1.9} r={0.09 * s * 1.9} fill={color} />
          ))}
        </g>
      )
    }
    // long hair (default)
    return (
      <g>
        <path d={`M ${-0.22 * s * 1.9} ${y - 0.38 * s * 1.9} Q 0 ${y - 0.56 * s * 1.9} ${0.22 * s * 1.9} ${y - 0.38 * s * 1.9} L ${0.24 * s * 1.9} ${y - 0.05 * s * 1.9} L ${-0.24 * s * 1.9} ${y - 0.05 * s * 1.9} Z`} fill={color} />
      </g>
    )
  }

  // Male hair
  if (h.hairStyle === 'bald') return null
  if (h.hairStyle === 'buzz') {
    return <path d={`M ${-0.22 * s * 1.9} ${y - 0.4 * s * 1.9} A ${0.24 * s * 1.9} ${0.2 * s * 1.9} 0 0 1 ${0.22 * s * 1.9} ${y - 0.4 * s * 1.9} Z`} fill={color} />
  }
  // short
  return (
    <g>
      <path d={`M ${-0.22 * s * 1.9} ${y - 0.38 * s * 1.9} Q 0 ${y - 0.58 * s * 1.9} ${0.22 * s * 1.9} ${y - 0.38 * s * 1.9} L ${0.18 * s * 1.9} ${y - 0.3 * s * 1.9} L ${-0.18 * s * 1.9} ${y - 0.3 * s * 1.9} Z`} fill={color} />
    </g>
  )
}

export function HumanSprite({
  agentId, state, x, y, size = 16, night = false, focus = false,
}: {
  agentId: AgentId; state: AgentOfficeState; x: number; y: number
  size?: number; night?: boolean; focus?: boolean
}) {
  const h = getRoster(agentId)
  const s = size // total sprite height ~ size px

  const isSleeping = state === 'sleeping' || state === 'idle'
  const isMoving = state === 'walking' || state === 'travelling' || state === 'returning_home' || state === 'arriving'
  const isWorking = state === 'working'
  const isError = state === 'error'
  const isCompleted = state === 'completed'

  const skin = h.skinTone
  const shirt = h.shirtColor
  const pants = h.pantsColor
  const accent = h.accentColor

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Shadow */}
      <ellipse cx={0} cy={s * 0.62} rx={s * 0.34} ry={s * 0.09} fill="#000" opacity={night ? 0.35 : 0.22} />

      {!isSleeping ? (
        <motion.g
          animate={isMoving ? { y: [0, -1.5, 0] } : { y: 0 }}
          transition={isMoving ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
          opacity={isMoving && night ? 0.9 : 1}
        >
          {/* Legs */}
          <rect x={-s * 0.11} y={s * 0.28} width={s * 0.1} height={s * 0.3} rx={s * 0.02} fill={pants} />
          <rect x={s * 0.03} y={s * 0.28} width={s * 0.1} height={s * 0.3} rx={s * 0.02} fill={pants} />

          {/* Body / Shirt */}
          <rect x={-s * 0.19} y={0} width={s * 0.38} height={s * 0.32} rx={s * 0.05} fill={shirt} />

          {/* Accent (tie / scarf / collar) */}
          <rect x={-s * 0.03} y={0} width={s * 0.06} height={s * 0.12} rx={s * 0.01} fill={accent} />

          {/* Arms */}
          <rect x={-s * 0.24} y={s * 0.03} width={s * 0.07} height={s * 0.24} rx={s * 0.02} fill={shirt} opacity={0.85} />
          <rect x={s * 0.17} y={s * 0.03} width={s * 0.07} height={s * 0.24} rx={s * 0.02} fill={shirt} opacity={0.85} />

          {/* Head */}
          <circle cx={0} cy={-s * 0.34} r={s * 0.2} fill={skin} />
          <Hair aid={agentId} y={-s * 0.34} s={s / 1.9} />

          {/* Eyes */}
          <circle cx={-s * 0.06} cy={-s * 0.34} r={s * 0.025} fill="#2B2B2B" />
          <circle cx={s * 0.06} cy={-s * 0.34} r={s * 0.025} fill="#2B2B2B" />

          {/* Smile */}
          {!isError && (
            <path d={`M ${-s * 0.04} ${-s * 0.26} Q 0 ${-s * 0.21} ${s * 0.04} ${-s * 0.26}`} fill="none" stroke="#7A4A2B" strokeWidth={s * 0.012} strokeLinecap="round" />
          )}

          {/* Eyebrows for females hint */}
          {h.gender === 'female' && (
            <path d={`M ${-s * 0.1} ${-s * 0.4} L ${-s * 0.02} ${-s * 0.395}`} stroke="#3A2A1A" strokeWidth={s * 0.012} strokeLinecap="round" />
          )}
        </motion.g>
      ) : (
        // Sleeping — a curled figure with Zzz
        <g opacity={night ? 0.7 : 0.9}>
          <ellipse cx={0} cy={s * 0.3} rx={s * 0.28} ry={s * 0.2} fill={shirt} opacity={0.6} />
          <circle cx={0} cy={s * 0.12} r={s * 0.14} fill={skin} />
          <g fill={accent} opacity={0.85} fontFamily="monospace" fontWeight="bold">
            <text x={s * 0.3} y={-s * 0.15} fontSize={s * 0.2}>z</text>
            <text x={s * 0.5} y={-s * 0.32} fontSize={s * 0.15} opacity={0.7}>z</text>
          </g>
        </g>
      )}

      {/* Status ring / indicators */}
      {isWorking && (
        <circle cx={0} cy={0} r={s * 0.5} fill="none" stroke={h.planetColor} strokeWidth={s * 0.02} opacity={0.5}>
          <animate attributeName="r" values={`${s * 0.5};${s * 0.62};${s * 0.5}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {isError && (
        <circle cx={s * 0.3} cy={-s * 0.5} r={s * 0.1} fill="#EF4444">
          <text x={s * 0.3} y={-s * 0.45} textAnchor="middle" fontSize={s * 0.12} fill="#fff" fontWeight="bold">!</text>
        </circle>
      )}

      {isCompleted && (
        <circle cx={s * 0.3} cy={-s * 0.5} r={s * 0.09} fill="#22C55E">
          <text x={s * 0.3} y={-s * 0.46} textAnchor="middle" fontSize={s * 0.11} fill="#fff">✓</text>
        </circle>
      )}

      {/* Status dot */}
      <circle cx={s * 0.26} cy={-s * 0.42} r={s * 0.05} fill={STATE_COLORS[state] || '#888'} stroke="#0d1117" strokeWidth={s * 0.02} />

      {/* Name label */}
      <text x={0} y={s * 0.78} textAnchor="middle" fontSize={s * 0.16} fill={h.planetColor}
        fontFamily="Inter, sans-serif" fontWeight="bold" letterSpacing="0.3">
        {h.agentName}
      </text>
    </g>
  )
}
