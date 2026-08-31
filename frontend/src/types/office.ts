// ═══════════════════════════════════════════════════════════════════════════════
// AIRA Virtual Office — Type Definitions
// ═══════════════════════════════════════════════════════════════════════════════

export type AgentId =
  | 'postman'
  | 'aira'
  | 'datta'
  | 'mercury'
  | 'mars'
  | 'venus'
  | 'earth'
  | 'jupiter'
  | 'saturn'
  | 'neptune'
  | 'uranus'
  | 'pluto'
  | 'ceres'

export type Gender = 'female' | 'male'

export type AgentOfficeState =
  | 'idle'           // Standing by
  | 'sleeping'       // In dorm, resting
  | 'waking'         // Getting out of bed
  | 'walking'        // Walking between rooms
  | 'travelling'     // On bicycle/car/helicopter
  | 'arriving'       // Entering building
  | 'meeting'        // In meeting room
  | 'at_desk'        // In their cabin, at desk
  | 'working'        // Actively working
  | 'waiting'        // Waiting for dependencies
  | 'blocked'        // Blocked by dependency
  | 'reporting'      // Walking to Datta to report results
  | 'completed'      // Task done
  | 'returning_home' // Leaving office, heading home
  | 'error'          // Encountered an error

export type OfficeRoom =
  | 'aira_villa'     // AIRA's private villa
  | 'datta_mansion'  // Datta's mansion
  | 'reception'      // Postman entrance + mailbox
  | 'aira_cabin'     // AIRA's cabin in office
  | 'datta_cabin'    // Datta's cabin in office
  | 'meeting_room'   // Meeting room
  | 'mercury_cabin'
  | 'mars_cabin'
  | 'venus_cabin'
  | 'earth_cabin'
  | 'jupiter_cabin'
  | 'saturn_cabin'
  | 'neptune_cabin'
  | 'uranus_cabin'
  | 'pluto_cabin'
  | 'ceres_cabin'
  | 'dormitory'      // Where idle agents sleep
  | 'hallway'        // Walking between rooms
  | 'road'           // On the road
  | 'bicycle_parking'// Bicycle parking area
  | 'integration'    // Integration workspace
  | 'live_preview'   // Live preview area
  | 'helipad'        // AIRA's helicopter pad

export type OfficeEvent = {
  id: string
  timestamp: string
  agent: AgentId
  event_type:
    | 'project_arrived'
    | 'aira_received'
    | 'aira_travelling'
    | 'aira_arrived'
    | 'aira_to_datta'
    | 'datta_travelling'
    | 'datta_arrived'
    | 'meeting_called'
    | 'agent_called'
    | 'agent_waking'
    | 'agent_travelling'
    | 'agent_entered_meeting'
    | 'project_explained'
    | 'tasks_assigned'
    | 'agent_returned_to_cabin'
    | 'agent_started_work'
    | 'agent_working'
    | 'agent_completed'
    | 'agent_reporting'
    | 'agent_reported'
    | 'agent_returning_home'
    | 'agent_to_dorm'
    | 'agent_sleeping'
    | 'agent_woken'
    | 'datta_integrating'
    | 'integration_complete'
    | 'aira_validating'
    | 'validation_complete'
    | 'error'
    | 'user_feedback'
  message: string
  from_room?: OfficeRoom
  to_room?: OfficeRoom
}

export type WorkflowPhase =
  | 'idle'
  | 'project_arriving'
  | 'aira_travelling'
  | 'aira_analyzing'
  | 'datta_travelling'
  | 'datta_planning'
  | 'meeting_in_progress'
  | 'task_distribution'
  | 'agents_travelling'
  | 'agents_working'
  | 'reporting'
  | 'datta_integrating'
  | 'aira_validating'
  | 'iteration'
  | 'completed'

// ─── Human employee visual identity ───────────────────────────────────────────
export interface HumanIdentity {
  id: AgentId
  name: string            // Human display name
  agentName: string       // Planet/agent name (MERCURY etc.)
  gender: Gender
  role: string            // Job title (Research Specialist, etc.)
  planet: string          // Planet identity
  planetColor: string     // Accent color for their badge/theme
  hairColor: string
  hairStyle: 'short' | 'long' | 'bun' | 'curly' | 'ponytail' | 'buzz' | 'bald' | 'wavy'
  skinTone: string
  shirtColor: string
  pantsColor: string
  accentColor: string     // tie/scarf detail
  personality: string
  dormBed: OfficeRoom
  bicycleColor: string
  specialNote: string
}

export interface AgentLocation {
  agent: AgentId
  room: OfficeRoom
  state: AgentOfficeState
  currentTask?: string
  progress?: number
  lastMessage?: string
  lastQuip?: string
  x?: number
  y?: number
  // Path-based movement
  motionPath?: { x: number; y: number }[]
  motionProgress?: number  // 0-1 along the path
  transport?: 'walking' | 'bicycle' | 'car' | 'helicopter'
}

export interface OfficeState {
  phase: WorkflowPhase
  agents: Record<AgentId, AgentLocation>
  events: OfficeEvent[]
  projectId: string | null
  projectIdea: string
  mailboxStatus: 'empty' | 'new_project' | 'processing'
}
