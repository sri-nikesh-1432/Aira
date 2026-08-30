'use client'

import { motion } from 'framer-motion'
import type { AgentLocation, AgentId, AgentOfficeState } from '@/types/office'

// ─── Agent visual configuration ───────────────────────────────────────────────
const AGENT_VISUALS: Record<AgentId, {
  name: string
  symbol: string
  color: string
  role: string
  workingIcons: string[]
}> = {
  postman:  { name: 'Postman',  symbol: '📮', color: '#059669', role: 'Delivery',       workingIcons: ['📨', '🏃', '📬'] },
  aira:     { name: 'AIRA',     symbol: '☀️', color: '#D4A574', role: 'CEO',            workingIcons: ['🧠', '⚡', '🔍'] },
  datta:    { name: 'Datta',    symbol: '👨‍💼', color: '#8B5A2B', role: 'Project Manager', workingIcons: ['📋', '📊', '🔗'] },
  mercury:  { name: 'Mercury',  symbol: '☿',  color: '#9CA3AF', role: 'Research',       workingIcons: ['🔍', '📚', '💡'] },
  mars:     { name: 'Mars',     symbol: '♂',  color: '#DC2626', role: 'Architect',      workingIcons: ['🏗️', '📐', '⚙️'] },
  venus:    { name: 'Venus',    symbol: '♀',  color: '#D97706', role: 'UI/UX',          workingIcons: ['🎨', '🖌️', '✨'] },
  earth:    { name: 'Earth',    symbol: '🌍', color: '#2563EB', role: 'Developer',      workingIcons: ['💻', '⌨️', '🔧'] },
  neptune:  { name: 'Neptune',  symbol: '♆',  color: '#4B7BE8', role: 'QA',             workingIcons: ['🧪', '🔬', '🛡️'] },
  pluto:    { name: 'Pluto',    symbol: '🪐', color: '#7C3AED', role: 'DevOps',         workingIcons: ['🚀', '🐳', '⚙️'] },
}

// ─── State-based animations ──────────────────────────────────────────────────
const STATE_ANIMATIONS: Record<AgentOfficeState, {
  scale: number
  opacity: number
  glow?: boolean
  bobble?: boolean
  breathe?: boolean
}> = {
  idle:      { scale: 0.85, opacity: 0.45 },
  walking:   { scale: 1.0, opacity: 1, bobble: true },
  meeting:   { scale: 1.0, opacity: 1, glow: true },
  at_desk:   { scale: 1.0, opacity: 0.9 },
  working:   { scale: 1.05, opacity: 1, glow: true, breathe: true },
  reporting: { scale: 1.0, opacity: 1, bobble: true },
  completed: { scale: 1.0, opacity: 1, glow: true },
  sleeping:  { scale: 0.82, opacity: 0.4 },
  error:     { scale: 1.0, opacity: 1, glow: true },
  arriving:  { scale: 1.1, opacity: 1, bobble: true },
}

// ─── Working activity icons based on task ─────────────────────────────────────
function getWorkingIcon(task: string | undefined, agentId: AgentId): string {
  if (!task) return AGENT_VISUALS[agentId]?.workingIcons[0] || '💻'
  const t = task.toLowerCase()
  if (t.includes('research')) return '🔍'
  if (t.includes('architecture') || t.includes('architect')) return '🏗️'
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) return '🎨'
  if (t.includes('code') || t.includes('develop') || t.includes('implement')) return '💻'
  if (t.includes('test') || t.includes('qa')) return '🧪'
  if (t.includes('deploy')) return '🚀'
  if (t.includes('integrat')) return '🔗'
  if (t.includes('valid')) return '✅'
  if (t.includes('plan') || t.includes('task')) return '📋'
  if (t.includes('business') || t.includes('strategy')) return '📊'
  if (t.includes('document') || t.includes('doc')) return '📝'
  if (t.includes('evolution') || t.includes('optimize')) return '⚡'
  return AGENT_VISUALS[agentId]?.workingIcons[0] || '💻'
}

// ─── Status badge for agent state ────────────────────────────────────────────
const STATUS_BADGE: Record<AgentOfficeState, { icon: string; color: string; bg: string }> = {
  idle:      { icon: '⏸', color: '#9CA3AF', bg: '#F3F4F6' },
  walking:   { icon: '🚶', color: '#3B82F6', bg: '#EFF6FF' },
  meeting:   { icon: '🏢', color: '#D97706', bg: '#FFFBEB' },
  at_desk:   { icon: '🪑', color: '#6B7280', bg: '#F9FAFB' },
  working:   { icon: '⚡', color: '#10B981', bg: '#ECFDF5' },
  reporting: { icon: '📋', color: '#059669', bg: '#ECFDF5' },
  completed: { icon: '✅', color: '#10B981', bg: '#ECFDF5' },
  sleeping:  { icon: '💤', color: '#9CA3AF', bg: '#F9FAFB' },
  error:     { icon: '❌', color: '#EF4444', bg: '#FEF2F2' },
  arriving:  { icon: '📮', color: '#059669', bg: '#ECFDF5' },
}

