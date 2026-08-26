import { create } from 'zustand'
import type { Project, PlanetId, PlanetStatus, StreamEvent, PlanetMessage } from '@/types'

interface ProjectStore {
  // Active project
  activeProjectId: string | null
  projects: Record<string, Project>
  streamEvents: Record<string, StreamEvent[]>

  // UI state
  sidebarOpen: boolean
  activePlanet: PlanetId | null

  // Actions
  setActiveProject: (id: string | null) => void
  upsertProject: (project: Partial<Project> & { id: string }) => void
  addStreamEvent: (projectId: string, event: StreamEvent) => void
  updatePlanetStatus: (projectId: string, planet: PlanetId, status: PlanetStatus) => void
  addMessage: (projectId: string, message: PlanetMessage) => void
  setSidebarOpen: (open: boolean) => void
  setActivePlanet: (planet: PlanetId | null) => void
  getProject: (id: string) => Project | undefined
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  activeProjectId: null,
  projects: {},
  streamEvents: {},
  sidebarOpen: true,
  activePlanet: null,

  setActiveProject: (id) => set({ activeProjectId: id }),

  upsertProject: (project) =>
    set((state) => ({
      projects: {
        ...state.projects,
        [project.id]: {
          ...state.projects[project.id],
          ...project,
        } as Project,
      },
    })),

  addStreamEvent: (projectId, event) =>
    set((state) => ({
      streamEvents: {
        ...state.streamEvents,
        [projectId]: [...(state.streamEvents[projectId] || []), event],
      },
    })),

  updatePlanetStatus: (projectId, planet, status) =>
    set((state) => {
      const project = state.projects[projectId]
      if (!project) return state
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            planet_statuses: {
              ...project.planet_statuses,
              [planet]: status,
            },
          },
        },
      }
    }),

  addMessage: (projectId, message) =>
    set((state) => {
      const project = state.projects[projectId]
      if (!project) return state
      return {
        projects: {
          ...state.projects,
          [projectId]: {
            ...project,
            messages: [...(project.messages || []), message],
          },
        },
      }
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePlanet: (planet) => set({ activePlanet: planet }),
  getProject: (id) => get().projects[id],
}))
