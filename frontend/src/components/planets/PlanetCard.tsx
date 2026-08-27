'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle, Loader2, XCircle, Clock } from 'lucide-react'
import { type Planet, type PlanetStatus, STATUS_COLORS } from '@/types'
import { clsx } from 'clsx'

interface PlanetCardProps {
  planet: Planet
  status: PlanetStatus
  message?: string
  quip?: string
  onClick?: () => void
  isActive?: boolean
}

const StatusIcon = ({ status }: { status: PlanetStatus }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-secondary" />
    case 'active':
      return <Loader2 className="w-4 h-4 text-primary animate-spin" />
    case 'error':
      return <XCircle className="w-4 h-4 text-error" />
    case 'waiting':
      return <Clock className="w-4 h-4 text-warning" />
    default:
      return <Circle className="w-4 h-4 text-text-muted" />
  }
}

export function PlanetCard({ planet, status, message, quip, onClick, isActive }: PlanetCardProps) {
  const isProcessing = status === 'active'
  const isDone = status === 'completed'
  const lit = isProcessing || isDone

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={clsx(
        'relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden',
        isActive && 'border-primary/40 bg-indigo-50',
        isDone && !isActive && 'border-emerald-200 bg-emerald-50/50',
        status === 'error' && 'border-red-200 bg-red-50/50',
        !isActive && !isDone && status !== 'error' && 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50'
      )}
    >
      {/* Active pulse bar */}
      {isProcessing && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
          style={{
            background: planet.color,
            boxShadow: `0 0 10px ${planet.color}`,
            animation: 'pulseGlow 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Planet icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
        style={{
          background: lit ? `${planet.color}15` : '#F4F4F5',
          border: `1px solid ${lit ? planet.color + '44' : 'transparent'}`,
          boxShadow: isProcessing ? `0 0 18px ${planet.color}55` : undefined,
        }}
      >
        <span style={{ filter: lit ? 'none' : 'grayscale(1) opacity(0.5)' }}>
          {planet.symbol}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={clsx(
                'text-sm font-semibold transition-colors truncate',
                lit ? 'text-zinc-900' : 'text-zinc-600'
              )}
            >
              {planet.name}
            </span>
            <StatusIcon status={status} />
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
            style={{
              background: `${STATUS_COLORS[status]}15`,
              color: STATUS_COLORS[status],
            }}
          >
            {status}
          </span>
        </div>

        <p className="text-xs mt-0.5 truncate" style={{ color: lit ? planet.color : '#64748B' }}>
          {planet.title}
        </p>

        {/* Live message */}
        {message && (isProcessing || isDone) && (
          <p className="text-xs mt-2 text-zinc-500 leading-relaxed line-clamp-2">
            {message}
          </p>
        )}

        {/* Personality quip — the agent's unique voice */}
        {(quip || (isProcessing && planet.voice[0])) && (
          <p
            className="text-xs mt-1.5 italic leading-relaxed"
            style={{ color: planet.color, opacity: 0.75 }}
          >
            "{quip || planet.voice[0]}"
          </p>
        )}
      </div>
    </motion.div>
  )
}
