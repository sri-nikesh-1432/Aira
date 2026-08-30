'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_COLORS: Record<AgentId, string> = {
  postman: '#4CAF50', aira: '#FFD700', datta: '#FF9800',
  mercury: '#90A4AE', mars: '#EF5350', venus: '#FFB74D',
  earth: '#42A5F5', neptune: '#5C6BC0', pluto: '#AB47BC',
}

const AGENT_SYMBOLS: Record<AgentId, string> = {
  postman: '📮', aira: '☀️', datta: '💼',
  mercury: '☿', mars: '♂', venus: '♀',
  earth: '🌍', neptune: '♆', pluto: '🪐',
}

const TASK_DEFS = [
  { id: 'TASK-001', name: 'Research', agent: 'mercury' },
  { id: 'TASK-002', name: 'Architecture', agent: 'mars' },
  { id: 'TASK-003', name: 'UI/UX Design', agent: 'venus' },
  { id: 'TASK-004', name: 'Development', agent: 'earth' },
  { id: 'TASK-005', name: 'Testing', agent: 'neptune' },
  { id: 'TASK-006', name: 'Deployment', agent: 'pluto' },
]

export function RightPanel() {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)

  // Calculate progress
  const completedCount = Object.values(agents).filter(
    a => a.state === 'completed' || a.state === 'sleeping'
  ).length
  const workingCount = Object.values(agents).filter(a => a.state === 'working').length
  const total = Object.keys(agents).length - 2 // minus aira and datta
  const progress = total > 0 ? Math.round((completedCount / Math.max(total, 1)) * 100) : 0

  // Get task status
  const getTaskStatus = (agentId: string) => {
    const agent = agents[agentId as AgentId]
    if (!agent) return 'pending'
    if (agent.state === 'working') return 'active'
    if (agent.state === 'completed' || agent.state === 'sleeping') return 'done'
    if (agent.state === 'meeting') return 'in-progress'
    return 'waiting'
  }

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    done:        { label: 'Done',        color: '#4CAF50', icon: '✓' },
    'active':    { label: 'In Progress', color: '#FF9800', icon: '●' },
    'in-progress': { label: 'In Progress', color: '#FF9800', icon: '●' },
    waiting:     { label: 'Waiting',     color: '#556677', icon: '○' },
    pending:     { label: 'Pending',     color: '#334455', icon: '○' },
  }

  // Current stage label
  const stageLabels: Record<string, string> = {
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
    completed: 'Complete',
  }

  return (
    <div className="w-52 flex-shrink-0 flex flex-col bg-[#0D1117] border-l border-[#1A2332] overflow-hidden">
      {/* COMPANY WALL */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#556677] mb-2">
          COMPANY WALL
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-[8px] font-bold text-[#FFD700]">Vision</p>
            <p className="text-[8px] text-[#888] leading-relaxed">
              Empower ideas. Build solutions. Create impact.
            </p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#4FC3F7]">Mission</p>
            <p className="text-[8px] text-[#888] leading-relaxed">
              We build software through collaboration between AI agents.
            </p>
          </div>
        </div>
      </div>

      {/* TASK LEDGER */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#556677] mb-2">
          TASK LEDGER
        </p>
        <div className="space-y-1">
          {TASK_DEFS.map((task) => {
            const status = getTaskStatus(task.agent)
            const config = statusConfig[status]
            const agent = agents[task.agent as AgentId]

            return (
              <div key={task.id} className="flex items-center gap-2 py-0.5">
                <span className="text-[7px] font-mono text-[#556677] w-12">{task.id}</span>
                <span className="text-[8px] flex-1" style={{ color: config.color }}>
                  {task.name}
                </span>
                {agent?.progress !== undefined && agent.progress > 0 && status === 'active' && (
                  <span className="text-[7px] font-bold" style={{ color: AGENT_COLORS[task.agent as AgentId] }}>
                    {agent.progress}%
                  </span>
                )}
                <span
                  className="text-[7px] font-bold"
                  style={{ color: config.color }}
                >
                  {config.icon} {config.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* PROJECT SUMMARY */}
      <div className="flex-1 px-3 py-2.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[#556677] mb-2">
          PROJECT SUMMARY
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-[7px] text-[#556677]">Project Name</p>
            <p className="text-[9px] text-[#AABBCC] font-medium truncate">
              {projectIdea || 'No project'}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-[#556677]">Current Stage</p>
            <p className="text-[9px] text-[#4FC3F7] font-medium">
              {stageLabels[phase] || phase}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-[#556677]">Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4FC3F7, #4CAF50)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[8px] font-bold text-[#4FC3F7]">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[7px] text-[#556677]">AIRA Status</p>
            <p className="text-[9px] text-[#FFD700] font-medium">
              {agents.aira?.state === 'working' ? 'Supervising' : agents.aira?.state === 'completed' ? 'Validated' : 'Standing by'}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-[#556677]">Datta Status</p>
            <p className="text-[9px] text-[#FF9800] font-medium">
              {agents.datta?.state === 'working' ? 'Managing project' : agents.datta?.state === 'meeting' ? 'In meeting' : 'Standing by'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
