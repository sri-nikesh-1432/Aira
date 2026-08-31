'use client'

import { motion } from 'framer-motion'
import { useOfficeStore } from '@/store/officeStore'

const TASK_DEFS = [
  { id: 'TASK-001', name: 'Research',      agent: 'mercury' },
  { id: 'TASK-002', name: 'Architecture',  agent: 'mars' },
  { id: 'TASK-003', name: 'UI/UX Design',  agent: 'venus' },
  { id: 'TASK-004', name: 'Development',    agent: 'earth' },
  { id: 'TASK-005', name: 'Testing',        agent: 'neptune' },
  { id: 'TASK-006', name: 'Deployment',     agent: 'pluto' },
  { id: 'TASK-007', name: 'Documentation',  agent: 'ceres' },
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

  const planetAgents = ['mercury', 'mars', 'venus', 'earth', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto', 'ceres']
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
    done:         { label: 'Done',        color: '#4CAF50', icon: '✓' },
    active:       { label: 'In Progress', color: '#FF9800', icon: '●' },
    'in-progress': { label: 'In Progress', color: '#FF9800', icon: '●' },
    waiting:      { label: 'Waiting',     color: '#445566', icon: '○' },
    pending:      { label: 'Pending',     color: '#334455', icon: '○' },
  }

  const airaState = (agents as Record<string, any>).aira?.state
  const dattaState = (agents as Record<string, any>).datta?.state

  return (
    <div className="w-52 flex-shrink-0 flex flex-col bg-[#0D1117] border-l border-[#1A2332] overflow-hidden">
      {/* ═══ COMPANY WALL ═══ */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#556677] mb-2">COMPANY WALL</p>
        <div className="p-2.5 rounded-lg border border-[#1A2332] space-y-2">
          <div>
            <p className="text-[8px] font-bold text-[#FFD700]">Vision</p>
            <p className="text-[7px] text-[#7788AA] leading-relaxed mt-0.5">Empower ideas. Build solutions. Create impact.</p>
          </div>
          <div className="border-t border-[#1A2332] pt-1.5">
            <p className="text-[8px] font-bold text-[#4FC3F7]">Mission</p>
            <p className="text-[7px] text-[#7788AA] leading-relaxed mt-0.5">We build software through AI agent collaboration.</p>
          </div>
        </div>
        {/* Teamwork poster */}
        <div className="mt-2 p-2 rounded-lg bg-[#1A1520] border border-[#2A2040] text-center">
          <p className="text-[8px] font-bold text-[#FFD700]">TEAMWORK</p>
          <p className="text-[7px] text-[#8899AA]">MAKES THE</p>
          <p className="text-[8px] font-bold text-[#4FC3F7]">DREAM WORK</p>
        </div>
      </div>

      {/* ═══ TASK LEDGER ═══ */}
      <div className="px-3 py-2.5 border-b border-[#1A2332]">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#556677] mb-2">TASK LEDGER</p>
        <div className="space-y-1">
          {TASK_DEFS.map((task) => {
            const status = getTaskStatus(task.agent)
            const config = statusConfig[status]
            const agent = (agents as Record<string, any>)[task.agent]
            return (
              <div key={task.id} className="flex items-center gap-1.5">
                <span className="text-[7px] font-mono text-[#445566] w-12">{task.id}</span>
                <span className="text-[8px] flex-1" style={{ color: config.color }}>{task.name}</span>
                {agent?.progress !== undefined && agent.progress > 0 && status === 'active' && (
                  <span className="text-[7px] font-bold text-[#FF9800]">{agent.progress}%</span>
                )}
                <span className="text-[8px] font-bold" style={{ color: config.color }}>{config.icon}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ PROJECT SUMMARY ═══ */}
      <div className="flex-1 px-3 py-2.5 overflow-y-auto">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#556677] mb-2">PROJECT SUMMARY</p>
        <div className="space-y-2">
          <div>
            <p className="text-[7px] text-[#445566] uppercase tracking-wider">Project Name</p>
            <p className="text-[8px] text-[#AABBCC] font-medium truncate">{projectIdea || 'No project'}</p>
          </div>
          <div>
            <p className="text-[7px] text-[#445566] uppercase tracking-wider">Client</p>
            <p className="text-[8px] text-[#AABBCC] font-medium">User</p>
          </div>
          <div>
            <p className="text-[7px] text-[#445566] uppercase tracking-wider">Progress</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-1.5 rounded-full bg-[#1A2332] overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4FC3F7, #4CAF50)' }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <span className="text-[8px] font-bold text-[#4FC3F7]">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-[7px] text-[#445566] uppercase tracking-wider">Created At</p>
            <p className="text-[8px] text-[#AABBCC] font-medium">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-[#445566] uppercase tracking-wider">Project ID</p>
            <p className="text-[8px] text-[#4FC3F7] font-mono">AIRA-PROJ-{Math.floor(Math.random() * 9000 + 1000)}</p>
          </div>
        </div>

        {/* AIRA STATUS */}
        <div className="mt-3 p-2.5 rounded-lg border border-[#1A2332] bg-[#111820]">
          <p className="text-[8px] font-bold text-[#FFD700] mb-1">AIRA STATUS</p>
          <p className="text-[8px] text-[#AABBCC]">
            {airaState === 'working' ? 'Supervising' : airaState === 'completed' ? 'Validated ✓' : phase === 'aira_validating' ? 'Validating...' : 'Standing by'}
          </p>
        </div>

        {/* DATTA STATUS */}
        <div className="mt-1.5 p-2.5 rounded-lg border border-[#1A2332] bg-[#111820]">
          <p className="text-[8px] font-bold text-[#FF9800] mb-1">DATTA STATUS</p>
          <p className="text-[8px] text-[#AABBCC]">
            {dattaState === 'working' ? 'Managing project' : dattaState === 'meeting' ? 'In meeting' : phase === 'datta_integrating' ? 'Integrating...' : 'Standing by'}
          </p>
        </div>
      </div>
    </div>
  )
}
