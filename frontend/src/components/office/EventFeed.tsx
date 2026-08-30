'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { OfficeEvent, AgentId } from '@/types/office'

const AGENT_COLORS: Record<AgentId, string> = {
  postman: '#059669',
  aira: '#D4A574',
  datta: '#8B5A2B',
  mercury: '#9CA3AF',
  mars: '#DC2626',
  venus: '#D97706',
  earth: '#2563EB',
  neptune: '#2563EB',
  pluto: '#7C3AED',
}

const AGENT_SYMBOLS: Record<AgentId, string> = {
  postman: '📮',
  aira: '☀️',
  datta: '👨‍💼',
  mercury: '☿',
  mars: '♂',
  venus: '♀',
  earth: '🌍',
  neptune: '♆',
  pluto: '🪐',
}

function EventItem({ event, index }: { event: OfficeEvent; index: number }) {
  const color = AGENT_COLORS[event.agent] || '#8B5A2B'
  const symbol = AGENT_SYMBOLS[event.agent] || '⚡'
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
      className="flex items-start gap-2.5 py-2 group"
    >
      {/* Timestamp */}
      <span className="text-[9px] font-mono text-[#A19B95] w-14 flex-shrink-0 pt-0.5 tabular-nums">
        {time}
      </span>

      {/* Agent indicator */}
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs transition-transform group-hover:scale-110"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}
      >
        {symbol}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#5A544E] leading-relaxed">{event.message}</p>
        {event.from_room && event.to_room && (
          <p className="text-[9px] text-[#A19B95] mt-0.5">
            {event.from_room.replace(/_/g, ' ')} → {event.to_room.replace(/_/g, ' ')}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function EventFeed() {
  const events = useOfficeStore((s) => s.events)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [events.length])

  // Show most recent 50 events
  const visibleEvents = events.slice(-50)

  return (
    <div className="flex flex-col h-full bg-[#FFFCF9]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2C2420]/5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B65]">
          Activity Feed
        </span>
        <span className="ml-auto text-[9px] text-[#A19B95]">{events.length} events</span>
      </div>

      {/* Events list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {visibleEvents.map((event, i) => (
            <EventItem key={event.id} event={event} index={i} />
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-2xl mb-2 opacity-30">📋</div>
            <p className="text-[10px] text-[#A19B95]">No events yet</p>
            <p className="text-[9px] text-[#D4C8BC] mt-1">Events will appear as agents work</p>
          </div>
        )}
      </div>
    </div>
  )
}
