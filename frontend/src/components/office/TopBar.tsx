'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { Send, Sparkles, Loader2 } from 'lucide-react'

const STAGE_LABELS: Record<string, string> = {
  idle: 'Standing By',
  project_arriving: 'Project Arriving',
  aira_analyzing: 'AIRA Analysis',
  datta_planning: 'Datta Planning',
  meeting_in_progress: 'Team Meeting',
  task_distribution: 'Task Assignment',
  agents_working: 'Development',
  reporting: 'Reporting',
  datta_integrating: 'Integration',
  aira_validating: 'Final Validation',
  iteration: 'Iteration',
  completed: 'Complete',
}

const PHASE_PROGRESS: Record<string, number> = {
  idle: 0, project_arriving: 5, aira_analyzing: 15, datta_planning: 25,
  meeting_in_progress: 35, task_distribution: 40, agents_working: 60,
  reporting: 75, datta_integrating: 85, aira_validating: 95, iteration: 90, completed: 100,
}

interface TopBarProps {
  onSubmitProject?: (idea: string) => void
  isRunning?: boolean
}

export function TopBar({ onSubmitProject, isRunning }: TopBarProps) {
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)
  const progress = PHASE_PROGRESS[phase] || 0
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim() || submitting) return
    setSubmitting(true)
    try {
      onSubmitProject?.(inputValue.trim())
      setInputValue('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#0A0E14] border-b border-[#1A2332]">
      {/* Branding */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF8F00] flex items-center justify-center shadow-lg">
          <span className="text-xs">☀️</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-white leading-none">AIRA AI SOFTWARE COMPANY</p>
          <p className="text-[7px] text-[#556677] leading-none mt-0.5">Building the future, together.</p>
        </div>
      </div>

      {/* Input box */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111820] border border-[#1A2332] focus-within:border-[#4FC3F740] transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700] flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={projectIdea ? `Current: ${projectIdea.slice(0, 50)}...` : 'Describe your project idea...'}
            disabled={isRunning || submitting}
            className="flex-1 bg-transparent text-[11px] text-[#AABBCC] placeholder:text-[#445566] outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isRunning || submitting}
            className="p-1 rounded-md bg-[#4FC3F720] hover:bg-[#4FC3F730] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-3 h-3 text-[#4FC3F7] animate-spin" />
            ) : (
              <Send className="w-3 h-3 text-[#4FC3F7]" />
            )}
          </button>
        </div>
      </div>

      {/* Progress + Stage */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-[7px] text-[#556677] uppercase tracking-wider">Progress</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-16 h-1.5 rounded-full bg-[#1A2332] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4FC3F7, #4CAF50)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[9px] font-bold text-[#4FC3F7]">{progress}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[7px] text-[#556677] uppercase tracking-wider">Stage</p>
          <p className="text-[9px] text-[#FF9800] font-medium">
            {STAGE_LABELS[phase] || phase.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#888] font-mono">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
            <span className="text-[8px] text-[#4CAF50] font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}
