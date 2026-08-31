'use client'

import { create } from 'zustand'
import type {
  AgentId, AgentOfficeState, AgentLocation, OfficeRoom,
  OfficeEvent, WorkflowPhase, OfficeState,
} from '@/types/office'
import type { StreamEvent } from '@/types'
import { EMPLOYEE_IDS } from '@/components/office/roster'
import {
  getTravelPath, getWorldPos, interpolatePath, getCabinPos,
  type TravelPath, type Waypoint,
} from '@/lib/paths'

// ─── All agent IDs ────────────────────────────────────────────────────────────
const ALL_AGENTS: AgentId[] = ['postman', 'aira', 'datta', ...EMPLOYEE_IDS]

const DEFAULT_LOCATIONS: Record<AgentId, { room: OfficeRoom; state: AgentOfficeState }> = {
  postman:  { room: 'reception',  state: 'idle' },
  aira:     { room: 'aira_villa', state: 'idle' },
  datta:    { room: 'datta_mansion', state: 'idle' },
  mercury:  { room: 'dormitory', state: 'sleeping' },
  mars:     { room: 'dormitory', state: 'sleeping' },
  venus:    { room: 'dormitory', state: 'sleeping' },
  earth:    { room: 'dormitory', state: 'sleeping' },
  jupiter:  { room: 'dormitory', state: 'sleeping' },
  saturn:   { room: 'dormitory', state: 'sleeping' },
  neptune:  { room: 'dormitory', state: 'sleeping' },
  uranus:   { room: 'dormitory', state: 'sleeping' },
  pluto:    { room: 'dormitory', state: 'sleeping' },
  ceres:    { room: 'dormitory', state: 'sleeping' },
}

function createDefaultAgents(): Record<AgentId, AgentLocation> {
  const agents: Record<string, AgentLocation> = {}
  for (const [id, loc] of Object.entries(DEFAULT_LOCATIONS)) {
    agents[id] = {
      agent: id as AgentId, room: loc.room, state: loc.state, progress: 0,
      x: getWorldPos(id as AgentId, loc.room).x,
      y: getWorldPos(id as AgentId, loc.room).y,
    }
  }
  return agents as Record<AgentId, AgentLocation>
}

let eventCounter = 0
function makeEvent(
  agent: AgentId, event_type: OfficeEvent['event_type'], message: string, extra?: Partial<OfficeEvent>,
): OfficeEvent {
  return {
    id: `evt-${Date.now()}-${eventCounter++}`,
    timestamp: new Date().toISOString(),
    agent: agent as AgentId,
    event_type,
    message,
    ...extra,
  }
}

const PLANET_TO_AGENT: Record<string, AgentId> = {
  mercury: 'mercury', mars: 'mars', venus: 'venus', earth: 'earth',
  neptune: 'neptune', pluto: 'pluto',
  jupiter: 'jupiter', saturn: 'saturn', uranus: 'uranus', ceres: 'ceres',
}

const PLANET_TO_ROOM: Record<string, OfficeRoom> = {
  mercury: 'mercury_cabin', mars: 'mars_cabin', venus: 'venus_cabin',
  earth: 'earth_cabin', jupiter: 'jupiter_cabin', saturn: 'saturn_cabin',
  neptune: 'neptune_cabin', uranus: 'uranus_cabin', pluto: 'pluto_cabin', ceres: 'ceres_cabin',
}

const ROSTER_DISPLAY: Record<string, string> = {
  mercury: 'Mira', mars: 'Ari', venus: 'Vanya', earth: 'Ethan', jupiter: 'Jaya',
  saturn: 'Sam', neptune: 'Nia', uranus: 'Uma', pluto: 'Prakash', ceres: 'Celia',
  aira: 'Aira', datta: 'Datta', postman: 'Ravi',
}

function displayName(aid: AgentId): string {
  return ROSTER_DISPLAY[aid] || aid
}

// Transport selection for each role
const TRANSPORT: Record<AgentId, 'walking' | 'bicycle' | 'car' | 'helicopter'> = {
  postman: 'bicycle',
  aira: 'helicopter',
  datta: 'car',
  // employees default to bicycle
  mercury: 'bicycle', mars: 'bicycle', venus: 'bicycle', earth: 'bicycle', jupiter: 'bicycle',
  saturn: 'bicycle', neptune: 'bicycle', uranus: 'bicycle', pluto: 'bicycle', ceres: 'bicycle',
}

