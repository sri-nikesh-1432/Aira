import type { AgentId } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD WAYPOINTS — every physical location in the company world.
// Characters move between these points along roads/paths.
// ═══════════════════════════════════════════════════════════════════════════════

export const WP = {
  // Buildings
  dormDoor:       { x: 160, y: 540 },
  mailBox:        { x: 560, y: 540 },
  officeEntrance: { x: 820, y: 540 },
  heliLanding:    { x: 1380, y: 180 },
  villaDoor:      { x: 1280, y: 220 },
  mansionDoor:    { x: 1280, y: 920 },

  // Office interior positions
  reception:    { x: 820, y: 440 },
  meetingRoom:  { x: 1120, y: 440 },
  hallway:      { x: 900, y: 500 },
  integration:  { x: 1080, y: 740 },
  livePreview:  { x: 1080, y: 860 },

  // Executive cabins
  airaCabin:     { x: 940, y: 260 },
  dattaCabin:    { x: 1140, y: 260 },

  // Employee cabin positions (center of each cabin)
  mercury_cabin:  { x: 900, y: 350 },
  mars_cabin:     { x: 1060, y: 350 },
  venus_cabin:    { x: 900, y: 440 },
  earth_cabin:    { x: 1060, y: 440 },
  jupiter_cabin:  { x: 900, y: 530 },
  saturn_cabin:   { x: 1060, y: 530 },
  uranus_cabin:   { x: 900, y: 620 },
  neptune_cabin:  { x: 1060, y: 620 },
  pluto_cabin:    { x: 900, y: 710 },
  ceres_cabin:    { x: 1060, y: 710 },

  // Helipad (where helicopter sits)
  helipad: { x: 1380, y: 180 },

  // Bicycle parking
  bikeParking: { x: 820, y: 580 },
} as const

export type Waypoint = { x: number; y: number }

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD POSITION — maps rooms/states to a position in the world.
// ═══════════════════════════════════════════════════════════════════════════════

