'use client'

import { create } from 'zustand'
import type {
  AgentId, AgentOfficeState, AgentLocation, OfficeRoom,
  OfficeEvent, WorkflowPhase, OfficeState,
} from '@/types/office'
import type { StreamEvent } from '@/types'

// ─── Default locations for each agent ─────────────────────────────────────────
const DEFAULT_LOCATIONS: Record<AgentId, { room: OfficeRoom; state: AgentOfficeState }> = {
  postman:  { room: 'reception', state: 'idle' },
  aira:     { room: 'aira_cabin', state: 'sleeping' },
  datta:    { room: 'datta_cabin', state: 'sleeping' },
  mercury:  { room: 'dormitory', state: 'sleeping' },
  mars:     { room: 'dormitory', state: 'sleeping' },
  venus:    { room: 'dormitory', state: 'sleeping' },
  earth:    { room: 'dormitory', state: 'sleeping' },
  neptune:  { room: 'dormitory', state: 'sleeping' },
  pluto:    { room: 'dormitory', state: 'sleeping' },
}

function createDefaultAgents(): Record<AgentId, AgentLocation> {
  const agents: Record<string, AgentLocation> = {}
  for (const [id, loc] of Object.entries(DEFAULT_LOCATIONS)) {
    agents[id] = {
      agent: id as AgentId,
      room: loc.room,
      state: loc.state,
      progress: 0,
    }
  }
  return agents as Record<AgentId, AgentLocation>
}

let eventCounter = 0
function makeEvent(
  agent: AgentId,
  event_type: OfficeEvent['event_type'],
  message: string,
  extra?: Partial<OfficeEvent>,
): OfficeEvent {
  return {
    id: `evt-${Date.now()}-${eventCounter++}`,
    timestamp: new Date().toISOString(),
    agent,
    event_type,
    message,
    ...extra,
  }
}

// ─── Map planet IDs to agent IDs ──────────────────────────────────────────────
const PLANET_TO_AGENT: Record<string, AgentId> = {
  mercury: 'mercury',
  mars: 'mars',
  venus: 'venus',
  earth: 'earth',
  neptune: 'neptune',
  pluto: 'pluto',
  jupiter: 'mercury',  // Map extra planets to closest role
  saturn: 'mercury',
  uranus: 'mercury',
}

// ─── Map planet to cabin room ─────────────────────────────────────────────────
const PLANET_TO_ROOM: Record<string, OfficeRoom> = {
  mercury: 'mercury_cabin',
  mars: 'mars_cabin',
  venus: 'venus_cabin',
  earth: 'earth_cabin',
  neptune: 'neptune_cabin',
  pluto: 'pluto_cabin',
}

const ALL_PLANET_AGENTS: AgentId[] = ['mercury', 'mars', 'venus', 'earth', 'neptune', 'pluto']

interface OfficeStore extends OfficeState {
  // Actions
  setPhase: (phase: WorkflowPhase) => void
  setProject: (id: string, idea: string) => void
  moveAgent: (agent: AgentId, room: OfficeRoom, state: AgentOfficeState) => void
  setAgentState: (agent: AgentId, state: AgentOfficeState) => void
  setAgentWork: (agent: AgentId, task: string, progress?: number, message?: string, quip?: string) => void
  addEvent: (event: OfficeEvent) => void
  setMailbox: (status: OfficeState['mailboxStatus']) => void
  reset: () => void

  // Process a backend SSE stream event into office state
  processStreamEvent: (event: StreamEvent) => void
  // Process a batch of events (for replay)
  processEvents: (events: StreamEvent[]) => void
}

