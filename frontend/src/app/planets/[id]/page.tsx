'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
    <div className="min-h-screen flex flex-col bg-[#F5F0EB]">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 sticky top-0 z-30 bg-[#FFFCF9]/90 backdrop-blur-xl border-b border-[#2C2420]/8">
        <button
          onClick={() => router.push('/planets')}
          className="p-2 rounded-lg hover:bg-[#EDE5DC] transition-colors text-[#716B65]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
               style={{ background: `${planet.color}12`, border: `1px solid ${planet.color}25` }}>
            {planet.symbol}
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ color: planet.color }}>{planet.name}</h1>
            <p className="text-[10px] text-[#716B65]">{planet.role}</p>
          </div>
        </div>
        <div className="flex-1" />
        {/* Quick nav to other planets */}
        <div className="hidden md:flex items-center gap-1">
          {PLANETS.filter(p => p.id !== 'aira').map(p => (
            <Link
              key={p.id}
              href={`/planets/${p.id}`}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:bg-[#EDE5DC]"
              style={{
                color: p.id === planetId ? p.color : '#716B65',
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
