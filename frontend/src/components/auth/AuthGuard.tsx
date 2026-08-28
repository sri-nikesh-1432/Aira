'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const PUBLIC_PATHS = ['/', '/login', '/register', '/planets', '/planets/']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, loadFromStorage } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    loadFromStorage()
    setInitialized(true)
  }, [loadFromStorage])

  useEffect(() => {
    if (!initialized || loading) return
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!user && !isPublic) {
      router.replace('/login')
    }
  }, [initialized, loading, user, pathname, router])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EB]">
        <div className="w-8 h-8 rounded-full border-2 border-[#8B5A2B] border-t-transparent animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
