'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useOfficeStore } from '@/store/officeStore'
import { HumanSprite } from './HumanSprite'
import { BicycleSprite, CarSprite, HelicopterSprite } from './VehicleSprites'
import { ALL_AGENT_IDS, getRoster } from './roster'
import { WORLD_W, WORLD_H, WP, getCabinPos } from '@/lib/paths'
import type { AgentId, AgentLocation, OfficeRoom } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// TIME SYSTEM (IST)
// ═══════════════════════════════════════════════════════════════════════════════
export function istParts() {
  const now = new Date()
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
  return {
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
    seconds: ist.getUTCSeconds(),
    clock: new Date(now.getTime() - ((now.getTimezoneOffset() + 330) * 60000)), // local clock
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDING RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

function Grass({ night, afternoon }: { night: boolean; afternoon: boolean }) {
  const g = afternoon ? '#8FBE75' : night ? '#12291A' : '#5A9E4F'
  return (
    <g>
      <rect x={-200} y={-200} width={WORLD_W + 400} height={WORLD_H + 400} fill={g} />
      {/* subtle grass texture */}
      {Array.from({ length: 60 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 97) % (WORLD_W + 100)}
          cy={(i * 61) % (WORLD_H + 100)}
          r={1.5}
          fill={afternoon ? '#9CCB80' : night ? '#1A3A24' : '#66AA59'}
          opacity={0.4}
        />
      ))}
    </g>
  )
}

function SkyAndSun({ night, afternoon }: { night: boolean; afternoon: boolean }) {
  const sky = night ? '#04070F' : afternoon ? '#E9B35F' : '#7FC4E8'
  return (
    <g>
      <rect x={-200} y={-200} width={WORLD_W + 400} height={WORLD_H + 400} fill={sky} />
      {night ? (
        <>
          {[
            [120, 60], [300, 120], [500, 70], [700, 40], [1080, 90], [1250, 40], [1500, 110],
            [200, 200], [600, 180], [1400, 220], [900, 130],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={2.2} fill="#E7ECF1" opacity={0.8} />
          ))}
          <circle cx={1350} cy={90} r={30} fill="#E8EAF0" opacity={0.5} />
          <circle cx={1350} cy={90} r={38} fill="#E8EAF0" opacity={0.12} />
        </>
      ) : afternoon ? (
        <>
          <circle cx={700} cy={100} r={46} fill="#FFD966" opacity={0.95} />
          <ellipse cx={700} cy={100} rx={120} ry={30} fill="#FFE082" opacity={0.2} />
        </>
      ) : (
        <>
          <circle cx={700} cy={100} r={44} fill="#FFEE88" />
          <ellipse cx={700} cy={100} rx={110} ry={26} fill="#FFF6C0" opacity={0.25} />
        </>
      )}
    </g>
  )
}

function Road({ night }: { night: boolean }) {
  const road = night ? '#23262B' : '#5D6268'
  const edge = night ? '#181A1E' : '#44484E'
  const lane = night ? '#0e0f11' : '#C9CDD2'
  return (
    <g>
      {/* Horizontal main road: dorm -> post office -> office -> mansion */}
      <rect x={100} y={525} width={1450} height={34} rx={6} fill={road} stroke={edge} strokeWidth={2} />
      <line x1={100} y1={542} x2={1550} y2={542} stroke={lane} strokeWidth={1.6} strokeDasharray="14 16" opacity={0.5} />
      {/* Vertical road: office -> mansion */}
      <rect x={805} y={300} width={30} height={700} rx={6} fill={road} stroke={edge} strokeWidth={2} />
      <line x1={820} y1={300} x2={820} y2={1000} stroke={lane} strokeWidth={1.6} strokeDasharray="14 16" opacity={0.5} />
      {/* Vertical road: office -> villa */}
      <rect x={1180} y={150} width={30} height={450} rx={6} fill={road} stroke={edge} strokeWidth={2} opacity={0.85} />
      <line x1={1195} y1={150} x2={1195} y2={600} stroke={lane} strokeWidth={1.6} strokeDasharray="14 16" opacity={0.5} />
      {/* Crosswalk near office entrance */}
      <rect x={480} y={520} width={14} height={44} fill={night ? '#3a3f46' : '#7A8288'} opacity={0.4} />
      <rect x={502} y={520} width={14} height={44} fill={night ? '#3a3f46' : '#7A8288'} opacity={0.4} />
      <rect x={524} y={520} width={14} height={44} fill={night ? '#3a3f46' : '#7A8288'} opacity={0.4} />
    </g>
  )
}