export const useOfficeStore = create<OfficeStore>((set, get) => ({
  phase: 'idle',
  agents: createDefaultAgents(),
  events: [],
  projectId: null,
  projectIdea: '',
  mailboxStatus: 'empty',

  setPhase: (phase) => set({ phase }),

  setProject: (id, idea) => set({
    projectId: id,
    projectIdea: idea,
    phase: 'project_arriving',
    mailboxStatus: 'new_project',
  }),

  moveAgent: (agent, room, state) => set((s) => ({
    agents: {
      ...s.agents,
      [agent]: { ...s.agents[agent], room, state },
    },
  })),

  setAgentState: (agent, state) => set((s) => ({
    agents: {
      ...s.agents,
      [agent]: { ...s.agents[agent], state },
    },
  })),

  setAgentWork: (agent, task, progress, message, quip) => set((s) => ({
    agents: {
      ...s.agents,
      [agent]: {
        ...s.agents[agent],
        currentTask: task,
        progress: progress ?? s.agents[agent].progress,
        lastMessage: message ?? s.agents[agent].lastMessage,
        lastQuip: quip ?? s.agents[agent].lastQuip,
      },
    },
  })),

  addEvent: (event) => set((s) => ({
    events: [...s.events.slice(-200), event],
  })),

  setMailbox: (status) => set({ mailboxStatus: status }),

  reset: () => set({
    phase: 'idle',
    agents: createDefaultAgents(),
    events: [],
    projectId: null,
    projectIdea: '',
    mailboxStatus: 'empty',
  }),

  // ─── Process a single SSE stream event ────────────────────────────────────
  processStreamEvent: (event) => {
    const s = get()
    const { planet, message, event: eventType, planet_statuses, quip } = event

    // ── Pipeline started: Postman delivers project ──
    if (eventType === 'started' && planet === 'aira') {
      set({ phase: 'project_arriving', mailboxStatus: 'new_project' })
      s.moveAgent('postman', 'reception', 'arriving')
      s.addEvent(makeEvent('postman', 'project_arrived', '📮 New project received at mailbox!'))

      setTimeout(() => {
        s.moveAgent('aira', 'aira_cabin', 'working')
        s.addEvent(makeEvent('aira', 'aira_received', '☀️ AIRA received the project from Postman'))
        set({ phase: 'aira_analyzing', mailboxStatus: 'processing' })
      }, 1500)
      return
    }

    // ── Plan created: AIRA sends to Datta → Meeting time ──
    if (eventType === 'plan_created') {
      set({ phase: 'datta_planning' })
      s.moveAgent('aira', 'aira_cabin', 'working')
      s.moveAgent('datta', 'datta_cabin', 'working')
      s.addEvent(makeEvent('datta', 'aira_to_datta', '👨‍💼 Datta received the project from AIRA'))

      setTimeout(() => {
        set({ phase: 'meeting_in_progress' })
        s.moveAgent('datta', 'meeting_room', 'meeting')
        s.addEvent(makeEvent('datta', 'meeting_called', '🏢 Datta called a team meeting!'))

        // Wake all planet agents and walk them to meeting room
        ALL_PLANET_AGENTS.forEach((aid, i) => {
          setTimeout(() => {
            s.moveAgent(aid, 'hallway', 'walking')
            s.addEvent(makeEvent(aid, 'agent_entered_meeting', `${AGENT_META_NAMES[aid]} left cabin and headed to meeting`))
            setTimeout(() => {
              s.moveAgent(aid, 'meeting_room', 'meeting')
            }, 400)
          }, i * 250)
        })
      }, 2000)
      return
    }

    // ── Planet completed or all statuses update ──
    if (eventType === 'planet_completed' || eventType === 'completed') {
      const agentId = PLANET_TO_AGENT[planet || ''] || planet as AgentId

      // Update all planet statuses
      if (planet_statuses) {
        for (const [p, status] of Object.entries(planet_statuses)) {
          const aid = PLANET_TO_AGENT[p]
          if (!aid) continue

          if (status === 'active') {
            const room = PLANET_TO_ROOM[p]
            if (room) {
              s.moveAgent(aid, room, 'working')
              s.addEvent(makeEvent(aid, 'agent_started_work',
                `${AGENT_META_NAMES[aid] || p} started working in ${AGENT_META_NAMES[aid] || p} cabin`))
            }
          } else if (status === 'completed') {
            // Report to Datta then go to dorm
            s.moveAgent(aid, 'datta_cabin', 'reporting')
            s.addEvent(makeEvent(aid, 'agent_reporting',
              `${AGENT_META_NAMES[aid] || p} completed work, reporting to Datta`))
            setTimeout(() => {
              s.moveAgent(aid, 'dormitory', 'sleeping')
              s.addEvent(makeEvent(aid, 'agent_sleeping',
                `${AGENT_META_NAMES[aid] || p} resting in dormitory 💤`))
            }, 2000)
          }
        }
      }

      if (eventType === 'completed' && planet === 'aira') {
        // Final validation complete
        set({ phase: 'completed' })
        s.moveAgent('aira', 'aira_cabin', 'completed')
        s.moveAgent('datta', 'datta_cabin', 'completed')
        s.addEvent(makeEvent('aira', 'validation_complete', '✅ Project validation complete — Mission accomplished!'))
      }
      return
    }

    // ── Default: update agent work info ──
    if (planet && planet !== 'aira') {
      const agentId = PLANET_TO_AGENT[planet]
      if (agentId) {
        s.setAgentWork(agentId, message || '', undefined, message, quip || undefined)
      }
    }
  },

  processEvents: (events) => {
    events.forEach((event) => {
      get().processStreamEvent(event)
    })
  },
}))

// ─── Agent display names for events ──────────────────────────────────────────
const AGENT_META_NAMES: Record<string, string> = {
  mercury: '☿ Mercury',
  mars: '♂ Mars',
  venus: '♀ Venus',
  earth: '🌍 Earth',
  neptune: '♆ Neptune',
  pluto: '🪐 Pluto',
  aira: '☀️ AIRA',
  datta: '👨‍💼 Datta',
}
