import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const PLANET_COLORS: Record<string, string> = {
  sun: "#FFD700",
  mercury: "#A0A0A0",
  venus: "#E8CDA0",
  earth: "#4A90D9",
  mars: "#CD5C5C",
  jupiter: "#DAA06D",
  saturn: "#F4D03F",
  uranus: "#73C2FB",
  neptune: "#3F51B5",
  pluto: "#C4A35A",
  luna: "#E8E8E8",
};

export const PLANET_EMOJIS: Record<string, string> = {
  sun: "☀️",
  mercury: "☿",
  venus: "♀",
  earth: "🌍",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "🪐",
  luna: "🌑",
};

export const AGENT_NAMES: Record<string, string> = {
  mercury: "Mercury — Research Intelligence",
  venus: "Venus — Design Intelligence",
  earth: "Earth — Development Intelligence",
  mars: "Mars — Engineering Intelligence",
  jupiter: "Jupiter — Business Intelligence",
  saturn: "Saturn — Documentation Intelligence",
  uranus: "Uranus — Communication Intelligence",
  neptune: "Neptune — Testing Intelligence",
  pluto: "Pluto — Deployment Intelligence",
  luna: "Luna — Memory Intelligence",
};

export function getAgentResponse(agentId: string, message: string): string {
  const responses: Record<string, string> = {
    mercury: `☿ Mercury Research: Analyzing "${message.substring(0, 50)}..." — I've scanned 15 patent databases, 8 competitor platforms, and 42 research papers. The market intelligence suggests strong potential with a 73% success correlation to similar innovations. Key findings include:\n\n• Patent Landscape: 3 existing patents with differentiation opportunities\n• Market Gap: Underserved segment with ₹200Cr+ potential\n• Technology Readiness: TRL 6-7 with current stack\n• Recommended Approach: Build MVP with focus on core differentiator`,
    venus: `♀ Venus Design: For "${message.substring(0, 30)}..." I recommend a modern glassmorphism interface with subtle micro-interactions. The experience should feel like:\n\n• Primary: Clean, spacious layouts with depth\n• Interactions: Smooth transitions with purpose\n• Accessibility: WCAG 2.2 AA compliant throughout\n• Mobile: Responsive with thumb-friendly targets\n• Branding: Professional with innovative edge`,
    earth: `🌍 Earth Development: Architecture plan for "${message.substring(0, 30)}..."\n\n• Frontend: React + TypeScript + Tailwind CSS\n• Backend: FastAPI with async endpoints\n• Database: PostgreSQL for structured data, Redis for cache\n• Auth: JWT-based with OAuth2 integration\n• DevOps: Docker + GitHub Actions CI/CD\n\nEstimated build time: 4-6 weeks with a team of 3`,
    mars: `♂ Mars Engineering: System Architecture for "${message.substring(0, 30)}..."\n\n• Pattern: Microservices with event-driven communication\n• API Gateway: Rate-limited, authenticated, versioned\n• AI Pipeline: RAG-based with vector embeddings\n• Scaling: Horizontal with auto-scaling groups\n• Security: End-to-end encryption, WAF, DDoS protection\n• Monitoring: Prometheus + Grafana dashboard`,
    jupiter: `♃ Jupiter Business Analysis: "${message.substring(0, 30)}..."\n\n• Market: TAM ₹500Cr, SAM ₹150Cr, SOM ₹45Cr\n• Model: SaaS Freemium → Pro ₹999/mo → Enterprise custom\n• Unit Economics: CAC ₹2,500, LTV ₹45,000, LTV/CAC 18x\n• Break-even: Month 14 with 200 paying users\n• Funding: Seed ₹75L, Series A ₹5Cr at 18 months`,
    saturn: `♄ Saturn Documentation: Generating comprehensive documentation package for "${message.substring(0, 30)}..."\n\n✓ Technical Report (40+ pages)\n✓ User Manual (15+ pages)\n✓ API Documentation (OpenAPI 3.0)\n✓ README with badges and screenshots\n✓ Deployment Guide\n✓ 25-slide Professional Presentation\n✓ MSME Submission Package`,
    uranus: `♅ Uranus Communication: Ready for "${message.substring(0, 30)}..."\n\nI can help with:\n• Mock Interview: Simulate judge panel with scoring\n• Pitch Practice: Timed presentation with feedback\n• Voice Demo: Generate AI narration for your pitch\n• Q&A Prep: Anticipate 20+ judge questions\n• Demo Script: Step-by-step walkthrough`,
    neptune: `♆ Neptune QA: Testing "${message.substring(0, 30)}..."\n\n• Unit Tests: 92% coverage across core modules\n• Integration: All API endpoints verified (24/24 pass)\n• Security: No critical vulnerabilities (SAST + DAST)\n• Performance: Load test at 1000 concurrent users — p95 230ms\n• AI Validation: Hallucination score 2.3% — below 5% threshold\n• Accessibility: WCAG 2.2 AA achieved`,
    pluto: `🪐 Pluto Deployment: Pipeline ready for "${message.substring(0, 30)}..."\n\n• Container: Multi-stage Docker build (142MB optimized)\n• CI/CD: GitHub Actions → Test → Build → Deploy\n• Infrastructure: Auto-scaling on AWS ECS Fargate\n• Domain: SSL/TLS with automatic renewal\n• Monitoring: Uptime alerts, error tracking, usage analytics\n• Backup: Daily snapshots with 30-day retention`,
    luna: `🌑 Luna Memory: "${message.substring(0, 30)}..." connected to knowledge graph.\n\n• Related Projects: 3 similar patterns identified\n• User Preferences: Applied from past interactions\n• Knowledge Links: Connected to 12 relevant topics\n• Continuity: Session context preserved\n• Learning: New patterns extracted for future optimization`,
  };
  return responses[agentId] || `☀️ AIRA: Processing your request through the multi-agent pipeline. All systems operational.`;
}
