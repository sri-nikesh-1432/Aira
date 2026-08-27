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

interface SidebarProps { apiOnline?: boolean | null }

export function Sidebar({ apiOnline = null }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside className="w-60 flex-shrink-0 border-r border-[#2C2420]/6 flex flex-col h-screen sticky top-0 bg-[#FFFCF9]">
      <div className="px-4 py-4 border-b border-[#2C2420]/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5A2B] to-[#6B3F1F] flex items-center justify-center shadow-sm">
            <span className="text-base">☀️</span>
          </div>
          <div>
            <p className="font-bold text-[13px] text-[#2C2420] leading-none">AIRA OS</p>
            <p className="text-[10px] text-[#A19B95] leading-none mt-0.5">Multi-Agent AI</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-2.5 space-y-0.5 mt-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={clsx('sidebar-link', isActive && 'sidebar-link-active')}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-2.5">
        <Link href="/project/new"
          className="btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-xs text-white">
          <Sparkles className="w-3.5 h-3.5" />
          Launch AIRA
        </Link>
      </div>
      <div className="px-4 py-3 border-t border-[#2C2420]/5">
        <div className="flex items-center gap-2 mb-2">
          <div className={clsx('w-1.5 h-1.5 rounded-full',
            apiOnline === null ? 'bg-amber-400 animate-pulse' : apiOnline ? 'bg-emerald-500' : 'bg-red-500'
          )} />
          <span className="text-[10px] text-[#A19B95]">
            API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-[10px] text-[#D4C8BC]">&copy; 2026 Sri D. AIRA OS</p>
      </div>
    </aside>
  )
}
