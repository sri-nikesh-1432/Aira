'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLANETS, STATUS_COLORS, type PlanetId, type PlanetStatus } from '@/types'

interface SolarSystemProps {
  planetStatuses?: Record<string, PlanetStatus>
  onPlanetClick?: (planet: PlanetId) => void
  activePlanet?: PlanetId | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

// Deterministic starfield (stable across renders / hydration)
function useStars(count: number, width: number, height: number) {
  return useMemo(() => {
    const stars: { x: number; y: number; r: number; o: number; d: number }[] = []
    let seed = 42
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand() * width,
        y: rand() * height,
        r: rand() * 1.1 + 0.25,
        o: rand() * 0.55 + 0.12,
        d: rand() * 4,
      })
    }
    return stars
  }, [count, width, height])
}

export function SolarSystem({
  planetStatuses = {},
  onPlanetClick,
  activePlanet,
  size = 'md',
}: SolarSystemProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null)

  const dims = {
    xs: { width: 200, height: 200, scale: 0.24 },
    sm: { width: 300, height: 300, scale: 0.36 },
    md: { width: 480, height: 480, scale: 0.58 },
    lg: { width: 720, height: 720, scale: 0.88 },
  }[size]

  const cx = dims.width / 2
  const cy = dims.height / 2
  const stars = useStars(90, dims.width, dims.height)

  const orbitDurations: Record<PlanetId, number> = {
    aira: 0, mercury: 8, mars: 12, venus: 17,
    earth: 23, jupiter: 31, saturn: 39, neptune: 47, uranus: 55, pluto: 63,
  }

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        width={dims.width}
        height={dims.height}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6D5" />
            <stop offset="45%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF9D00" />
          </radialGradient>
          <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#FFA500" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
          </radialGradient>
          {/* Planet surface gradients */}
          {PLANETS.filter((p) => p.id !== 'aira').map((planet) => (
            <radialGradient key={planet.id} id={`surf-${planet.id}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor={planet.color} />
              <stop offset="100%" stopColor={planet.color} stopOpacity="0.75" />
            </radialGradient>
          ))}
        </defs>

        {/* Starfield */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={s.o}
            style={{
              animation: `starTwinkle ${2 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${s.d}s`,
            }}
          />
        ))}

        {/* Orbit rings */}
        {PLANETS.filter((p) => p.orbitRadius > 0).map((planet) => {
          const r = planet.orbitRadius * dims.scale
          const status = (planetStatuses[planet.id] || 'idle') as PlanetStatus
          const isActive = status === 'active'
          const isDone = status === 'completed'
          return (
            <g key={`orbit-${planet.id}`}>
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={isActive ? planet.color : isDone ? `${planet.color}44` : 'rgba(255,255,255,0.055)'}
                strokeWidth={isActive ? 1.3 : 0.6}
                strokeDasharray={isActive ? '4 6' : undefined}
                style={{
                  transition: 'stroke 0.6s ease',
                  filter: isActive ? `drop-shadow(0 0 4px ${planet.color})` : undefined,
                }}
              />
            </g>
          )
        })}

        {/* AIRA sun */}
        {(() => {
          const aira = PLANETS[0]
          const status = (planetStatuses.aira || 'idle') as PlanetStatus
          const s = Math.max(10, aira.size * dims.scale)
          return (
            <g
              transform={`translate(${cx}, ${cy})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onPlanetClick?.('aira')}
              onMouseEnter={() => setHoveredPlanet('aira')}
              onMouseLeave={() => setHoveredPlanet(null)}
            >
              <circle r={s * 3.4} fill="url(#sunHalo)" />
              <circle
                r={s * 1.9}
                fill={`${aira.color}14`}
                style={{ animation: 'pulseGlow 3.2s ease-in-out infinite' }}
              />
              <circle
                r={s}
                fill="url(#sunCore)"
                style={{
                  filter: `drop-shadow(0 0 ${s * 0.9}px rgba(255,215,0,0.9))`,
                  opacity: status === 'active' ? 1 : 0.92,
                }}
              />
              <text
                textAnchor="middle"
                dy={s + 14}
                fill={aira.color}
                fontSize={Math.max(7, 9.5 * dims.scale)}
                fontFamily="Inter"
                fontWeight="800"
                letterSpacing="1"
                opacity={0.95}
              >
                AIRA
              </text>
            </g>
          )
        })()}

        {/* Orbiting planets */}
        {PLANETS.filter((p) => p.id !== 'aira').map((planet) => {
          const status = (planetStatuses[planet.id] || 'idle') as PlanetStatus
          const isActive = status === 'active'
          const isCompleted = status === 'completed'
          const isError = status === 'error'
          const r = planet.orbitRadius * dims.scale
          const duration = orbitDurations[planet.id]
          const ps = Math.max(3.5, planet.size * dims.scale)
          const hasRing = planet.id === 'saturn'

          return (
            <g key={planet.id}>
              <motion.g
                style={{ transformOrigin: `${cx}px ${cy}px` }}
                animate={{ rotate: 360 }}
                transition={{ duration, repeat: Infinity, ease: 'linear', paused: status === 'idle' && hoveredPlanet !== planet.id }}
              >
                <g
                  transform={`translate(${cx + r}, ${cy})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPlanetClick?.(planet.id)}
                  onMouseEnter={() => setHoveredPlanet(planet.id)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  {(isActive || isCompleted) && (
                    <>
                      <circle
                        r={ps * 2.4}
                        fill="none"
                        stroke={planet.color}
                        strokeWidth={0.8}
                        opacity={0.4}
                        style={{ animation: 'pulseGlow 1.6s ease-in-out infinite' }}
                      />
                      {isActive && (
                        <circle
                          r={ps * 1.7}
                          fill={`${planet.color}22`}
                          style={{ animation: 'pulseGlow 1.2s ease-in-out infinite' }}
                        />
                      )}
                    </>
                  )}
                  {/* Saturn ring */}
                  {hasRing && (
                    <ellipse
                      rx={ps * 2.1}
                      ry={ps * 0.65}
                      fill="none"
                      stroke={planet.color}
                      strokeWidth={ps * 0.28}
                      opacity={isActive || isCompleted ? 0.85 : 0.35}
                      transform={`rotate(-18)`}
                      style={{ transition: 'opacity 0.4s ease' }}
                    />
                  )}
                  <circle
                    r={ps}
                    fill={status === 'idle' ? `${planet.color}66` : `url(#surf-${planet.id})`}
                    style={{
                      filter:
                        isActive || isCompleted
                          ? `drop-shadow(0 0 ${ps * 0.9}px ${planet.color})`
                          : undefined,
                      transition: 'fill 0.4s ease',
                    }}
                  />
                  {isCompleted && (
                    <text textAnchor="middle" dy={ps * 0.35} fill="#fff" fontSize={ps * 0.95} fontFamily="Inter" fontWeight="700">
                      ✓
                    </text>
                  )}
                  {isError && (
                    <text textAnchor="middle" dy={ps * 0.35} fill="#fff" fontSize={ps * 0.9} fontFamily="Inter" fontWeight="700">
                      !
                    </text>
                  )}
                  <circle
                    r={ps + 2.5}
                    fill="none"
                    stroke={STATUS_COLORS[status]}
                    strokeWidth={1.1}
                    opacity={status !== 'idle' ? 0.8 : 0.15}
                    style={{ transition: 'opacity 0.4s ease' }}
                  />
                  <text
                    textAnchor="middle"
                    dy={ps + 13}
                    fill={isActive || isCompleted ? planet.color : '#5B6478'}
                    fontSize={Math.max(6, 8.5 * dims.scale)}
                    fontFamily="Inter"
                    fontWeight={isActive ? '700' : '600'}
                    style={{ transition: 'fill 0.3s ease' }}
                  >
                    {planet.name}
                  </text>
                </g>
              </motion.g>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none"
          >
            {(() => {
              const planet = PLANETS.find((p) => p.id === hoveredPlanet)!
              const status = (planetStatuses[hoveredPlanet] || 'idle') as PlanetStatus
              return (
                <div className="glass-strong rounded-xl px-4 py-2.5 text-center min-w-[180px] shadow-card">
                  <p className="font-semibold text-sm" style={{ color: planet.color }}>
                    {planet.symbol} {planet.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{planet.title}</p>
                  <div
                    className="mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full inline-block"
                    style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status] }}
                  >
                    {status.toUpperCase()}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
