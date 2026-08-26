'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity, Plus, FolderOpen, Settings, Brain,
  Server, Database, Zap, Globe, BookOpen
} from 'lucide-react'
import { checkHealth } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function SettingsPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  const nav = [
    { icon: Activity, label: 'Dashboard', href: '/dashboard', active: false },
    { icon: Plus, label: 'New Project', href: '/project/new', active: false },
    { icon: FolderOpen, label: 'Projects', href: '/projects', active: false },
    { icon: Settings, label: 'Settings', href: '/settings', active: true },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-5 flex flex-col gap-1 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
               style={{ background: 'rgba(255,215,0,0.15)', boxShadow: '0 0 12px rgba(255,215,0,0.2)' }}>
            ☀️
          </div>
          <div>
            <p className="font-bold text-sm">AIRA OS</p>
            <p className="text-xs text-text-muted">Multi-Agent AI</p>
          </div>
        </div>

        {nav.map((item) => (
          <Link key={item.href} href={item.href}
            className={clsx('sidebar-link', item.active && 'sidebar-link-active')}>
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              apiOnline === null ? 'bg-warning animate-pulse' :
              apiOnline ? 'bg-secondary' : 'bg-error'
            )} />
            <span className="text-xs text-text-muted">
              API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-text-muted px-2 mt-2">© 2026 Sri D</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-text-muted text-sm mb-8">AIRA OS system information &amp; connection</p>

          {/* API Connection */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl glass border border-border mb-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Server className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">API Connection</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">Backend URL</span>
                </div>
                <code className="text-xs text-primary">{API_URL}</code>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">Status</span>
                </div>
                <span className={clsx(
                  'flex items-center gap-2 text-sm font-medium',
                  apiOnline === null ? 'text-warning' : apiOnline ? 'text-secondary' : 'text-error'
                )}>
                  <span className={clsx(
                    'w-2 h-2 rounded-full',
                    apiOnline === null ? 'bg-warning animate-pulse' :
                    apiOnline ? 'bg-secondary' : 'bg-error'
                  )} />
                  {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">API Documentation</span>
                </div>
                <a
                  href={`${API_URL}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Open /docs →
                </a>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-secondary">Project Storage</span>
                </div>
                <code className="text-xs text-text-muted">backend/outputs/</code>
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl glass border border-border mb-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-aira" />
              <h2 className="font-bold text-sm">About AIRA OS</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              AIRA (Artificial Intelligence Research &amp; Innovation Assistant) is the Central Intelligence
              of AIRA OS — a Multi-Agent AI Orchestration System that coordinates specialized AI planets to
              build complete projects from a single idea.
            </p>
            <p className="text-xs text-text-muted italic">
              &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
            </p>
          </motion.div>

          {/* Planets */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl glass border border-border"
          >
            <h2 className="font-bold text-sm mb-5">The Planets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANETS.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border">
                  <span className="text-xl w-8 text-center">{p.symbol}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</p>
                    <p className="text-xs text-text-muted truncate">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
