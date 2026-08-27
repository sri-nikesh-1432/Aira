'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Activity, Plus, FolderOpen, Settings, Sparkles, Globe,
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { icon: Activity, label: 'Dashboard', href: '/dashboard' },
  { icon: Plus, label: 'New Project', href: '/project/new' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
  { icon: Globe, label: 'Planets', href: '/planets' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface SidebarProps {
  apiOnline?: boolean | null
}

export function Sidebar({ apiOnline = null }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col h-screen sticky top-0"
          style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
               style={{ 
                 background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.1))',
                 boxShadow: '0 0 20px rgba(255,215,0,0.1)',
               }}>
            <span className="text-lg">☀️</span>
          </div>
          <div>
            <p className="font-bold text-sm text-white">AIRA OS</p>
            <p className="text-[11px] text-[#52525B] leading-none">Multi-Agent AI</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'sidebar-link',
                isActive && 'sidebar-link-active'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-[3px] h-5 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Launch */}
      <div className="p-3">
        <Link
          href="/project/new"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
        >
          <Sparkles className="w-4 h-4" />
          Launch AIRA
        </Link>
      </div>

      {/* API Status + Footer */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <div className={clsx(
            'w-2 h-2 rounded-full',
            apiOnline === null ? 'bg-yellow-500 animate-pulse' :
            apiOnline ? 'bg-emerald-500' : 'bg-red-500'
          )} />
          <span className="text-xs text-[#71717A]">
            API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-[11px] text-[#3F3F46]">© 2026 Sri D. AIRA OS</p>
      </div>
    </aside>
  )
}
