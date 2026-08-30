'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'
import type { AgentId } from '@/types/office'

const AGENT_COLORS: Record<string, string> = {
  mercury: '#90A4AE', mars: '#EF5350', venus: '#FFB74D', earth: '#42A5F5',
  jupiter: '#C8A951', saturn: '#A89070', neptune: '#5C6BC0', uranus: '#7EC8C8', pluto: '#AB47BC',
}

const TASK_DEFS = [
  { id: 'TASK-001', name: 'Research',      agent: 'mercury' },
  { id: 'TASK-002', name: 'Architecture',  agent: 'mars' },
  { id: 'TASK-003', name: 'UI/UX Design',  agent: 'venus' },
  { id: 'TASK-004', name: 'Development',    agent: 'earth' },
  { id: 'TASK-005', name: 'Business',       agent: 'jupiter' },
  { id: 'TASK-006', name: 'Documentation',  agent: 'saturn' },
  { id: 'TASK-007', name: 'Testing',        agent: 'neptune' },
  { id: 'TASK-008', name: 'Meta-Evolution', agent: 'uranus' },
  { id: 'TASK-009', name: 'Deployment',     agent: 'pluto' },
]

const STAGE_LABELS: Record<string, string> = {
  idle: 'Standing By', project_arriving: 'Project Arriving', aira_analyzing: 'AIRA Analysis',
  datta_planning: 'Datta Planning', meeting_in_progress: 'Team Meeting', task_distribution: 'Task Assignment',
  agents_working: 'Development', reporting: 'Reporting', datta_integrating: 'Integration',
  aira_validating: 'Final Validation', iteration: 'Iteration', completed: 'Complete',
}

export function RightPanel() {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const projectIdea = useOfficeStore((s) => s.projectIdea)

  // Calculate progress from actual agent states
  const planetAgents = ['mercury', 'mars', 'venus', 'earth', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto']
  const completedCount = planetAgents.filter(id => {
    const a = (agents as Record<string, any>)[id]
    return a && (a.state === 'completed' || a.state === 'sleeping')
  }).length
  const totalPlanets = planetAgents.length
  const progress = totalPlanets > 0 ? Math.round((completedCount / totalPlanets) * 100) : 0

  const getTaskStatus = (agentId: string) => {
    const agent = (agents as Record<string, any>)[agentId]
    if (!agent) return 'pending'
    if (agent.state === 'working') return 'active'
    if (agent.state === 'completed' || agent.state === 'sleeping') return 'done'
    if (agent.state === 'meeting') return 'in-progress'
    return 'waiting'
  }

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    done:        { label: 'Done',        color: '#4CAF50', icon: '✓' },
    active:      { label: 'In Progress', color: '#FF9800', icon: '●' },
    'in-progress': { label: 'In Progress', color: '#FF9800', icon: '●' },
    waiting:     { label: 'Waiting',     color: '#445566', icon: '○' },
    pending:     { label: 'Pending',     color: '#334455', icon: '○' },
  }

  const airaState = (agents as Record<string, any>).aira?.state
  const dattaState = (agents as Record<string, any>).datta?.state

  return (
    <div className="w-48 flex-shrink-0 flex flex-col bg-[#0D1117] border-l border-[#1A2332] overflow-hidden">
      {/* COMPANY WALL */}
      <div className="px-3 py-2 border-b border-[#1A2332]">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#445566] mb-1.5">COMPANY WALL</p>
        <div className="space-y-1.5">
          <div>
            <p className="text-[7px] font-bold text-[#FFD700]">Vision</p>
            <p className="text-[7px] text-[#778] leading-relaxed">Empower ideas. Build solutions. Create impact.</p>
          </div>
          <div>
            <p className="text-[7px] font-bold text-[#4FC3F7]">Mission</p>
            <p className="text-[7px] text-[#778] leading-relaxed">We build software through AI agent collaboration.</p>
          </div>
        </div>
      </div>

      {/* TASK LEDGER */}
      <div className="px-3 py-2 border-b border-[#1A2332]">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#445566] mb-1.5">TASK LEDGER</p>
        <div className="space-y-0.5">
          {TASK_DEFS.map((task) => {
            const status = getTaskStatus(task.agent)
            const config = statusConfig[status]
            const agent = (agents as Record<string, any>)[task.agent]
            return (
              <div key={task.id} className="flex items-center gap-1.5 py-px">
                <span className="text-[6px] font-mono text-[#445566] w-11">{task.id}</span>
                <span className="text-[7px] flex-1" style={{ color: config.color }}>{task.name}</span>
                {agent?.progress !== undefined && agent.progress > 0 && status === 'active' && (
                  <span className="text-[6px] font-bold" style={{ color: AGENT_COLORS[task.agent] }}>
                    {agent.progress}%
                  </span>
                )}
                <span className="text-[6px]" style={{ color: config.color }}>{config.icon}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* PROJECT SUMMARY */}
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#445566] mb-1.5">PROJECT SUMMARY</p>
        <div className="space-y-1.5">
          <div>
            <p className="text-[6px] text-[#445566]">Project Name</p>
            <p className="text-[8px] text-[#8899AA] font-medium truncate">{projectIdea || 'No project'}</p>
          </div>
          <div>
            <p className="text-[6px] text-[#445566]">Current Stage</p>
            <p className="text-[8px] text-[#4FC3F7] font-medium">{STAGE_LABELS[phase] || phase}</p>
          </div>
          <div>
            <p className="text-[6px] text-[#445566]">Progress</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-1 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4FC3F7, #4CAF50)' }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <span className="text-[7px] font-bold text-[#4FC3F7]">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[6px] text-[#445566]">AIRA Status</p>
            <p className="text-[8px] text-[#FFD700] font-medium">
              {airaState === 'working' ? 'Supervising' : airaState === 'completed' ? 'Validated' : 'Standing by'}
            </p>
          </div>
          <div>
            <p className="text-[6px] text-[#445566]">Datta Status</p>
            <p className="text-[8px] text-[#FF9800] font-medium">
              {dattaState === 'working' ? 'Managing project' : dattaState === 'meeting' ? 'In meeting' : 'Standing by'}
            </p>
          </div>
          <div>
            <p className="text-[6px] text-[#445566]">Errors</p>
            <p className="text-[8px] text-[#4CAF50] font-medium">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