function Tree({ x, y, scale = 1, night = false }: { x: number; y: number; scale?: number; night?: boolean }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x={-3} y={0} width={6} height={10} fill="#5D4037" />
      <circle cx={0} cy={-8} r={12} fill={night ? '#163B28' : '#2E7D32'} />
      <circle cx={-6} cy={-4} r={8} fill={night ? '#1B4428' : '#388E3C'} />
      <circle cx={6} cy={-4} r={8} fill={night ? '#174025' : '#43A047'} />
    </g>
  )
}

function StreetLight({ x, y, night }: { x: number; y: number; night: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-1.5} y={-26} width={3} height={26} fill="#37474F" />
      <circle cx={0} cy={-28} r={4} fill={night ? '#FFE082' : '#546E7A'} />
      {night && (
        <>
          <circle cx={0} cy={-28} r={10} fill="#FFE082" opacity={0.12} />
          <path d="M -12 -26 L 12 -26 L 7 2 L -7 2 Z" fill="#FFE082" opacity={0.05} />
        </>
      )}
    </g>
  )
}

function Villa({ night }: { night: boolean }) {
  return (
    <g>
      {/* Garden */}
      <rect x={120} y={40} width={330} height={190} rx={12} fill={night ? '#102420' : '#3F8745'} stroke="none" />
      {/* Pool */}
      <rect x={140} y={170} width={110} height={46} rx={10} fill={night ? '#0E2E3A' : '#7EC8E3'} opacity={0.9} />
      <rect x={142} y={172} width={106} height={42} rx={9} fill={night ? '#1A4A56' : '#9CE0F5'} opacity={0.5} />
      {/* Villa building */}
      <rect x={250} y={70} width={190} height={150} rx={6} fill={night ? '#3E3A42' : '#F2E9DA'} stroke={night ? '#5A5A66' : '#CDBFA6'} strokeWidth={2.5} />
      {/* Roof */}
      <polygon points="240,72 360,36 460,72" fill={night ? '#5f4c30' : '#B07A3D'} stroke={night ? '#78603c' : '#8F5A28'} strokeWidth={2} />
      {/* Windows (lit at night) */}
      {[
        [300, 130], [360, 130], [420, 130], [265, 96], [390, 96],
      ].map(([wx, wy], i) => (
        <rect key={i} x={wx} y={wy} width={40} height={30} rx={3} fill={night ? '#FFE082' : '#BFD8E8'} stroke={night ? '#a8893a' : '#9BB4C2'} strokeWidth={1.5} />
      ))}
      {/* Door */}
      <rect x={385} y={130} width={28} height={46} rx={3} fill="#7A5A30" />
      <circle cx={408} cy={157} r={2} fill="#FFD700" />
      {/* Garage */}
      <rect x={240} y={200} width={80} height={34} rx={4} fill={night ? '#2E2E36' : '#CFC5B4'} stroke={night ? '#48484f' : '#B0A48F'} strokeWidth={2} />
      {/* Luxury car in garage */}
      <CarSprite x={280} y={212} color="#111" night={night} />
      {/* Helipad discrete */}
      <circle cx={470} cy={100} r={34} fill={night ? '#1A2026' : '#AEB9C4'} stroke="#C9A227" strokeWidth={2.5} />
      <circle cx={470} cy={100} r={22} fill="none" stroke="#C9A227" strokeWidth={1.5} />
      <text x={470} y={105} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#C9A227">H</text>
      {/* Label */}
      <text x={345} y={270} textAnchor="middle" fontSize={14} fontWeight="bold" fill={night ? '#dfb84a' : '#7A4A20'} fontFamily="Inter">
        AIRA VILLA
      </text>
      <text x={345} y={286} textAnchor="middle" fontSize={10} fill={night ? '#b99850' : '#a08050'} fontFamily="Inter">Managing Director</text>
    </g>
  )
}

