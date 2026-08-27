'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Server, Database, Zap, Globe, BookOpen, Brain, Sparkles,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { checkHealth } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function SettingsPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0c' }}>
      <Sidebar apiOnline={apiOnline} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-sm mb-8" style={{ color: '#52525B' }}>AIRA OS system information &amp; connection</p>

          {/* API Connection */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl glass-card mb-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">API Connection</h2>
            </div>

            <div className="space-y-2">
              {[
                { icon: Globe, label: 'Backend URL', value: API_URL, color: 'text-primary' },
                { icon: Zap, label: 'Status', value: apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline',
                  color: apiOnline === null ? 'text-yellow-500' : apiOnline ? 'text-emerald-500' : 'text-red-500' },
                { icon: BookOpen, label: 'API Documentation', value: 'Open /docs →', isLink: true, linkUrl: `${API_URL}/docs` },
                { icon: Database, label: 'Project Storage', value: 'backend/outputs/', mono: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                     style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" style={{ color: '#3F3F46' }} />
                    <span className="text-sm" style={{ color: '#A1A1AA' }}>{item.label}</span>
                  </div>
                  {item.isLink ? (
                    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-primary hover:underline">{item.value}</a>
                  ) : item.mono ? (
                    <code className="text-xs font-mono" style={{ color: '#52525B' }}>{item.value}</code>
                  ) : (
                    <span className={clsx('text-sm font-medium', item.color)}>
                      {!item.isLink && item.label === 'Status' && (
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full inline-block mr-2',
                          apiOnline === null ? 'bg-yellow-500 animate-pulse' :
                          apiOnline ? 'bg-emerald-500' : 'bg-red-500'
                        )} />
                      )}
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="p-5 rounded-2xl glass-card mb-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-yellow-500" />
              <h2 className="font-bold text-sm">About AIRA OS</h2>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#71717A' }}>
              AIRA (Artificial Intelligence Research &amp; Innovation Assistant) is the Central Intelligence
              of AIRA OS — a Multi-Agent AI Orchestration System that coordinates specialized AI planets to
              build complete projects from a single idea.
            </p>
            <p className="text-xs italic" style={{ color: '#3F3F46' }}>
              &ldquo;I don&apos;t solve problems alone. I orchestrate intelligence.&rdquo;
            </p>
          </motion.div>

          {/* Planets */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="p-5 rounded-2xl glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">The Planets</h2>
              <Link href="/planets" className="text-[11px] font-medium text-primary hover:text-primary-light transition-colors">
                View neural network →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PLANETS.map((p) => (
                <Link key={p.id} href="/planets"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-lg w-7 text-center">{p.symbol}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</p>
                    <p className="text-[11px] truncate" style={{ color: '#3F3F46' }}>{p.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
