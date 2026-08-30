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

export type AgentOfficeState =
  | 'idle'           // Sleeping in dorm
  | 'walking'        // Moving between rooms
  | 'meeting'        // In Datta's meeting room
  | 'at_desk'        // In their cabin, at desk
  | 'working'        // Actively working (coding, researching, etc.)
  | 'reporting'      // Walking to Datta to report results
  | 'completed'      // Task done, heading to dorm
  | 'sleeping'       // In dorm, idle
  | 'error'          // Encountered an error
  | 'arriving'       // Postman entering / new project

export type OfficeRoom =
  | 'reception'      // Postman entrance + mailbox
  | 'aira_cabin'     // AIRA's cabin (top center)
  | 'datta_cabin'    // Datta's cabin (center)
  | 'meeting_room'   // Meeting room (center top)
  | 'mercury_cabin'
  | 'mars_cabin'
  | 'venus_cabin'
  | 'earth_cabin'
  | 'jupiter_cabin'
  | 'saturn_cabin'
  | 'neptune_cabin'
  | 'uranus_cabin'
  | 'pluto_cabin'
  | 'dormitory'      // Where idle agents sleep
  | 'hallway'        // Walking between rooms
  | 'integration'    // Integration workspace
  | 'live_preview'   // Live preview area

export type OfficeEvent = {
  id: string
  timestamp: string
  agent: AgentId
  event_type:
    | 'project_arrived'
    | 'aira_received'
    | 'aira_to_datta'
    | 'meeting_called'
    | 'agent_entered_meeting'
    | 'project_explained'
    | 'tasks_assigned'
    | 'agent_returned_to_cabin'
    | 'agent_started_work'
    | 'agent_working'
    | 'agent_completed'
    | 'agent_reporting'
    | 'agent_reported'
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
  | 'aira_analyzing'
  | 'datta_planning'
  | 'meeting_in_progress'
  | 'task_distribution'
  | 'agents_working'
  | 'reporting'
  | 'datta_integrating'
  | 'aira_validating'
  | 'iteration'
  | 'completed'

export interface AgentLocation {
  agent: AgentId
  room: OfficeRoom
  state: AgentOfficeState
  currentTask?: string
  progress?: number
  lastMessage?: string
  lastQuip?: string
  x?: number  // Pixel position for animation
  y?: number
}

export interface OfficeState {
  phase: WorkflowPhase
  agents: Record<AgentId, AgentLocation>
  events: OfficeEvent[]
  projectId: string | null
  projectIdea: string
  mailboxStatus: 'empty' | 'new_project' | 'processing'
}