function Mansion({ night }: { night: boolean }) {
  return (
    <g>
      <rect x={120} y={760} width={290} height={170} rx={10} fill={night ? '#101C18' : '#4E8A50'} />
      <rect x={140} y={800} width={170} height={120} rx={6} fill={night ? '#33333B' : '#E4DCD3'} stroke={night ? '#4E4E56' : '#C2B7A6'} strokeWidth={2.5} />
      <polygon points="130,802 225,760 330,802" fill={night ? '#44444C' : '#8C7B68'} />
      {[
        [170, 850], [230, 850], [280, 850], [185, 820],
      ].map(([wx, wy], i) => (
        <rect key={i} x={wx} y={wy} width={30} height={22} rx={3} fill={night ? '#FFE082' : '#BFD8E8'} stroke={night ? '#a8893a' : '#9BB4C2'} strokeWidth={1.5} />
      ))}
      <rect x={252} y={845} width={22} height={38} rx={3} fill="#6B4A26" />
      {/* Garage + car */}
      <rect x={310} y={800} width={80} height={34} rx={4} fill={night ? '#23232A' : '#CFC5B4'} stroke={night ? '#3a3a41' : '#B0A48F'} strokeWidth={2} />
      <CarSprite x={350} y={812} color="#5A5A5A" night={night} />
      <text x={225} y={955} textAnchor="middle" fontSize={13} fontWeight="bold" fill={night ? '#d08770' : '#7A5220'} fontFamily="Inter">
        DATTA MANSION
      </text>
      <text x={225} y={970} textAnchor="middle" fontSize={10} fill={night ? '#b08060' : '#a08050'} fontFamily="Inter">Project Manager</text>
    </g>
  )
}

function Dormitory({ night, sleepingMap }: { night: boolean; sleepingMap: Record<AgentId, boolean> }) {
  const employees = ALL_AGENT_IDS.filter(a => a !== 'postman' && a !== 'aira' && a !== 'datta')
  // room positions inside dorm (2 columns x 5 rows)
  const roomPos: { x: number; y: number }[] = [
    { x: 130, y: 90 }, { x: 268, y: 90 },
    { x: 130, y: 180 }, { x: 268, y: 180 },
    { x: 130, y: 270 }, { x: 268, y: 270 },
    { x: 130, y: 360 }, { x: 268, y: 360 },
    { x: 130, y: 450 }, { x: 268, y: 450 },
  ]
  const mapping: Record<string, number> = {
    mercury: 0, venus: 1, mars: 2, earth: 3, jupiter: 4,
    saturn: 5, uranus: 6, neptune: 7, pluto: 8, ceres: 9,
  }
  return (
    <g>
      <rect x={80} y={50} width={460} height={540} rx={10} fill={night ? '#1B1F26' : '#E6DFD5'} stroke={night ? '#363B44' : '#C2B8A8'} strokeWidth={3} />
      <rect x={80} y={50} width={460} height={34} rx={10} fill={night ? '#2A303A' : '#B09A84'} />
      <text x={310} y={72} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#fff" fontFamily="Inter">EMPLOYEE DORMITORY</text>
      <text x={310} y={608} textAnchor="middle" fontSize={10} fontWeight="bold" fill={night ? '#7ba7c9' : '#7A8391'} fontFamily="Inter">10 Rooms • Bicycle Parking • Home Standby</text>

      {employees.map((aid, i) => {
        const r = roomPos[mapping[aid]]
        const h = getRoster(aid)
        const asleep = sleepingMap[aid]
        return (
          <g key={aid} transform={`translate(${r.x}, ${r.y})`}>
            <rect x={0} y={0} width={198} height={84} rx={6} fill={night ? (asleep ? '#171C26' : '#232834') : (asleep ? '#D7E0EA' : '#F4F0EA')}
              stroke={asleep ? h.planetColor : (night ? '#454B56' : '#C2B8A8')} strokeWidth={asleep ? 2 : 1} />
            <rect x={0} y={0} width={198} height={18} rx={6} fill={night ? '#2A3140' : '#C8D0D8'} opacity={0.7} />
            <text x={8} y={13} fontSize={10} fontWeight="bold" fill={h.planetColor} fontFamily="Inter">{h.agentName}</text>
            {/* Bed */}
            <rect x={12} y={28} width={72} height={46} rx={4} fill={night ? '#3E4450' : '#C9D2DD'} />
            <rect x={12} y={28} width={72} height={13} rx={4} fill={night ? '#525A68' : '#AAB9C8'} />
            <rect x={16} y={32} width={26} height={8} rx={4} fill={night ? '#FFE082' : '#D8C160'} />
            {asleep && (
              <g>
                <circle cx={42} cy={60} r={9} fill={h.skinTone} opacity={0.95} />
                <rect x={30} y={60} width={38} height={14} rx={3} fill={h.shirtColor} opacity={0.8} />
                <g fill={night ? '#FFD700' : '#8B5A2B'} fontFamily="monospace" fontWeight="bold">
                  <text x={82} y={46} fontSize={12}>z</text>
                  <text x={98} y={38} fontSize={8} opacity={0.7}>z</text>
                </g>
              </g>
            )}
            {/* Desk + locker + personal items */}
            <rect x={98} y={66} width={34} height={8} rx={2} fill={h.bicycleColor} opacity={0.7} />
            <rect x={136} y={30} width={30} height={42} rx={3} fill={night ? '#2E343E' : '#94A0AC'} stroke={night ? '#464c56' : '#7A8794'} strokeWidth={1.5} />
            <rect x={140} y={34} width={22} height={14} rx={2} fill={night ? '#454E5C' : '#B7C2CC'} />
            {/* small lamp */}
            <circle cx={104} cy={50} r={5} fill={night ? '#FFE082' : '#FFD54F'} opacity={asleep ? 0.3 : 0.9} />
          </g>
        )
      })}
      {/* bicycle parking at dorm entrance */}
      <BicycleParking night={night} x={310} y={640} />
    </g>
  )
}

