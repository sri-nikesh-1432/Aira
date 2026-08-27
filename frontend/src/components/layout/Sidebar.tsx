'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    <aside className="w-60 flex-shrink-0 border-r border-zinc-200 flex flex-col h-screen sticky top-0 bg-white">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-base">☀️</span>
          </div>
          <div>
            <p className="font-bold text-[13px] text-zinc-900 leading-none">AIRA OS</p>
            <p className="text-[10px] text-zinc-400 leading-none mt-0.5">Multi-Agent AI</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 mt-1">
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
            </Link>
          )
        })}
      </nav>

      {/* Quick Launch */}
      <div className="p-2.5">
        <Link
          href="/project/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Launch AIRA
        </Link>
      </div>

      {/* API Status + Footer */}
      <div className="px-4 py-3 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-2">
          <div className={clsx(
            'w-1.5 h-1.5 rounded-full',
            apiOnline === null ? 'bg-yellow-400 animate-pulse' :
            apiOnline ? 'bg-emerald-500' : 'bg-red-500'
          )} />
          <span className="text-[10px] text-zinc-400">
            API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-[10px] text-zinc-300">&copy; 2026 Sri D. AIRA OS</p>
      </div>
    </aside>
  )
}
