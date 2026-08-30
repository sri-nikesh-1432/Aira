'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import { Send, Sparkles, Loader2, Bell, HelpCircle, Settings, User, Play } from 'lucide-react'

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
  onRunDemo?: () => void
  isRunning?: boolean
}

export function TopBar({ onSubmitProject, onRunDemo, isRunning }: TopBarProps) {
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)
  const progress = PHASE_PROGRESS[phase] || 0
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

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

  return (
    <div className="flex items-center gap-0 px-4 py-2 bg-[#0A0E14] border-b border-[#1A2332]">
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF8F00] flex items-center justify-center shadow-lg shadow-[#FFD700]/10">
          <span className="text-sm">☀️</span>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-white leading-none tracking-wide">AIRA AI SOFTWARE COMPANY</p>
          <p className="text-[7px] text-[#556677] leading-none mt-0.5">Building the future, together.</p>
        </div>
      </div>

      {/* Center: Project + Progress + Stage */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* Current Project */}
        <div className="text-right min-w-[120px]">
          <p className="text-[7px] text-[#445566] uppercase tracking-wider">Current Project</p>
          <p className="text-[9px] text-[#AABBCC] font-medium truncate max-w-[160px]">
            {projectIdea || 'No project loaded'}
          </p>
        </div>

        {/* Overall Progress */}
        <div className="text-right min-w-[100px]">
          <p className="text-[7px] text-[#445566] uppercase tracking-wider">Overall Progress</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-20 h-2 rounded-full bg-[#1A2332] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4FC3F7, #4CAF50)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#4FC3F7]">{progress}%</span>
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-right min-w-[100px]">
          <p className="text-[7px] text-[#445566] uppercase tracking-wider">Current Stage</p>
          <p className="text-[9px] text-[#FF9800] font-semibold">
            {STAGE_LABELS[phase] || phase.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Right: Input + Time + Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Input box */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111820] border border-[#1A2332] focus-within:border-[#4FC3F740] transition-colors w-[200px]">
          <Sparkles className="w-3 h-3 text-[#FFD700] flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder={projectIdea ? `Current: ${projectIdea.slice(0, 40)}...` : 'Describe your project idea...'}
            disabled={isRunning || submitting}
            className="flex-1 bg-transparent text-[10px] text-[#AABBCC] placeholder:text-[#334455] outline-none disabled:opacity-50"
          />
          <button onClick={handleSubmit} disabled={!inputValue.trim() || isRunning || submitting}
            className="p-1 rounded bg-[#4FC3F720] hover:bg-[#4FC3F730] disabled:opacity-30 transition-colors">
            {submitting ? <Loader2 className="w-2.5 h-2.5 text-[#4FC3F7] animate-spin" /> : <Send className="w-2.5 h-2.5 text-[#4FC3F7]" />}
          </button>
        </div>
        {/* Demo button */}
        <button onClick={onRunDemo}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FF980015] border border-[#FF980030] hover:bg-[#FF980025] transition-colors text-[8px] text-[#FF9800] font-semibold whitespace-nowrap">
          <Play className="w-2.5 h-2.5" /> Demo
        </button>

        {/* Time */}
        <div className="text-right">
          <p className="text-[10px] text-[#888] font-mono">{time}</p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
            <span className="text-[7px] text-[#4CAF50] font-medium">Live</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg hover:bg-[#1A2332] transition-colors text-[#556677] hover:text-[#AABBCC]">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#1A2332] transition-colors text-[#556677] hover:text-[#AABBCC]">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#1A2332] transition-colors text-[#556677] hover:text-[#AABBCC]">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8F00] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#0A0E14]" />
          </div>
        </div>
      </div>
    </div>
  )
}