// How fast an agent moves (motionProgress increment per tick)
const SPEED: Record<AgentId, number> = {
  postman: 0.0045,
  aira: 0.01,
  datta: 0.006,
  mercury: 0.008, mars: 0.008, venus: 0.008, earth: 0.008, jupiter: 0.008,
  saturn: 0.008, neptune: 0.008, uranus: 0.008, pluto: 0.008, ceres: 0.008,
}

interface Motion {
  path: TravelPath
  progress: number        // current 0..1
  speed: number
  onArrive: (agentId: AgentId) => void
  transport: 'walking' | 'bicycle' | 'car' | 'helicopter'
}

interface OfficeStore extends OfficeState {
  setPhase: (phase: WorkflowPhase) => void
  setProject: (id: string, idea: string) => void
  addEvent: (event: OfficeEvent) => void
  setMailbox: (status: OfficeState['mailboxStatus']) => void
  reset: () => void
  processStreamEvent: (event: StreamEvent) => void
  processEvents: (events: StreamEvent[]) => void
  runDemo: () => void

  // Motion system
  startMotion: (agentId: AgentId, to: OfficeRoom, transport: 'walking' | 'bicycle' | 'car' | 'helicopter', onArrive: (id: AgentId) => void) => void
  tick: (dt: number) => void
  // Interrupt a motion immediately (used by tests/backend override)
  teleportTo: (agentId: AgentId, room: OfficeRoom, state: AgentOfficeState) => void
}

