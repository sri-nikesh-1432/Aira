'use client'

import { motion } from 'framer-motion'
import type { AgentLocation, AgentId, AgentOfficeState } from '@/types/office'

// ─── Agent visual configuration ───────────────────────────────────────────────
const AGENT_VISUALS: Record<AgentId, {
  name: string
  symbol: string
  color: string
  idleColor: string
}> = {
  postman:  { name: 'Postman',  symbol: '📮', color: '#059669', idleColor: '#D1D5DB' },
  aira:     { name: 'AIRA',     symbol: '☀️', color: '#D4A574', idleColor: '#D4A574' },
  datta:    { name: 'Datta',    symbol: '👨‍💼', color: '#8B5A2B', idleColor: '#8B5A2B' },
  mercury:  { name: 'Mercury',  symbol: '☿', color: '#9CA3AF', idleColor: '#D1D5DB' },
  mars:     { name: 'Mars',     symbol: '♂', color: '#DC2626', idleColor: '#D1D5DB' },
  venus:    { name: 'Venus',    symbol: '♀', color: '#D97706', idleColor: '#D1D5DB' },
  earth:    { name: 'Earth',    symbol: '🌍', color: '#2563EB', idleColor: '#D1D5DB' },
  neptune:  { name: 'Neptune',  symbol: '♆', color: '#2563EB', idleColor: '#D1D5DB' },
  pluto:    { name: 'Pluto',    symbol: '🪐', color: '#7C3AED', idleColor: '#D1D5DB' },
}

// ─── State-based animations ──────────────────────────────────────────────────
const STATE_ANIMATIONS: Record<AgentOfficeState, {
  scale: number
  opacity: number
  animate?: string
  glow?: boolean
  bobble?: boolean
}> = {
  idle:      { scale: 0.9, opacity: 0.5 },
  walking:   { scale: 1.0, opacity: 1, bobble: true },
  meeting:   { scale: 1.0, opacity: 1, glow: true },
  at_desk:   { scale: 1.0, opacity: 0.9 },
  working:   { scale: 1.0, opacity: 1, glow: true },
  reporting: { scale: 1.0, opacity: 1, bobble: true },
  completed: { scale: 1.0, opacity: 1, glow: true },
  sleeping:  { scale: 0.85, opacity: 0.4 },
  error:     { scale: 1.0, opacity: 1, glow: true },
  arriving:  { scale: 1.1, opacity: 1, bobble: true },
}

// ─── Working activity icons ───────────────────────────────────────────────────
function getWorkingIcon(task: string | undefined): string {
  if (!task) return '💻'
  const t = task.toLowerCase()
  if (t.includes('research')) return '🔍'
  if (t.includes('architecture') || t.includes('architect')) return '🏗️'
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) return '🎨'
  if (t.includes('code') || t.includes('develop') || t.includes('implement')) return '💻'
  if (t.includes('test') || t.includes('qa')) return '🧪'
  if (t.includes('deploy')) return '🚀'
  if (t.includes('integrat')) return '🔗'
  if (t.includes('valid')) return '✅'
  if (t.includes('plan')) return '📋'
  return '💻'
}

interface AgentSpriteProps {
  agent: AgentLocation
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZE_CONFIG = {
  xs: { container: 'w-8 h-8', symbol: 'text-base', label: 'text-[7px]' },
  sm: { container: 'w-10 h-10', symbol: 'text-lg', label: 'text-[8px]' },
  md: { container: 'w-14 h-14', symbol: 'text-xl', label: 'text-[10px]' },
  lg: { container: 'w-20 h-20', symbol: 'text-3xl', label: 'text-xs' },
}

export function AgentSprite({ agent, size = 'md', showLabel = true }: AgentSpriteProps) {
  const visual = AGENT_VISUALS[agent.agent] || AGENT_VISUALS.earth
  const stateAnim = STATE_ANIMATIONS[agent.state] || STATE_ANIMATIONS.idle
  const sizeConf = SIZE_CONFIG[size]
  const isActive = agent.state === 'working' || agent.state === 'meeting' || agent.state === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: stateAnim.opacity,
        scale: stateAnim.scale,
        y: stateAnim.bobble ? [0, -3, 0] : 0,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        y: stateAnim.bobble ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : {},
      }}
      className="flex flex-col items-center gap-0.5 select-none"
    >
      {/* Agent body */}
      <div className="relative">
        {/* Glow ring for active agents */}
        {stateAnim.glow && (
          <div
            className="absolute -inset-1 rounded-full opacity-40"
            style={{
              background: `radial-gradient(circle, ${visual.color}40, transparent)`,
              animation: 'officeGlow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Avatar circle */}
        <div
          className={`${sizeConf.container} rounded-full flex items-center justify-center relative transition-all duration-300`}
          style={{
            background: isActive
              ? `linear-gradient(135deg, ${visual.color}20, ${visual.color}10)`
              : `${visual.color}08`,
            border: `2px solid ${isActive ? visual.color : `${visual.color}30`}`,
            boxShadow: isActive ? `0 0 12px ${visual.color}30` : 'none',
          }}
        >
          <span className={sizeConf.symbol}>
            {agent.state === 'working' ? getWorkingIcon(agent.currentTask) : visual.symbol}
          </span>

          {/* Sleeping Z's */}
          {agent.state === 'sleeping' && (
            <motion.span
              className="absolute -top-1 -right-1 text-[8px]"
              animate={{ y: [-2, -6], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            >
              💤
            </motion.span>
          )}

          {/* Error indicator */}
          {agent.state === 'error' && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">!</span>
            </div>
          )}

          {/* Working pulse */}
          {agent.state === 'working' && (
            <div
              className="absolute -inset-0.5 rounded-full border border-dashed"
              style={{
                borderColor: `${visual.color}40`,
                animation: 'spin 4s linear infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p
            className={`${sizeConf.label} font-bold leading-none`}
            style={{ color: isActive ? visual.color : `${visual.color}80` }}
          >
            {visual.name}
          </p>
          {agent.state === 'working' && agent.currentTask && size !== 'xs' && (
            <p className="text-[7px] text-[#A19B95] truncate max-w-[80px] leading-tight mt-0.5">
              {agent.currentTask}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
