'use client'

import { OfficeWorld } from './OfficeWorld'
import type { AgentId } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICE CANVAS — thin wrapper around the living company world renderer.
// Renders the entire dynamic world: villa, mansion, dormitory, office, roads,
// mailbox, helipad and human employees, all driven by real backend events.
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeCanvas({ onAgentClick }: { onAgentClick?: (agent: AgentId) => void }) {
  return <OfficeWorld onAgentClick={onAgentClick} />
}