export const useOfficeStore = create<OfficeStore>((set, get) => {
  // Motion registry kept outside reactive state to avoid re-render spam
  const motions: Partial<Record<AgentId, Motion>> = {}

  return {
    phase: 'idle',
    agents: createDefaultAgents(),
    events: [],
    projectId: null,
    projectIdea: '',
    mailboxStatus: 'empty',

    setPhase: (phase) => set({ phase }),

    setProject: (id, idea) => set({ projectId: id, projectIdea: idea, phase: 'project_arriving', mailboxStatus: 'new_project' }),

    addEvent: (event) => set((s) => ({ events: [...s.events.slice(-400), event] })),

    setMailbox: (status) => set({ mailboxStatus: status }),

    reset: () => {
      Object.keys(motions).forEach(k => delete motions[k as AgentId])
      set({
        phase: 'idle', agents: createDefaultAgents(), events: [],
        projectId: null, projectIdea: '', mailboxStatus: 'empty',
      })
    },

    teleportTo: (agentId, room, state) => {
      delete motions[agentId]
      const p = getWorldPos(agentId, room)
      set((s) => ({
        agents: {
          ...s.agents,
          [agentId]: { ...s.agents[agentId], room, state, x: p.x, y: p.y, motionPath: undefined, motionProgress: undefined },
        },
      }))
    },

    // ─── Start a motion: set state to travelling, record path ───
    startMotion: (agentId, to, transport, onArrive) => {
      const s = get()
      const fromRoom = s.agents[agentId]?.room || 'dormitory'
      const path = getTravelPath(agentId, fromRoom, to)

      motions[agentId] = {
        path,
        progress: 0,
        speed: SPEED[agentId],
        transport,
        onArrive,
      }

      // Set initial position to start of path
      const start = interpolatePath(path, 0)
      set((s) => ({
        agents: {
          ...s.agents,
          [agentId]: {
            ...s.agents[agentId],
            state: 'travelling',
            room: 'road' as OfficeRoom,
            x: start.x, y: start.y,
            motionPath: path,
            motionProgress: 0,
            transport,
          },
        },
      }))
    },

    // ─── Advance all motions ───
    tick: (dt) => {
      const ids = Object.keys(motions) as AgentId[]
      if (ids.length === 0) return

      const updates: Partial<Record<AgentId, AgentLocation>> = {}
      let phaseChanged = false

      for (const aid of ids) {
        const m = motions[aid]
        if (!m) continue

        m.progress = Math.min(1, m.progress + m.speed * dt)

        const pos = interpolatePath(m.path, m.progress)

        updates[aid] = {
          ...get().agents[aid],
          x: pos.x, y: pos.y,
          motionProgress: m.progress,
          transport: m.transport,
        }

        // Arrived
        if (m.progress >= 1) {
          delete motions[aid]
          m.onArrive(aid)
        }
      }

      if (Object.keys(updates).length > 0) {
        set((s) => {
          const newAgents = { ...s.agents }
          for (const [id, upd] of Object.entries(updates)) {
            if (upd) newAgents[id as AgentId] = upd
          }
          return { agents: newAgents }
        })
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // REAL BACKEND EVENT DRIVER — the backend is the source of truth.
    // ═══════════════════════════════════════════════════════════════════════════════
    processStreamEvent: (event) => {
      const s = get()
      const { planet, message, event: eventType, planet_statuses, quip } = event

      // ── 1. PROJECT STARTED — Postman physically delivers to mailbox ──
      if (eventType === 'started' && planet === 'aira') {
        set({ phase: 'project_arriving', mailboxStatus: 'new_project' })
        s.addEvent(makeEvent('aira', 'project_arrived', `📬 New project received: ${message || 'user idea'}`))
        // Postman rides in
        s.startMotion('postman', 'reception', 'bicycle', (id) => {
          const pos = getWorldPos(id, 'reception')
          set((s) => ({
            mailboxStatus: 'new_project',
            agents: { ...s.agents, [id]: { ...s.agents[id], room: 'reception', state: 'arriving', x: pos.x, y: pos.y } },
          }))
          s.addEvent(makeEvent(id, 'project_arrived', '📮 Postman delivered the project into the mailbox — NEW PROJECT RECEIVED'))
          setTimeout(() => s.teleportTo(id, 'reception', 'idle'), 1200)
        })
        // AIRA flies in by helicopter (parallel)
        setTimeout(() => {
          s.startMotion('aira', 'aira_cabin', 'helicopter', (id) => {
            const pos = getCabinPos(id)
            set((s) => ({
              phase: 'aira_analyzing',
              agents: { ...s.agents, [id]: { ...s.agents[id], room: 'aira_cabin', state: 'working', x: pos.x, y: pos.y } },
            }))
            s.addEvent(makeEvent(id, 'aira_received', '☀️ AIRA received the project — analyzing requirements'))
          })
          s.setPhase('aira_travelling')
          s.addEvent(makeEvent('aira', 'aira_travelling', '🚁 AIRA boarding her private helicopter from the villa'))
        }, 1600)
        return
      }

      // ── 2. PLAN CREATED — AIRA calls Datta; Datta drives by car ──
      if (eventType === 'plan_created') {
        set({ phase: 'datta_planning' })
        s.addEvent(makeEvent('aira', 'aira_to_datta', `📞 AIRA calls Datta: ${message || 'report to my cabin'}`))
        s.startMotion('datta', 'datta_cabin', 'car', (id) => {
          const pos = getCabinPos(id)
          set((s) => ({
            agents: { ...s.agents, [id]: { ...s.agents[id], room: 'datta_cabin', state: 'working', x: pos.x, y: pos.y } },
          }))
          s.addEvent(makeEvent(id, 'datta_arrived', '💼 Datta arrived — planning the project'))
          // Datta calls the team
          setTimeout(() => {
            set({ phase: 'meeting_in_progress' })
            s.addEvent(makeEvent(id, 'meeting_called', '🏢 Datta called a full team meeting!'))
            EMPLOYEE_IDS.forEach((aid, i) => {
              setTimeout(() => {
                s.addEvent(makeEvent(aid, 'agent_waking', `⏰ ${displayName(aid)} woke up`))
                s.startMotion(aid, 'meeting_room', 'bicycle', (aid2) => {
                  const pos = getWorldPos(aid2, 'meeting_room')
                  set((s) => ({
                    agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: 'meeting_room', state: 'meeting', x: pos.x, y: pos.y } },
                  }))
                  s.addEvent(makeEvent(aid2, 'agent_travelling', `🚴 ${displayName(aid2)} arrived at the meeting`))
                })
              }, (i + 1) * 400)
            })
          }, 1300)
        })
        s.setPhase('datta_travelling')
        s.addEvent(makeEvent('datta', 'datta_travelling', '🚗 Datta driving to the office by car'))
        return
      }

      // ── 3. TASK ASSIGNMENTS / STATUS CHANGES — real estate from backend ──
      if (planet_statuses) {
        for (const [p, status] of Object.entries(planet_statuses)) {
          const aid = PLANET_TO_AGENT[p]
          if (!aid) continue
          const room = PLANET_TO_ROOM[p]

          if (status === 'active') {
            // Employee walks from meeting/wherever to their cabin and works
            if (s.agents[aid]?.state !== 'working' && room) {
              s.startMotion(aid, room, 'bicycle', (aid2) => {
                const pos = getCabinPos(aid2)
                const task = message && p === planet ? message : 'Working on assigned task'
                set((s) => ({
                  agents: {
                    ...s.agents,
                    [aid2]: { ...s.agents[aid2], room, state: 'working', x: pos.x, y: pos.y, currentTask: task, progress: 15 },
                  },
                }))
                s.addEvent(makeEvent(aid2, 'agent_started_work', `${displayName(aid2)} (${p.toUpperCase()}) started working: ${task}`))
              })
            }
          } else if (status === 'completed') {
            // Employee reports to Datta
            s.addEvent(makeEvent(aid, 'agent_completed', `${displayName(aid)} (${p.toUpperCase()}) completed, reporting to Datta`))
            s.startMotion(aid, 'datta_cabin', 'walking', (aid2) => {
              const pos = getWorldPos(aid2, 'datta_cabin')
              set((s) => ({
                agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: 'datta_cabin', state: 'reporting', x: pos.x, y: pos.y, progress: 100 } },
              }))
              s.addEvent(makeEvent(aid2, 'agent_reporting', `${displayName(aid2)} reported to Datta ✓`))
              // After reporting, return home to dorm
              setTimeout(() => {
                s.startMotion(aid2, 'dormitory', 'bicycle', (aid3) => {
                  const pos = getWorldPos(aid3, 'dormitory')
                  set((s) => ({
                    agents: { ...s.agents, [aid3]: { ...s.agents[aid3], room: 'dormitory', state: 'sleeping', x: pos.x, y: pos.y } },
                  }))
                  s.addEvent(makeEvent(aid3, 'agent_sleeping', `💤 ${displayName(aid3)} sleeping in the dorm`))
                })
                s.addEvent(makeEvent(aid2, 'agent_returning_home', `🚴 ${displayName(aid2)} riding home to the dorm`))
              }, 1800)
            })
          } else if (status === 'error') {
            if (room) s.teleportTo(aid, room, 'error')
            s.addEvent(makeEvent(aid, 'error', `⚠️ ${displayName(aid)} (${p.toUpperCase()}) error: ${message || ''}`))
          }
        }
      }

      // ── 4. PROGRESS STREAMING ──
      if (planet && planet !== 'aira') {
        const aid = PLANET_TO_AGENT[planet]
        if (aid) {
          const active = s.agents[aid]?.state === 'working' || s.agents[aid]?.state === 'at_desk'
          if (active) {
            set((s) => ({
              agents: {
                ...s.agents,
                [aid]: {
                  ...s.agents[aid], state: 'working',
                  currentTask: message || s.agents[aid].currentTask || 'Working',
                  lastMessage: message, lastQuip: quip,
                },
              },
            }))
          }
        }
      }

      // ── 5. COMPLETED — AIRA validates, Datta integrates, everyone goes home ──
      if (eventType === 'completed') {
        set({ phase: 'completed', mailboxStatus: 'empty' })
        s.addEvent(makeEvent('aira', 'validation_complete', '✅ AIRA validation complete — project approved!'))
        // Everyone returns home
        setTimeout(() => {
          EMPLOYEE_IDS.forEach((aid, i) => {
            setTimeout(() => {
              s.startMotion(aid, 'dormitory', 'bicycle', (aid2) => {
                set((s) => ({
                  agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: 'dormitory', state: 'sleeping' } },
                }))
              })
            }, i * 200)
          })
          setTimeout(() => {
            s.startMotion('datta', 'datta_mansion', 'car', (id) => {
              set((s) => ({
                agents: { ...s.agents, [id]: { ...s.agents[id], room: 'datta_mansion', state: 'idle' } },
              }))
            })
            s.startMotion('aira', 'aira_villa', 'helicopter', (id) => {
              set((s) => ({
                agents: { ...s.agents, [id]: { ...s.agents[id], room: 'aira_villa', state: 'idle' } },
              }))
            })
          }, 2200)
        }, 1000)
        return
      }

      if (eventType === 'error') {
        s.addEvent(makeEvent('aira', 'error', `⚠️ ${message || 'Pipeline error'}`))
      }
    },

    processEvents: (events) => {
      events.forEach((event) => get().processStreamEvent(event))
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // DEMO MODE — clearly labelled fallback for guests. Same choreography, driven by
    // the same motion engine (not random animation).
    // ═══════════════════════════════════════════════════════════════════════════════
    runDemo: () => {
      const s = get()
      s.reset()
      set({ projectId: 'demo', projectIdea: 'Smart Inventory Management System', phase: 'project_arriving', mailboxStatus: 'new_project' })
      s.addEvent(makeEvent('aira', 'project_arrived', '📬 (Demo) New project received: Smart Inventory Management System'))

      // Postman delivers
      setTimeout(() => {
        s.startMotion('postman', 'reception', 'bicycle', (id) => {
          set((s) => ({ mailboxStatus: 'new_project', agents: { ...s.agents, [id]: { ...s.agents[id], room: 'reception', state: 'idle' } } }))
          s.addEvent(makeEvent(id, 'project_arrived', '📮 (Demo) Postman delivered the project!'))
        })
      }, 400)

      // AIRA flies in
      setTimeout(() => {
        s.setPhase('aira_travelling')
        s.addEvent(makeEvent('aira', 'aira_travelling', '🚁 AIRA travelling by helicopter'))
        s.startMotion('aira', 'aira_cabin', 'helicopter', (id) => {
          set((s) => ({ phase: 'aira_analyzing', agents: { ...s.agents, [id]: { ...s.agents[id], room: 'aira_cabin', state: 'working' } } }))
        })
      }, 2000)

      // Datta drives in and calls meeting
      setTimeout(() => {
        s.setPhase('datta_travelling')
        s.addEvent(makeEvent('datta', 'datta_travelling', '🚗 Datta driving to office'))
        s.startMotion('datta', 'datta_cabin', 'car', () => {
          set({ phase: 'meeting_in_progress' })
          s.addEvent(makeEvent('datta', 'meeting_called', '🏢 Datta called a team meeting!'))
          EMPLOYEE_IDS.forEach((aid, i) => {
            setTimeout(() => {
              s.startMotion(aid, 'meeting_room', 'bicycle', (aid2) => {
                set((s) => ({ agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: 'meeting_room', state: 'meeting' } } }))
              })
            }, (i + 1) * 400)
          })
        })
      }, 5000)

      // Tasks assigned; employees return to cabins and work
      setTimeout(() => {
        set({ phase: 'agents_working' })
        s.addEvent(makeEvent('datta', 'tasks_assigned', '📋 Tasks assigned to all employees'))
        const taskMap: Record<string, string> = {
          mercury: 'Researching market & technologies', mars: 'Designing system architecture',
          venus: 'Creating UI/UX designs', earth: 'Building the application',
          jupiter: 'Designing database schema', saturn: 'Building AI/ML component',
          neptune: 'Running tests & QA', uranus: 'Security review',
          pluto: 'Deployment configuration', ceres: 'Writing documentation',
        }
        EMPLOYEE_IDS.forEach((aid, i) => {
          setTimeout(() => {
            s.startMotion(aid, PLANET_TO_ROOM[aid], 'bicycle', (aid2) => {
              set((s) => ({
                agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: PLANET_TO_ROOM[aid], state: 'working', currentTask: taskMap[aid2], progress: 20 + i * 6 } },
              }))
              s.addEvent(makeEvent(aid2, 'agent_started_work', `${displayName(aid2)} started: ${taskMap[aid2]}`))
            })
          }, (i + 1) * 500)
        })
      }, 14000)

      // Report, return home, integrate, validate, complete
      EMPLOYEE_IDS.forEach((aid, i) => {
        setTimeout(() => {
          s.startMotion(aid, 'datta_cabin', 'walking', (aid2) => {
            set((s) => ({ agents: { ...s.agents, [aid2]: { ...s.agents[aid2], room: 'datta_cabin', state: 'reporting', progress: 100 } } }))
            setTimeout(() => {
              s.startMotion(aid2, 'dormitory', 'bicycle', (aid3) => {
                set((s) => ({ agents: { ...s.agents, [aid3]: { ...s.agents[aid3], room: 'dormitory', state: 'sleeping' } } }))
                s.addEvent(makeEvent(aid3, 'agent_sleeping', `💤 ${displayName(aid3)} resting in dorm`))
              })
            }, 1600)
          })
        }, 19000 + i * 1200)
      })

      setTimeout(() => {
        s.setPhase('datta_integrating')
        s.addEvent(makeEvent('datta', 'datta_integrating', '🔗 Datta integrating all components...'))
      }, 34000)

      setTimeout(() => {
        s.setPhase('aira_validating')
        s.addEvent(makeEvent('aira', 'aira_validating', '☀️ AIRA performing final validation...'))
      }, 38000)

      setTimeout(() => {
        set({ phase: 'completed' })
        s.addEvent(makeEvent('aira', 'validation_complete', '✅ (Demo) Project validation complete!'))
      }, 42000)
    },
  }
})

// ─── Global motion clock — advances all characters every frame (UI tick) ───
let clockRunning = false
export function ensureMotionClock() {
  if (clockRunning) return
  clockRunning = true
  let last = Date.now()
  const step = () => {
    const now = Date.now()
    const dt = (now - last) / 1000
    last = now
    useOfficeStore.getState().tick(dt)
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
