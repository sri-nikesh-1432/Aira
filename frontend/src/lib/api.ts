import axios from 'axios'
import type { Project, ProjectRequest, StreamEvent } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Auth interceptor — attach JWT token to every request ────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('aira_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid — clear auth and redirect to login
      localStorage.removeItem('aira_token')
      localStorage.removeItem('aira_user')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function register(data: { name: string; email: string; password: string; confirm_password: string }) {
  const res = await api.post('/auth/register', data)
  return res.data
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data)
  return res.data
}

export async function logoutApi() {
  const res = await api.post('/auth/logout')
  return res.data
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function createProject(request: ProjectRequest): Promise<{ project_id: string; stream_url: string }> {
  const res = await api.post('/api/projects', request)
  return res.data
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await api.get(`/api/projects/${projectId}`)
  return res.data
}

export async function listProjects(): Promise<{ projects: Project[]; total: number }> {
  const res = await api.get('/api/projects')
  return res.data
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/api/projects/${projectId}`)
}

// ─── SSE Streaming ────────────────────────────────────────────────────────────
export function streamProject(
  projectId: string,
  onEvent: (event: StreamEvent) => void,
  onDone?: () => void
): () => void {
  const url = `${API_URL}/api/projects/${projectId}/stream`
  let eventSource: EventSource

  // SSE doesn't support Authorization header, so pass token as query param
  // For production, use cookie-based auth or WebSocket auth
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('aira_token')
    eventSource = new EventSource(url + (token ? `?token=${token}` : ''))
  } else {
    eventSource = new EventSource(url)
  }

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as StreamEvent
      if (data.event === 'ping') return
      onEvent(data)
      if (data.event === 'completed' || data.event === 'error') {
        onDone?.()
        eventSource.close()
      }
    } catch {
      // skip malformed events
    }
  }

  eventSource.onerror = () => {
    onDone?.()
    eventSource.close()
  }

  return () => eventSource.close()
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file: File): Promise<{ file_id: string; filename: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ─── File Browser ─────────────────────────────────────────────────────────────
export async function listProjectFiles(projectId: string): Promise<{ files: any[]; total: number }> {
  const res = await api.get(`/api/projects/${projectId}/files`)
  return res.data
}

export async function readProjectFile(projectId: string, path: string): Promise<{ content: string; ext: string }> {
  const res = await api.get(`/api/projects/${projectId}/file?path=${encodeURIComponent(path)}`)
  return res.data
}

// ─── Planets ──────────────────────────────────────────────────────────────────
export async function getPlanets(): Promise<{ planets: any[] }> {
  const res = await api.get('/api/planets')
  return res.data
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health')
    return true
  } catch {
    return false
  }
}

// ─── ZIP Download ─────────────────────────────────────────────────────────────
export function downloadProjectZip(projectId: string): void {
  const url = `${API_URL}/api/projects/${projectId}/download-zip`
  const token = typeof window !== 'undefined' ? localStorage.getItem('aira_token') : null
  // Use fetch with auth header for download
  fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `AIRA-project-${projectId.slice(0, 8)}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    })
}

// ─── Preview Info ─────────────────────────────────────────────────────────────
export async function getPreviewInfo(projectId: string): Promise<any> {
  const res = await api.get(`/api/projects/${projectId}/preview-info`)
  return res.data
}

// ─── Live Preview (boot the generated product) ───────────────────────────────
export async function startPreview(projectId: string): Promise<any> {
  const res = await api.post(`/api/projects/${projectId}/preview/start`)
  return res.data
}

export async function getPreviewStatus(projectId: string): Promise<any> {
  const res = await api.get(`/api/projects/${projectId}/preview`)
  return res.data
}

export async function stopPreview(projectId: string): Promise<any> {
  const res = await api.post(`/api/projects/${projectId}/preview/stop`)
  return res.data
}

export async function stopAllPreviews(): Promise<any> {
  const res = await api.post(`/api/previews/stop-all`)
  return res.data
}