function BicycleParking({ night, x, y }: { night: boolean; x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-90} y={0} width={180} height={26} rx={6} fill={night ? '#1A1E24' : '#D8D0C4'} stroke={night ? '#33383f' : '#B8AE9C'} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i} transform={`translate(${-70 + i * 32}, 10)`}>
          <circle cx={-6} cy={8} r={5} fill="none" stroke={night ? '#4a4a52' : '#666'} strokeWidth={1.4} />
          <circle cx={6} cy={8} r={5} fill="none" stroke={night ? '#4a4a52' : '#666'} strokeWidth={1.4} />
          <line x1={-6} y1={8} x2={-1} y2={0} stroke={night ? '#777' : '#888'} strokeWidth={1.2} />
          <line x1={-1} y1={0} x2={6} y2={8} stroke={night ? '#777' : '#888'} strokeWidth={1.2} />
        </g>
      ))}
      <text x={0} y={-4} textAnchor="middle" fontSize={8} fill={night ? '#9aa8b8' : '#7A8391'} fontWeight="bold">🚲 BICYCLE PARKING</text>
    </g>
  )
}

function PostOffice({ night, mailboxStatus }: { night: boolean; mailboxStatus: string }) {
  const onNew = mailboxStatus === 'new_project'
  return (
    <g>
      <rect x={470} y={430} width={130} height={110} rx={8} fill={night ? '#1F2524' : '#E8EBE0'} stroke={night ? '#3A4A3A' : '#BFC4B2'} strokeWidth={2.5} />
      <text x={535} y={452} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#33691E" fontFamily="Inter">📮 POST OFFICE</text>
      {/* Mailbox */}
      <rect x={520} y={470} width={44} height={54} rx={6} fill={onNew ? '#C62828' : (night ? '#3A3F48' : '#7A8794')} />
      <rect x={524} y={476} width={36} height={20} rx={3} fill={onNew ? '#E53935' : (night ? '#4A5568' : '#9AA5B1')} />
      <rect x={528} y={482} width={28} height={4} rx={2} fill={onNew ? '#FFCDD2' : (night ? '#2E343E' : '#B0BCCB')} />
      {onNew && <text x={542} y={516} textAnchor="middle" fontSize={18}>✉</text>}
      {onNew && (
        <g>
          <rect x={500} y={440} width={68} height={20} rx={4} fill="#1B5E20" />
          <text x={534} y={454} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#A5D6A7">PROJECT</text>
          <text x={534} y={466} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#A5D6A7">RECEIVED ✓</text>
        </g>
      )}
      {/* Postman's parking bicycle */}
      <g transform="translate(470, 500)">
        <circle cx={10} cy={36} r={10} fill="none" stroke={night ? '#4a4a52' : '#666'} strokeWidth={2.4} />
        <circle cx={34} cy={36} r={10} fill="none" stroke={night ? '#4a4a52' : '#666'} strokeWidth={2.4} />
        <line x1={10} y1={27} x2={34} y2={27} stroke={night ? '#777' : '#888'} strokeWidth={2.2} />
        <line x1={10} y1={27} x2={22} y2={18} stroke={night ? '#777' : '#888'} strokeWidth={2.2} />
        <line x1={34} y1={27} x2={22} y2={18} stroke={night ? '#777' : '#888'} strokeWidth={2.2} />
      </g>
      <text x={535} y={560} textAnchor="middle" fontSize={9} fill={night ? '#7ba7c9' : '#5A6A5A'} fontFamily="Inter">
        {mailboxStatus === 'empty' ? 'Mailbox empty • awaiting your idea' : 'Holding new project'}
      </text>
    </g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OFFICE BUILDING
// ═══════════════════════════════════════════════════════════════════════════════
const CABIN_ORDER: { id: string; gx: number; gy: number }[] = [
  { id: 'mercury_cabin', gx: 0, gy: 0 }, { id: 'mars_cabin', gx: 1, gy: 0 },
  { id: 'venus_cabin', gx: 0, gy: 1 },   { id: 'earth_cabin', gx: 1, gy: 1 },
  { id: 'jupiter_cabin', gx: 0, gy: 2 }, { id: 'saturn_cabin', gx: 1, gy: 2 },
  { id: 'uranus_cabin', gx: 0, gy: 3 },  { id: 'neptune_cabin', gx: 1, gy: 3 },
  { id: 'pluto_cabin', gx: 0, gy: 4 },   { id: 'ceres_cabin', gx: 1, gy: 4 },
]

function MainOffice({ night, agents, phase, onCabinClick }: {
  night: boolean; agents: Record<AgentId, AgentLocation>; phase: string
  onCabinClick?: (room: string) => void
}) {
  // large company building occupying center-right
  return (
    <g>
      {/* Building base */}
      <rect x={820} y={180} width={380} height={640} rx={12} fill={night ? '#1B212A' : '#E7E0D6'} stroke={night ? '#343B45' : '#C2B8A6'} strokeWidth={3} />
      {/* Header */}
      <rect x={820} y={180} width={380} height={42} rx={12} fill={night ? '#232B36' : '#7C4A23'} />
      <text x={1010} y={206} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#fff" fontFamily="Inter">AIRA SOFTWARE COMPANY</text>

      {/* Waiting lobby / entrance hall */}
      <rect x={836} y={232} width={348} height={40} rx={6} fill={night ? '#151A22' : '#F2EEE8'} />
      <text x={1010} y={256} textAnchor="middle" fontSize={9} fontWeight="bold" fill={night ? '#6f7d8e' : '#8B8F98'} fontFamily="Inter">ENTRANCE LOBBY</text>

      {/* AIRA cabin (top-right executive) */}
      <rect x={1090} y={282} width={94} height={86} rx={6} fill={night ? '#242018' : '#F7EFD8'} stroke={night ? '#4A4A3A' : '#C8B37E'} strokeWidth={2} />
      <text x={1137} y={298} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#C9A227" fontFamily="Inter">AIRA CABIN</text>
      {agents.aira && agents.aira.room === 'aira_cabin' && (
        <HumanSprite agentId="aira" state={agents.aira.state} x={1137} y={360} size={13} night={night} />
      )}

      {/* Datta cabin (top-left executive) */}
      <rect x={836} y={282} width={94} height={86} rx={6} fill={night ? '#201B14' : '#F3ECDC'} stroke={night ? '#4A3A2A' : '#C8B08E'} strokeWidth={2} />
      <text x={883} y={298} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#E07B39" fontFamily="Inter">DATTA CABIN</text>
      {agents.datta && agents.datta.room === 'datta_cabin' && (
        <HumanSprite agentId="datta" state={agents.datta.state} x={883} y={360} size={13} night={night} />
      )}

      {/* Meeting room (center, large) */}
      <rect x={836} y={390} width={348} height={110} rx={8} fill={night ? '#1B1F1A' : '#EBEFE0'} stroke={night ? '#3A4238' : '#BFC8AE'} strokeWidth={2} />
      <text x={1010} y={408} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#B8860B" fontFamily="Inter">🏢 MEETING ROOM</text>
      {/* Meeting table */}
      <rect x={950} y={440} width={120} height={34} rx={8} fill={night ? '#353B2A' : '#B08D57'} />
      {/* Employees in meeting */}
      <g>
        {ALL_AGENT_IDS.filter(a => a !== 'postman' && agents[a]?.room === 'meeting_room').map((aid, i) => (
          <HumanSprite key={aid} agentId={aid} state={agents[aid]?.state || 'meeting'}
            x={880 + (i % 6) * 48} y={500 + Math.floor(i / 6) * 30} size={10} night={night} />
        ))}
      </g>

      {/* Employee cabins grid */}
      {CABIN_ORDER.map(({ id, gx, gy }) => {
        const cabinRoom = id as OfficeRoom
        const x = 836 + gx * 180
        const y = 506 + gy * 60
        const a = agents[id.replace('_cabin', '') as AgentId]
        const roster = getRoster(id.replace('_cabin', '') as AgentId)
        const occupant = a && a.room === cabinRoom
        const active = occupant && (a.state === 'working' || a.state === 'at_desk')
        return (
          <g key={id} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); onCabinClick?.(id) }}>
            <rect x={0} y={0} width={170} height={52} rx={5} fill={night ? '#151A22' : '#F2EEE8'}
              stroke={active ? roster.planetColor : (night ? '#2E3540' : '#C9C0AF')} strokeWidth={active ? 2 : 1} />
            <rect x={0} y={0} width={170} height={13} rx={5} fill={active ? roster.planetColor : (night ? '#242A33' : '#CBD2D9')} opacity={0.55} />
            <text x={8} y={10} fontSize={7} fontWeight="bold" fill={active ? '#0A0E14' : roster.planetColor} fontFamily="Inter">{roster.agentName}</text>
            {/* Desk + station-specific icon */}
            <text x={10} y={40} fontSize={15} opacity={0.8}>{stationIcon(roster.specialNote, roster.agentName)}</text>
            {/* Character when working */}
            {occupant && (
              <HumanSprite agentId={id.replace('_cabin', '') as AgentId} state={a.state} x={120} y={40} size={11} night={night} />
            )}
          </g>
        )
      })}

      {/* Integration room */}
      <rect x={836} y={700} width={170} height={94} rx={6} fill={night ? '#12201A' : '#DFEEDF'} stroke={night ? '#2E6B42' : '#A4C2A0'} strokeWidth={2} />
      <text x={921} y={716} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#2E7D32" fontFamily="Inter">🔗 INTEGRATION</text>
      {phase === 'datta_integrating' && (
        <g>
          <rect x={852} y={736} width={140} height={7} rx={3.5} fill={night ? '#16241C' : '#cfe0cf'} />
          <rect x={852} y={736} width={110} height={7} rx={3.5} fill="#4CAF50">
            <animate attributeName="width" values="50;110;50" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x={921} y={762} textAnchor="middle" fontSize={7} fill="#4CAF50" fontWeight="bold">INTEGRATING → BUILD</text>
        </g>
      )}

      {/* Live preview room */}
      <rect x={1014} y={700} width={170} height={94} rx={6} fill={night ? '#101A28' : '#DFE8F2'} stroke={night ? '#2E4E8F' : '#9FB8CF'} strokeWidth={2} />
      <text x={1099} y={716} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#2171A7" fontFamily="Inter">🌐 LIVE PREVIEW</text>
      <rect x={1030} y={730} width={138} height={52} rx={3} fill="#0B1017" stroke="#2E4E8F" />
      {phase === 'completed' ? (
        <>
          <text x={1099} y={752} textAnchor="middle" fontSize={9} fill="#4FC3F7" fontWeight="bold">✓ PRODUCT READY</text>
          <text x={1099} y={766} textAnchor="middle" fontSize={7} fill="#4FC3F7" opacity={0.7}>Click to preview</text>
        </>
      ) : (
        <text x={1099} y={756} textAnchor="middle" fontSize={7} fill="#4FC3F7" opacity={0.6}>Generating...</text>
      )}

      {/* Building label */}
      <text x={1010} y={842} textAnchor="middle" fontSize={10} fontWeight="bold" fill={night ? '#7a8 da' : '#7A8391'} fontFamily="Inter">
        {phase.replace(/_/g, ' ').toUpperCase()}
      </text>
    </g>
  )
}

