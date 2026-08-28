import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aira_token', token)
      localStorage.setItem('aira_user', JSON.stringify(user))
    }
    set({ user, token, loading: false })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aira_token')
      localStorage.removeItem('aira_user')
    }
    set({ user: null, token: null, loading: false })
  },

  setLoading: (loading) => set({ loading }),

  loadFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ loading: false })
      return
    }
    const token = localStorage.getItem('aira_token')
    const userStr = localStorage.getItem('aira_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, loading: false })
      } catch {
        localStorage.removeItem('aira_token')
        localStorage.removeItem('aira_user')
        set({ loading: false })
      }
    } else {
      set({ loading: false })
    }
  },
}))
