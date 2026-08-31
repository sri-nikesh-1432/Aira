'use client'

import { motion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLE SPRITES — bicycle, car, helicopter.
// These sit under the character sprite when travelling.
// ═══════════════════════════════════════════════════════════════════════════════

export function BicycleSprite({ x, y, color = '#444', night = false, scale = 1 }: {
  x: number; y: number; color?: string; night?: boolean; scale?: number
}) {
  const s = scale
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      {/* Wheels */}
      <circle cx={-10 * s} cy={4 * s} r={6 * s} fill="none" stroke={night ? '#444' : '#666'} strokeWidth={1.5 * s}>
        <animateTransform attributeName="transform" type="rotate" from="0 -10 4" to="360 -10 4" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={10 * s} cy={4 * s} r={6 * s} fill="none" stroke={night ? '#444' : '#666'} strokeWidth={1.5 * s}>
        <animateTransform attributeName="transform" type="rotate" from="0 10 4" to="360 10 4" dur="0.6s" repeatCount="indefinite" />
      </circle>
      {/* Frame */}
      <line x1={-10 * s} y1={4 * s} x2={0} y2={-4 * s} stroke={color} strokeWidth={1.5 * s} />
      <line x1={0} y1={-4 * s} x2={10 * s} y2={4 * s} stroke={color} strokeWidth={1.5 * s} />
      <line x1={-10 * s} y1={4 * s} x2={10 * s} y2={4 * s} stroke={color} strokeWidth={1.5 * s} />
      {/* Handlebars */}
      <line x1={8 * s} y1={-6 * s} x2={12 * s} y2={-6 * s} stroke={color} strokeWidth={1.5 * s} />
      <line x1={10 * s} y1={-6 * s} x2={10 * s} y2={-2 * s} stroke={color} strokeWidth={1.5 * s} />
      {/* Seat */}
      <rect x={-2 * s} y={-6 * s} width={4 * s} height={2 * s} rx={1 * s} fill={color} />
      {/* Spokes (animated) */}
      {[0, 60, 120].map(angle => (
        <g key={angle}>
          <line x1={-10 * s} y1={4 * s} x2={-10 * s + Math.cos(angle * Math.PI / 180) * 5 * s} y2={4 * s + Math.sin(angle * Math.PI / 180) * 5 * s} stroke="#888" strokeWidth={0.4 * s} opacity={0.5} />
          <line x1={10 * s} y1={4 * s} x2={10 * s + Math.cos(angle * Math.PI / 180) * 5 * s} y2={4 * s + Math.sin(angle * Math.PI / 180) * 5 * s} stroke="#888" strokeWidth={0.4 * s} opacity={0.5} />
        </g>
      ))}
    </g>
  )
}

export function CarSprite({ x, y, color = '#333', night = false, scale = 1 }: {
  x: number; y: number; color?: string; night?: boolean; scale?: number
}) {
  const s = scale
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      {/* Car body */}
      <rect x={-18 * s} y={-6 * s} width={36 * s} height={12 * s} rx={4 * s} fill={color} />
      {/* Roof */}
      <rect x={-10 * s} y={-10 * s} width={20 * s} height={6 * s} rx={3 * s} fill={color} opacity={0.9} />
      {/* Windows */}
      <rect x={-8 * s} y={-9 * s} width={7 * s} height={4 * s} rx={1 * s} fill="#9bd4f5" opacity={0.8} />
      <rect x={1 * s} y={-9 * s} width={7 * s} height={4 * s} rx={1 * s} fill="#9bd4f5" opacity={0.8} />
      {/* Headlights */}
      <circle cx={16 * s} cy={-2 * s} r={1.5 * s} fill={night ? '#FFE082' : '#DDD'} />
      <circle cx={16 * s} cy={2 * s} r={1.5 * s} fill={night ? '#FFE082' : '#DDD'} />
      {/* Night glow */}
      {night && (
        <ellipse cx={22 * s} cy={0} rx={8 * s} ry={4 * s} fill="#FFE082" opacity={0.08} />
      )}
      {/* Wheels */}
      <circle cx={-12 * s} cy={6 * s} r={3.5 * s} fill="#222" />
      <circle cx={12 * s} cy={6 * s} r={3.5 * s} fill="#222" />
      <circle cx={-12 * s} cy={6 * s} r={1.5 * s} fill="#555" />
      <circle cx={12 * s} cy={6 * s} r={1.5 * s} fill="#555" />
    </g>
  )
}

export function HelicopterSprite({ x, y, color = '#C9A227', night = false, scale = 1 }: {
  x: number; y: number; color?: string; night?: boolean; scale?: number
}) {
  const s = scale
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      {/* Body */}
      <ellipse cx={0} cy={0} rx={22 * s} ry={7 * s} fill={color} />
      {/* Cockpit */}
      <path d={`M ${14 * s} ${-3 * s} Q ${26 * s} ${-3 * s} ${26 * s} ${3 * s} Q ${26 * s} ${5 * s} ${14 * s} ${5 * s} Z`} fill={color} opacity={0.8} />
      <rect x={16 * s} y={-2 * s} width={6 * s} height={4 * s} rx={2 * s} fill="#9bd4f5" opacity={0.7} />
      {/* Tail */}
      <rect x={-28 * s} y={-2 * s} width={12 * s} height={4 * s} rx={2 * s} fill={color} opacity={0.8} />
      <rect x={-32 * s} y={-4 * s} width={6 * s} height={8 * s} rx={2 * s} fill={color} opacity={0.6} />
      {/* Skids */}
      <line x1={-14 * s} y1={7 * s} x2={14 * s} y2={7 * s} stroke="#888" strokeWidth={1.5 * s} />
      <line x1={-12 * s} y1={9 * s} x2={12 * s} y2={9 * s} stroke="#888" strokeWidth={1 * s} />
      {/* Main rotor (spinning) */}
      <line x1={-30 * s} y1={-8 * s} x2={30 * s} y2={-8 * s} stroke="#888" strokeWidth={1.2 * s}>
        <animateTransform attributeName="transform" type="rotate" from="0 0 -8" to="360 0 -8" dur="0.3s" repeatCount="indefinite" />
      </line>
      <circle cx={0} cy={-8 * s} r={2 * s} fill="#555" />
      {/* Rotor blur */}
      <ellipse cx={0} cy={-8 * s} rx={28 * s} ry={3 * s} fill={color} opacity={0.15}>
        <animateTransform attributeName="transform" type="rotate" from="0 0 -8" to="360 0 -8" dur="0.3s" repeatCount="indefinite" />
      </ellipse>
      {/* Night glow */}
      {night && (
        <>
          <circle cx={-28 * s} cy={0} r={2 * s} fill="#FF4444" opacity={0.7} />
          <circle cx={20 * s} cy={0} r={2 * s} fill="#44FF44" opacity={0.5} />
        </>
      )}
    </g>
  )
}