function stationIcon(note: string, name: string): string {
  const n = name.toLowerCase()
  if (n === 'mercury') return '🔍'
  if (n === 'mars') return '🏗️'
  if (n === 'venus') return '🎨'
  if (n === 'earth') return '💻'
  if (n === 'jupiter') return '🗄️'
  if (n === 'saturn') return '🤖'
  if (n === 'uranus') return '🛡️'
  if (n === 'neptune') return '🧪'
  if (n === 'pluto') return '🚀'
  if (n === 'ceres') return '📝'
  return '💼'
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER RENDERER — positions agents physically, with vehicles on roads
// ═══════════════════════════════════════════════════════════════════════════════

function Characters({ agents, night, onAgentClick }: {
  agents: Record<AgentId, AgentLocation>
  night: boolean
  onAgentClick?: (a: AgentId) => void
}) {
  const els: React.ReactNode[] = []

  ALL_AGENT_IDS.forEach((aid) => {
    const a = agents[aid]
    if (!a) return
    const { x, y } = a
    if (x === undefined || y === undefined) return

    const roster = getRoster(aid)
    const isTravelling = a.state === 'travelling' || a.transport !== undefined
    const transportType: 'walking' | 'bicycle' | 'car' | 'helicopter' =
      a.transport ||
      (aid === 'aira' ? 'helicopter' : aid === 'datta' ? 'car' : aid === 'postman' ? 'bicycle' : 'bicycle')
    const onRoad = a.room === 'road'

    // Only show character + vehicle if not hidden inside a cabin/dorm building
    const hiddenRooms = [
      'aira_cabin', 'datta_cabin', 'meeting_room', 'dormitory',
      'mercury_cabin', 'mars_cabin', 'venus_cabin', 'earth_cabin', 'jupiter_cabin',
      'saturn_cabin', 'uranus_cabin', 'neptune_cabin', 'pluto_cabin', 'ceres_cabin',
    ]
    if (!isTravelling && hiddenRooms.includes(a.room)) return

    els.push(
      <g key={aid} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onAgentClick?.(aid) }}>
        {/* Transport vehicle under character */}
        {isTravelling && transportType === 'bicycle' && (
          <BicycleSprite x={0} y={8} color={roster.bicycleColor} night={night} />
        )}
        {isTravelling && transportType === 'car' && (
          <CarSprite x={0} y={6} color={aid === 'datta' ? '#33334d' : '#555'} night={night} />
        )}
        {isTravelling && transportType === 'helicopter' && (
          <HelicopterSprite x={0} y={-6} night={night} />
        )}
        <HumanSprite agentId={aid} state={a.state} x={0} y={0} size={onRoad && transportType === 'bicycle' ? 15 : 14} night={night} focus={false} />
      </g>
    )
  })

  return <>{els}</>
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPLORABLE WORLD
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeWorld({ onAgentClick, onCabinClick }: {
  onAgentClick?: (a: AgentId) => void
  onCabinClick?: (room: string) => void
}) {
  const agents = useOfficeStore((s) => s.agents)
  const phase = useOfficeStore((s) => s.phase)
  const mailboxStatus = useOfficeStore((s) => s.mailboxStatus)

  // Camera
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 })
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  // Time
  const [now, setNow] = useState(istParts())
  useEffect(() => {
    const t = setInterval(() => setNow(istParts()), 1000)
    return () => clearInterval(t)
  }, [])
  const night = now.hours >= 19 || now.hours <= 5
  const afternoon = now.hours >= 12 && now.hours < 17

  // Motion clock
  useEffect(() => {
    let raf = 0
    let last = Date.now()
    const loop = () => {
      const n = Date.now()
      // store tick
      ;(useOfficeStore.getState() as any).tick?.((n - last) / 1000)
      last = n
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const sleepingMap = useMemo(() => {
    const m = {} as Record<AgentId, boolean>
    ALL_AGENT_IDS.forEach(a => { m[a] = agents[a]?.state === 'sleeping' || agents[a]?.state === 'idle' })
    return m
  }, [agents])

  const zoomBy = (f: number) => setView(v => ({ ...v, scale: Math.min(2.8, Math.max(0.5, v.scale * f)) }))
  const resetView = () => setView({ scale: 1, tx: 0, ty: 0 })

  const focus = useCallback((x: number, y: number) => {
    // center camera on world point (assuming container ~ viewport)
    const w = typeof window !== 'undefined' ? window.innerWidth : 1000
    const h = typeof window !== 'undefined' ? window.innerHeight : 800
    setView(v => ({
      scale: Math.max(v.scale, 1.4),
      tx: w / 2 - x * 1.4,
      ty: h / 2 - y * 1.4,
    }))
  }, [])

  const focusAgent = (aid: AgentId) => {
    const a = agents[aid]
    if (a?.x !== undefined && a?.y !== undefined) focus(a.x, a.y)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (d) {
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      // Capture into locals so the state updater never depends on the mutable ref
      const baseTx = d.tx
      const baseTy = d.ty
      setView(v => ({ ...v, tx: baseTx + dx, ty: baseTy + dy }))
    }
  }
  const onPointerUp = (e: React.PointerEvent) => { dragRef.current = null }

  const worldStyle = {
    transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
    transformOrigin: '0 0',
    width: WORLD_W, height: WORLD_H,
  }

  const phaseLabel = (phase || 'idle').replace(/_/g, ' ')

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#04070f] select-none" style={{ touchAction: 'none' }}>
      {/* WORLD (pan/drag surface) */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={(e) => { /* reset on double click */ resetView() }}
      >
        <div style={worldStyle as any}>
          <svg width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
            <SkyAndSun night={night} afternoon={afternoon} />
            <Grass night={night} afternoon={afternoon} />

            {/* Perimeter trees */}
            {[
              [60, 60], [200, 60], [900, 60], [1300, 60], [1560, 60],
              [60, 300], [60, 700], [60, 1000], [500, 1000], [700, 1000], [1000, 1000], [1400, 1000], [1560, 300], [1560, 700],
            ].map(([tx, ty], i) => <Tree key={i} x={tx} y={ty} night={night} />)}

            <Road night={night} />

            {/* Street lights along roads */}
            {[
              [310, 500], [560, 500], [760, 500], [1080, 300], [1080, 500], [1080, 700], [1080, 880],
              [1460, 500], [500, 1000], [1000, 1000], [660, 635],
            ].map(([lx, ly], i) => <StreetLight key={i} x={lx as number} y={ly as number} night={night} />)}

            {/* Buildings (outside-to-inside for proper layering) */}
            <Villa night={night} />
            <Mansion night={night} />
            <Dormitory night={night} sleepingMap={sleepingMap} />
            <PostOffice night={night} mailboxStatus={mailboxStatus} />
            <MainOffice night={night} agents={agents} phase={phase} onCabinClick={onCabinClick} />

            {/* Characters on top */}
            <Characters agents={agents} night={night} onAgentClick={onAgentClick} />

            {/* Phase watermark */}
            <text x={WORLD_W / 2} y={WORLD_H - 16} textAnchor="middle" fontSize={15} fill="#4FC3F7" fontFamily="Inter" fontWeight="bold" letterSpacing={4} opacity={0.18}>
              {phaseLabel.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>

      {/* ─── Minimal UI: zoom controls ─── */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
        <button onClick={() => zoomBy(1.25)} className="w-9 h-9 rounded-lg bg-[#111820]/90 border border-[#1A2332] text-[#9bb] hover:bg-[#1A2332] text-lg font-bold">+</button>
        <button onClick={() => zoomBy(0.8)} className="w-9 h-9 rounded-lg bg-[#111820]/90 border border-[#1A2332] text-[#9bb] hover:bg-[#1A2332] text-lg font-bold">−</button>
        <button onClick={resetView} className="w-9 h-9 rounded-lg bg-[#111820]/90 border border-[#1A2332] text-[#9bb] hover:bg-[#1A2332] text-xs font-bold">⟳</button>
      </div>
    </div>
  )
}
