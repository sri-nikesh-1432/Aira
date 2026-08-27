'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PLANETS, type PlanetId } from '@/types'
import PlanetWorkspace from '@/components/planets/PlanetWorkspace'

export default function PlanetPage() {
  const params = useParams()
  const router = useRouter()
  const planetId = params.id as string

  const planet = PLANETS.find(p => p.id === planetId)

  useEffect(() => {
    if (!planet) {
      router.push('/planets')
    }
  }, [planet, router])

  if (!planet) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0c' }}>
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 sticky top-0 z-30"
              style={{
                background: 'rgba(10,10,12,0.9)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
        <button
          onClick={() => router.push('/planets')}
          className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          style={{ color: '#71717A' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-lg">{planet.symbol}</span>
          <div>
            <h1 className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</h1>
            <p className="text-[10px]" style={{ color: '#52525B' }}>{planet.title}</p>
          </div>
        </div>
        <div className="flex-1" />
        {/* Quick nav to other planets */}
        <div className="hidden md:flex items-center gap-1">
          {PLANETS.filter(p => p.id !== 'aira').map(p => (
            <Link
              key={p.id}
              href={`/planets/${p.id}`}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:bg-white/[0.05]"
              style={{
                color: p.id === planetId ? p.color : '#52525B',
                background: p.id === planetId ? `${p.color}10` : 'transparent',
              }}
            >
              {p.symbol}
            </Link>
          ))}
        </div>
      </header>

      {/* Planet workspace */}
      <div className="flex-1 overflow-hidden">
        <PlanetWorkspace planetId={planetId as PlanetId} />
      </div>
    </div>
  )
}