export function getWorldPos(agentId: AgentId, room: string): Waypoint {
  if (room in WP) return WP[room as keyof typeof WP]
  // Fallback: map known room names
  const rm = room as keyof typeof WP
  if (rm in WP) return WP[rm]
  return WP.hallway
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAVEL PATHS — predefined paths characters follow.
// Each path is an array of {x,y} waypoints the character moves through.
// ═══════════════════════════════════════════════════════════════════════════════

export type TravelPath = Waypoint[]

// Postman: mailRoom → road → mailbox → reception
export const PATH_POSTMAN_DELIVER: TravelPath = [
  { x: 300, y: 540 },
  { x: 430, y: 540 },
  { x: 560, y: 540 },
  { x: 700, y: 540 },
  { x: 820, y: 540 },
  { x: 820, y: 480 },
]

// AIRA: villa → helipad → helicopter flies → helipad → office
export const PATH_AIRA_TO_OFFICE: TravelPath = [
  WP.villaDoor,
  WP.heliLanding,
  WP.heliLanding,
  { x: 940, y: 300 },
  WP.airaCabin,
]

// Datta: mansion → road → office
export const PATH_DATTA_TO_OFFICE: TravelPath = [
  WP.mansionDoor,
  { x: 1100, y: 800 },
  { x: 900, y: 650 },
  { x: 820, y: 560 },
  WP.hallway,
  { x: 1140, y: 300 },
  WP.dattaCabin,
]

// Employees: dorm → road → office cabin (bicycle)
export const PATH_EMPLOYEE_TO_OFFICE: TravelPath = [
  WP.dormDoor,
  { x: 260, y: 560 },
  { x: 400, y: 560 },
  { x: 540, y: 560 },
  { x: 680, y: 560 },
  WP.officeEntrance,
  WP.bikeParking,
  WP.hallway,
]

// Employees return: cabin → hallway → bikeParking → road → dorm
export const PATH_EMPLOYEE_TO_HOME: TravelPath = [
  WP.hallway,
  WP.bikeParking,
  WP.officeEntrance,
  { x: 680, y: 560 },
  { x: 540, y: 560 },
  { x: 400, y: 560 },
  { x: 260, y: 560 },
  WP.dormDoor,
]

// Datta returns home
export const PATH_DATTA_TO_HOME: TravelPath = [
  WP.dattaCabin,
  { x: 1140, y: 300 },
  WP.hallway,
  WP.officeEntrance,
  { x: 820, y: 560 },
  { x: 900, y: 650 },
  { x: 1100, y: 800 },
  WP.mansionDoor,
]

// AIRA returns home
export const PATH_AIRA_TO_HOME: TravelPath = [
  WP.airaCabin,
  { x: 940, y: 300 },
  WP.heliLanding,
  WP.heliLanding,
  WP.villaDoor,
]

// Employee to meeting room (from cabin)
export const PATH_TO_MEETING: TravelPath = [
  WP.hallway,
  { x: 1000, y: 440 },
  WP.meetingRoom,
]

// Employee from meeting to their cabin
export const PATH_FROM_MEETING: TravelPath = [
  WP.meetingRoom,
  { x: 1000, y: 440 },
  WP.hallway,
]

// ═══════════════════════════════════════════════════════════════════════════════
// PATH RESOLVER — given an agent + from/to, return the correct path
// ═══════════════════════════════════════════════════════════════════════════════

export function getTravelPath(agentId: AgentId, from: string, to: string): TravelPath {
  // Postman
  if (agentId === 'postman') {
    if (to === 'reception' || to === 'road') return PATH_POSTMAN_DELIVER
    return PATH_EMPLOYEE_TO_HOME
  }

  // AIRA
  if (agentId === 'aira') {
    if (to === 'aira_cabin' || to === 'road') return PATH_AIRA_TO_OFFICE
    if (to === 'dormitory' || to === 'aira_villa') return PATH_AIRA_TO_HOME
    return PATH_AIRA_TO_OFFICE
  }

  // Datta
  if (agentId === 'datta') {
    if (to === 'datta_cabin' || to === 'road') return PATH_DATTA_TO_OFFICE
    if (to === 'dormitory' || to === 'datta_mansion') return PATH_DATTA_TO_HOME
    return PATH_DATTA_TO_OFFICE
  }

  // Employees
  if (to === 'road' || to.includes('_cabin')) return PATH_EMPLOYEE_TO_OFFICE
  if (to === 'dormitory') return PATH_EMPLOYEE_TO_HOME
  if (to === 'meeting_room') return PATH_TO_MEETING
  return PATH_EMPLOYEE_TO_OFFICE
}

// Get the end position for a cabin
export function getCabinPos(agentId: AgentId): Waypoint {
  const rm = `${agentId}_cabin` as keyof typeof WP
  if (rm in WP) return WP[rm]
  return WP.hallway
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERPOLATION — given progress 0-1 and a path, return interpolated {x,y}
// ═══════════════════════════════════════════════════════════════════════════════

export function interpolatePath(path: TravelPath, progress: number): Waypoint {
  if (path.length === 0) return { x: 0, y: 0 }
  if (path.length === 1) return path[0]

  const clampedProgress = Math.max(0, Math.min(1, progress))

  // Calculate total path length
  let totalLength = 0
  const segmentLengths: number[] = []
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x
    const dy = path[i].y - path[i - 1].y
    const len = Math.sqrt(dx * dx + dy * dy)
    segmentLengths.push(len)
    totalLength += len
  }

  if (totalLength === 0) return path[0]

  // Find the segment at this progress
  const targetDist = clampedProgress * totalLength
  let traveled = 0

  for (let i = 0; i < segmentLengths.length; i++) {
    if (traveled + segmentLengths[i] >= targetDist) {
      const segmentProgress = (targetDist - traveled) / segmentLengths[i]
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * segmentProgress,
        y: path[i].y + (path[i + 1].y - path[i].y) * segmentProgress,
      }
    }
    traveled += segmentLengths[i]
  }

  return path[path.length - 1]
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD DIMENSIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const WORLD_W = 1600
export const WORLD_H = 1080