interface AgentSpriteProps {
  agent: AgentLocation
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onClick?: () => void
}

const SIZE_CONFIG = {
  xs: { container: 'w-7 h-7', symbol: 'text-sm', label: 'text-[7px]', badge: 'hidden' },
  sm: { container: 'w-9 h-9', symbol: 'text-base', label: 'text-[8px]', badge: 'text-[7px] px-1' },
  md: { container: 'w-12 h-12', symbol: 'text-lg', label: 'text-[9px]', badge: 'text-[8px] px-1.5' },
  lg: { container: 'w-16 h-16', symbol: 'text-2xl', label: 'text-[10px]', badge: 'text-[9px] px-2' },
}

export function AgentSprite({ agent, size = 'md', showLabel = true, onClick }: AgentSpriteProps) {
  const visual = AGENT_VISUALS[agent.agent] || AGENT_VISUALS.earth
  const stateAnim = STATE_ANIMATIONS[agent.state] || STATE_ANIMATIONS.idle
  const sizeConf = SIZE_CONFIG[size]
  const isActive = agent.state === 'working' || agent.state === 'meeting' || agent.state === 'completed' || agent.state === 'reporting'
  const statusBadge = STATUS_BADGE[agent.state]

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
      className="flex flex-col items-center gap-0.5 select-none cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: stateAnim.scale * 1.1 }}
      whileTap={{ scale: stateAnim.scale * 0.95 }}
    >
      {/* Agent body */}
      <div className="relative">
        {/* Glow ring for active agents */}
        {stateAnim.glow && (
          <div
            className="absolute -inset-1.5 rounded-full"
            style={{
              background: `radial-gradient(circle, ${visual.color}30, transparent)`,
              animation: 'officeGlow 2.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Avatar circle */}
        <div
          className={`${sizeConf.container} rounded-full flex items-center justify-center relative transition-all duration-500`}
          style={{
            background: isActive
              ? `linear-gradient(135deg, ${visual.color}20, ${visual.color}10)`
              : `${visual.color}08`,
            border: `2px solid ${isActive ? visual.color : `${visual.color}30`}`,
            boxShadow: isActive ? `0 0 12px ${visual.color}30` : 'none',
          }}
        >
          {/* Main symbol */}
          <span className={`${sizeConf.symbol} transition-all duration-300`}>
            {agent.state === 'working'
              ? getWorkingIcon(agent.currentTask, agent.agent)
              : agent.state === 'sleeping'
                ? '😴'
                : agent.state === 'error'
                  ? '⚠️'
                  : agent.state === 'reporting'
                    ? '📋'
                    : visual.symbol}
          </span>

          {/* Sleeping Z's */}
          {agent.state === 'sleeping' && size !== 'xs' && (
            <>
              <motion.span
                className="absolute -top-1 -right-0.5 text-[7px]"
                animate={{ y: [-1, -5], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              >
                💤
              </motion.span>
              <motion.span
                className="absolute -top-0 -right-2 text-[5px]"
                animate={{ y: [-1, -4], opacity: [0.8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              >
                z
              </motion.span>
            </>
          )}

          {/* Error indicator */}
          {agent.state === 'error' && (
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-[6px] text-white font-bold">!</span>
            </motion.div>
          )}

          {/* Working pulse ring */}
          {agent.state === 'working' && (
            <motion.div
              className="absolute -inset-0.5 rounded-full border-2 border-dashed"
              style={{ borderColor: `${visual.color}40` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Meeting indicator */}
          {agent.state === 'meeting' && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center text-[6px]"
              style={{ background: '#D9770620', border: '1px solid #D9770640' }}
            >
              💬
            </div>
          )}

          {/* Completed check */}
          {agent.state === 'completed' && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <span className="text-[6px] text-white">✓</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        {size !== 'xs' && size !== 'sm' && (
          <div
            className={`absolute -bottom-1 -right-2 ${sizeConf.badge} rounded-full font-bold flex items-center gap-0.5`}
            style={{ background: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.color}30` }}
          >
            <span className="text-[8px]">{statusBadge.icon}</span>
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p
            className={`${sizeConf.label} font-bold leading-none`}
            style={{ color: isActive ? visual.color : `${visual.color}70` }}
          >
            {visual.name}
          </p>
          {agent.state === 'working' && agent.currentTask && size !== 'xs' && (
            <p className="text-[7px] text-[#A19B95] truncate max-w-[80px] leading-tight mt-0.5">
              {agent.currentTask}
            </p>
          )}
          {agent.state === 'sleeping' && size !== 'xs' && (
            <p className="text-[7px] text-gray-400 leading-tight mt-0.5">
              sleeping
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
