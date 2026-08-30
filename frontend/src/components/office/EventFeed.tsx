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
  neptune: '#4B7BE8',
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

const EVENT_TYPE_STYLES: Record<string, { bg: string; border: string; icon?: string }> = {
  project_arrived:     { bg: '#ECFDF5', border: '#D1FAE5' },
  aira_received:       { bg: '#FFFBEB', border: '#FEF3C7' },
  aira_to_datta:       { bg: '#FFF7ED', border: '#FFEDD5' },
  meeting_called:      { bg: '#F5F3FF', border: '#EDE9FE' },
  agent_entered_meeting: { bg: '#F5F3FF', border: '#EDE9FE' },
  agent_started_work:  { bg: '#ECFDF5', border: '#D1FAE5' },
  agent_working:       { bg: '#ECFDF5', border: '#D1FAE5' },
  agent_completed:     { bg: '#ECFDF5', border: '#D1FAE5' },
  agent_reporting:     { bg: '#FFFBEB', border: '#FEF3C7' },
  agent_reported:      { bg: '#FFFBEB', border: '#FEF3C7' },
  agent_to_dorm:       { bg: '#F9FAFB', border: '#F3F4F6' },
  agent_sleeping:      { bg: '#F9FAFB', border: '#F3F4F6' },
  agent_woken:         { bg: '#FEF3C7', border: '#FDE68A' },
  datta_integrating:   { bg: '#FFF7ED', border: '#FFEDD5' },
  integration_complete: { bg: '#ECFDF5', border: '#D1FAE5' },
  aira_validating:     { bg: '#FFFBEB', border: '#FEF3C7' },
  validation_complete: { bg: '#ECFDF5', border: '#D1FAE5' },
  error:               { bg: '#FEF2F2', border: '#FECACA' },
  user_feedback:       { bg: '#EFF6FF', border: '#DBEAFE' },
}

function EventItem({ event, index }: { event: OfficeEvent; index: number }) {
  const color = AGENT_COLORS[event.agent] || '#8B5A2B'
  const symbol = AGENT_SYMBOLS[event.agent] || '⚡'
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const style = EVENT_TYPE_STYLES[event.event_type] || { bg: 'transparent', border: 'transparent' }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
      className="flex items-start gap-2 py-1.5 group"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}
        >
          {symbol}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="text-[9px] font-bold"
            style={{ color }}
          >
            {event.agent.toUpperCase()}
          </span>
          <span className="text-[8px] text-[#D4C8BC]">•</span>
          <span className="text-[8px] text-[#A19B95] font-mono">{time}</span>
        </div>
        <p className="text-[10px] text-[#5A544E] leading-relaxed">{event.message}</p>
        {event.from_room && event.to_room && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[8px] text-[#A19B95]">
              {event.from_room.replace(/_/g, ' ')}
            </span>
            <span className="text-[8px] text-[#D4C8BC]">→</span>
            <span className="text-[8px] text-[#A19B95]">
              {event.to_room.replace(/_/g, ' ')}
            </span>
          </div>
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
        <span className="ml-auto text-[9px] text-[#A19B95]">
          {events.length} events
        </span>
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
