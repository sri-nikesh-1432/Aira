'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Loader2, CheckCircle2, ArrowRight, Sparkles, Copy, Check,
  RotateCcw, Download, ChevronDown, ChevronRight, Zap, Clock,
  FileText, Code2, Layers, Palette, Rocket, Brain, Shield,
  TrendingUp, Search, Globe, AlertTriangle, Terminal, ChevronLeft,
} from 'lucide-react'
import { PLANETS, type PlanetId } from '@/types'
import { clsx } from 'clsx'

// ─── Planet-specific configurations ──────────────────────────────────────────

interface PlanetConfig {
  icon: any
  inputPlaceholder: string
  inputLabel: string
  promptSuggestions: string[]
  processSteps: string[]
  generateOutput: (input: string) => PlanetOutput
}

interface PlanetOutput {
  title: string
  summary: string
  sections: { heading: string; content: string }[]
  metrics?: { label: string; value: string; color: string }[]
  codeBlocks?: { language: string; code: string }[]
}

const PLANET_CONFIGS: Record<string, PlanetConfig> = {
  mercury: {
    icon: Search,
    inputLabel: 'Research Topic',
    inputPlaceholder: 'Enter a domain, technology, or problem space to research deeply...',
    promptSuggestions: [
      'Research the AI healthcare market for rural India — competitors, regulations, and technology landscape',
      'Analyze the current state of edge computing for MSME manufacturing',
      'Deep dive into multi-agent AI orchestration frameworks and their trade-offs',
    ],
    processSteps: [
      'Scanning knowledge base for domain context...',
      'Identifying key competitors and market players...',
      'Analyzing regulatory and compliance landscape...',
      'Evaluating technology stack options...',
      'Synthesizing research findings...',
      'Generating comprehensive intelligence report...',
    ],
    generateOutput: (input) => ({
      title: 'Research Intelligence Report',
      summary: `Deep analysis of "${input}" reveals a rapidly evolving landscape with significant opportunities for innovation and market entry.`,
      sections: [
        {
          heading: 'Market Overview',
          content: `The market for ${input} is projected to grow at a CAGR of 28.4% through 2030. Key drivers include increasing digitization, demand for intelligent automation, and MSME sector modernization. Total addressable market estimated at $47.2B globally, with $8.1B in South Asian markets.`,
        },
        {
          heading: 'Competitive Landscape',
          content: `Primary competitors include established enterprise players (40% market share), emerging startups (35%), and open-source alternatives (25%). Notable gaps exist in affordable, MSME-focused solutions with local language support and regulatory compliance built-in.`,
        },
        {
          heading: 'Technology Assessment',
          content: `Recommended technology stack: Multi-agent AI architecture with specialized micro-agents for domain tasks. Key technologies: LLM orchestration (GPT-4/Claude), vector databases for RAG, edge computing for latency-sensitive operations, and federated learning for privacy compliance.`,
        },
        {
          heading: 'Regulatory & Compliance',
          content: `Critical compliance areas: Data localization requirements (DPDP Act 2023), industry-specific certifications (ISO 27001, SOC 2), MSME-specific incentives (Udyam registration, MSME Samadhaan), and AI ethics guidelines from NITI Aayog.`,
        },
        {
          heading: 'Strategic Recommendations',
          content: `1. Focus on MSME-specific pain points with affordable pricing\n2. Build with local language support from day one\n3. Leverage government MSME incentive schemes\n4. Implement privacy-first architecture for regulatory compliance\n5. Create modular, extensible platform for rapid iteration`,
        },
      ],
      metrics: [
        { label: 'Market Size', value: '$47.2B', color: '#4B9CD3' },
        { label: 'CAGR', value: '28.4%', color: '#10B981' },
        { label: 'Competitors', value: '24', color: '#E8B86D' },
        { label: 'Confidence', value: '94%', color: '#6366F1' },
      ],
    }),
  },
  mars: {
    icon: Layers,
    inputLabel: 'System Requirements',
    inputPlaceholder: 'Describe the system you want to architect — components, scale, and constraints...',
    promptSuggestions: [
      'Architecture for a multi-agent AI platform serving 10K concurrent users',
      'Design a microservices system for real-time IoT sensor data processing',
      'Plan the backend architecture for an AI-powered marketplace',
    ],
    processSteps: [
      'Analyzing functional and non-functional requirements...',
      'Designing system components and data flow...',
      'Creating database schema and API contracts...',
      'Planning AI pipeline and model serving...',
      'Defining security architecture...',
      'Generating complete technical blueprint...',
    ],
    generateOutput: (input) => ({
      title: 'System Architecture Blueprint',
      summary: `Technical architecture for "${input}" designed for scalability, reliability, and maintainability with clear component boundaries.`,
      sections: [
        {
          heading: 'System Overview',
          content: `High-level architecture采用事件驱动微服务模式，核心组件包括：API Gateway (Kong/AWS ALB)、Auth Service (JWT + RBAC)、Core Business Services (3-5 bounded contexts)、AI Orchestration Layer、Data Pipeline, and Observability Stack.`,
        },
        {
          heading: 'Component Architecture',
          content: `Frontend: Next.js 14 with App Router + Tailwind CSS + Framer Motion\nAPI Layer: FastAPI (Python 3.11+) with async/await patterns\nAI Engine: LangChain/LangGraph for multi-agent orchestration\nDatabase: PostgreSQL 16 (primary) + Redis 7 (cache/sessions) + Pinecone (vector)\nMessage Queue: Redis Streams or Apache Kafka for event processing\nStorage: S3-compatible object storage for generated artifacts`,
        },
        {
          heading: 'Database Schema',
          content: `Core tables: users, projects, planet_outputs, planet_messages, files, deployments\nUUID primary keys, soft deletes, audit timestamps\nJSONB columns for flexible schema evolution\nRow-level security for multi-tenant isolation\nRead replicas for analytics workloads`,
        },
        {
          heading: 'API Design',
          content: `RESTful endpoints with OpenAPI 3.0 specification\nSSE streaming for real-time planet progress updates\nWebSocket connections for live collaboration\nRate limiting: 100 req/min per API key, 1000 for enterprise\nVersioning: URL-based (/api/v1/) with 6-month deprecation window`,
        },
        {
          heading: 'Security Architecture',
          content: `Zero-trust model with service mesh (Istio/Linkerd)\nEnd-to-end encryption (TLS 1.3 in transit, AES-256 at rest)\nOAuth 2.0 + OIDC for authentication\nRBAC with fine-grained permissions per planet role\nSOC 2 Type II compliance roadmap`,
        },
      ],
      metrics: [
        { label: 'Services', value: '12', color: '#CF4B2B' },
        { label: 'Max Latency', value: '<200ms', color: '#10B981' },
        { label: 'Uptime SLA', value: '99.95%', color: '#6366F1' },
        { label: 'Scale', value: '10K+', color: '#E8B86D' },
      ],
    }),
  },
  venus: {
    icon: Palette,
    inputLabel: 'Design Brief',
    inputPlaceholder: 'Describe the product experience — who uses it, what they feel, and what they see...',
    promptSuggestions: [
      'Design a premium AI dashboard that feels like talking to a genius assistant',
      'Create a mobile-first healthcare app interface for elderly patients',
      'Design a developer portal with beautiful API documentation and playground',
    ],
    processSteps: [
      'Defining brand identity and visual language...',
      'Creating color system and typography scale...',
      'Designing component library and patterns...',
      'Mapping user journeys and interactions...',
      'Crafting micro-animations and transitions...',
      'Delivering pixel-perfect design system...',
    ],
    generateOutput: (input) => ({
      title: 'Design System & Experience Guide',
      summary: `Complete design system for "${input}" — crafted for clarity, delight, and consistent premium experience across all touchpoints.`,
      sections: [
        {
          heading: 'Brand Identity',
          content: `Design Philosophy: "Invisible Intelligence" — Technology that feels natural, never forced. Visual approach combines the precision of Swiss design with the warmth of human-centered storytelling. Every interaction should feel like the product understands you.`,
        },
        {
          heading: 'Color System',
          content: `Primary: #6366F1 (Indigo 500) — Trust, intelligence, calm authority\nSecondary: #10B981 (Emerald 500) — Success, growth, positive action\nAccent: #F59E0B (Amber 500) — Energy, attention, warmth\nSurface: #09090B → #18181B → #27272A — Three-level depth system\nText: #FAFAFA (primary) → #A1A1AA (secondary) → #71717A (muted)`,
        },
        {
          heading: 'Typography',
          content: `Display: Inter (800) — Headlines and hero text, tracking: -0.03em\nBody: Inter (400-500) — Content and UI text, tracking: -0.01em\nCode: JetBrains Mono (400-500) — Code blocks and technical content\nScale: 11/13/15/18/24/32/48px — 7-step modular scale with 1.25 ratio`,
        },
        {
          heading: 'Component Library',
          content: `Core components (40+ tokens):\n• Buttons: Primary, Secondary, Ghost, Danger — each with hover, active, disabled states\n• Cards: Glass, Elevated, Interactive — with hover lift and border glow\n• Forms: Input, Select, Textarea, Checkbox, Radio — with focus ring animations\n• Navigation: Sidebar, Tabs, Breadcrumbs, Pagination\n• Feedback: Toast, Alert, Progress, Skeleton, Badge\n• Layout: Container, Grid, Stack, Divider`,
        },
        {
          heading: 'Motion & Animation',
          content: `Principles: Purposeful, Smooth, Consistent\nDuration scale: Instant (100ms) → Fast (200ms) → Normal (300ms) → Slow (500ms)\nEasing: cubic-bezier(0.4, 0, 0.2, 1) for enters, cubic-bezier(0, 0, 0.2, 1) for exits\nMicro-interactions: Button scale (0.98), Card lift (-2px), Fade-slide up (16px)\nPage transitions: Staggered children with 40ms delay per element`,
        },
      ],
      metrics: [
        { label: 'Components', value: '40+', color: '#E8B86D' },
        { label: 'Color Tokens', value: '24', color: '#6366F1' },
        { label: 'Accessibility', value: 'WCAG AA', color: '#10B981' },
        { label: 'Performance', value: '98/100', color: '#CF4B2B' },
      ],
    }),
  },
  earth: {
    icon: Code2,
    inputLabel: 'Feature Specification',
    inputPlaceholder: 'Describe the feature or application to build — tech stack, functionality, and requirements...',
    promptSuggestions: [
      'Build a real-time collaborative markdown editor with AI autocomplete',
      'Create a REST API for user management with JWT auth and RBAC',
      'Build a Next.js dashboard with charts, tables, and live data streaming',
    ],
    processSteps: [
      'Setting up project structure...',
      'Generating frontend components...',
      'Building backend API endpoints...',
      'Implementing database models...',
      'Adding authentication & authorization...',
      'Writing tests and documentation...',
    ],
    generateOutput: (input) => ({
      title: 'Production-Ready Codebase',
      summary: `Complete, working implementation for "${input}" — built with modern patterns, tested, documented, and ready to deploy.`,
      sections: [
        {
          heading: 'Project Structure',
          content: `project/\n├── frontend/\n│   ├── src/app/          # Next.js App Router pages\n│   ├── src/components/   # Reusable UI components\n│   ├── src/lib/          # Utilities and API clients\n│   └── src/types/        # TypeScript definitions\n├── backend/\n│   ├── api/              # FastAPI route handlers\n│   ├── models/           # SQLAlchemy ORM models\n│   ├── services/         # Business logic layer\n│   └── main.py           # Application entry point\n├── docker-compose.yml    # Container orchestration\n└── README.md             # Setup and documentation`,
        },
        {
          heading: 'Frontend Implementation',
          content: `Next.js 14 with App Router, TypeScript strict mode\nTailwind CSS with custom design tokens\nFramer Motion for page transitions and micro-interactions\nZustand for lightweight state management\nReact Query for server state and caching\nCustom hooks: useDebounce, useIntersectionObserver, useMediaQuery`,
        },
        {
          heading: 'Backend Implementation',
          content: `FastAPI with async/await throughout\nPydantic v2 for request/response validation\nSQLAlchemy 2.0 async with Alembic migrations\nJWT authentication with refresh tokens\nRole-based access control (RBAC)\nRate limiting and request validation middleware`,
        },
        {
          heading: 'Code Quality',
          content: `TypeScript strict mode — zero any types\nESLint + Prettier for consistent formatting\nPython: Ruff + Black for linting and formatting\n80%+ test coverage target\nCI/CD pipeline with automated quality gates`,
        },
      ],
      codeBlocks: [
        {
          language: 'typescript',
          code: `// Example: API route handler
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  techStack: z.array(z.string()).default(['nextjs', 'fastapi']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const validated = ProjectSchema.parse(body)
  
  const project = await db.project.create({ data: validated })
  
  return NextResponse.json(project, { status: 201 })
}`,
        },
      ],
      metrics: [
        { label: 'Files', value: '47', color: '#4B9CD3' },
        { label: 'Type Safety', value: '100%', color: '#6366F1' },
        { label: 'Test Coverage', value: '82%', color: '#10B981' },
        { label: 'Build Time', value: '3.2s', color: '#E8B86D' },
      ],
    }),
  },
  jupiter: {
    icon: TrendingUp,
    inputLabel: 'Business Concept',
    inputPlaceholder: 'Describe your business idea — market, revenue model, and competitive advantage...',
    promptSuggestions: [
      'Business plan for an AI-powered MSME advisory platform in India',
      'Go-to-market strategy for a multi-agent developer productivity tool',
      'Revenue model and financial projections for a SaaS marketplace',
    ],
    processSteps: [
      'Analyzing market opportunity and sizing...',
      'Defining business model and revenue streams...',
      'Creating competitive positioning...',
      'Building financial projections...',
      'Designing go-to-market strategy...',
      'Preparing investor pitch narrative...',
    ],
    generateOutput: (input) => ({
      title: 'Business Strategy & Pitch Deck',
      summary: `Comprehensive business strategy for "${input}" — from market validation to investor-ready financial projections with clear path to $10M ARR.`,
      sections: [
        {
          heading: 'Market Opportunity',
          content: `TAM: $120B (Global AI for Business)\nSAM: $18B (South Asian MSME AI Tools)\nSOM: $180M (Initial target segments)\nGrowth drivers: 63M MSMEs in India, <5% AI adoption, government Digital India push.\nTime-to-market advantage: 12-18 months ahead of enterprise competitors in MSME segment.`,
        },
        {
          heading: 'Business Model',
          content: `Freemium + Usage-based hybrid model:\n• Free tier: 5 projects/month, 3 agents, community support\n• Pro ($49/mo): Unlimited projects, all 10 agents, priority support\n• Enterprise ($299/mo): Custom agents, SLA, dedicated support, on-premise option\n• Usage: $0.01 per 1K tokens beyond included quota\nTarget: 5,000 Pro users = $2.94M ARR, 50 Enterprise = $179K MRR`,
        },
        {
          heading: 'Competitive Position',
          content: `Differentiators:\n1. Multi-agent orchestration (vs single AI tools)\n2. MSME-first pricing (vs enterprise-only competitors)\n3. End-to-end: research → deploy (vs point solutions)\n4. Local language + compliance built-in\n5. Open architecture — users can add custom agents`,
        },
        {
          heading: 'Financial Projections',
          content: `Year 1: $280K ARR (500 users), -$1.2M net (investment phase)\nYear 2: $2.4M ARR (4,000 users), breakeven Q4\nYear 3: $12M ARR (15,000 users), $4.2M net profit\nKey metrics target: LTV/CAC > 5x, Churn < 5%, NRR > 120%`,
        },
        {
          heading: 'Go-to-Market',
          content: `Phase 1 (Month 1-3): Launch on Product Hunt, Hacker News, dev communities\nPhase 2 (Month 4-6): MSME partnership program with CAs and business consultants\nPhase 3 (Month 7-12): Enterprise pilots with 3-5 design partners\nPhase 4 (Year 2): Channel partnerships, conference presence, case studies`,
        },
      ],
      metrics: [
        { label: 'TAM', value: '$120B', color: '#C8A951' },
        { label: 'Year 3 ARR', value: '$12M', color: '#10B981' },
        { label: 'LTV/CAC', value: '5.2x', color: '#6366F1' },
        { label: 'Payback', value: '8 mo', color: '#CF4B2B' },
      ],
    }),
  },
  saturn: {
    icon: FileText,
    inputLabel: 'Document Topic',
    inputPlaceholder: 'What documentation, report, or presentation do you need created...',
    promptSuggestions: [
      'Create a technical architecture document for a multi-agent AI platform',
      'Write judge preparation Q&A for a hackathon presentation',
      'Generate comprehensive API documentation with examples',
    ],
    processSteps: [
      'Analyzing source material and context...',
      'Structuring document hierarchy...',
      'Writing executive summary...',
      'Creating detailed technical sections...',
      'Adding diagrams and visual references...',
      'Polishing and formatting final deliverable...',
    ],
    generateOutput: (input) => ({
      title: 'Professional Documentation Suite',
      summary: `Complete documentation package for "${input}" — structured, clear, and ready for technical and non-technical audiences.`,
      sections: [
        {
          heading: 'Executive Summary',
          content: `This document provides a comprehensive overview of ${input}, covering system architecture, key features, technical implementation, and deployment strategy. Designed for stakeholders ranging from technical leads to business executives, it balances depth with accessibility.`,
        },
        {
          heading: 'Technical Overview',
          content: `System Architecture: Multi-agent orchestration platform built on microservices architecture\nFrontend: React/Next.js with TypeScript, Tailwind CSS, Framer Motion\nBackend: Python FastAPI with async processing\nAI Layer: LLM-powered agents with tool-use capabilities\nData: PostgreSQL + Redis + Vector database\nInfrastructure: Docker + Kubernetes with auto-scaling`,
        },
        {
          heading: 'Feature Documentation',
          content: `1. Multi-Agent Orchestration: 10 specialized AI agents working in parallel\n2. Real-time Streaming: SSE-based live progress updates\n3. Project Management: Full lifecycle from ideation to deployment\n4. File Generation: Automated code, docs, and configuration creation\n5. Live Preview: Instant preview of generated applications\n6. Quality Assurance: Automated testing and security scanning`,
        },
        {
          heading: 'API Reference',
          content: `Authentication: Bearer token (JWT)\nBase URL: /api/v1/\n\nPOST /projects — Create new project\nGET /projects/:id — Get project status\nGET /projects/:id/stream — SSE event stream\nGET /projects/:id/files — List generated files\nPOST /projects/:id/preview/start — Boot live preview\nGET /health — System health check`,
        },
        {
          heading: 'Deployment Guide',
          content: `Prerequisites: Docker 24+, 8GB RAM, 50GB storage\n\nQuick Start:\n1. Clone repository\n2. Copy .env.example to .env and configure\n3. Run: docker-compose up -d\n4. Access: http://localhost:5174\n\nProduction: Kubernetes deployment with Helm charts, auto-scaling, and monitoring.`,
        },
      ],
      metrics: [
        { label: 'Pages', value: '32', color: '#A89070' },
        { label: 'Diagrams', value: '8', color: '#6366F1' },
        { label: 'API Endpoints', value: '24', color: '#10B981' },
        { label: 'Accuracy', value: '99%', color: '#E8B86D' },
      ],
    }),
  },
  neptune: {
    icon: Shield,
    inputLabel: 'System Under Test',
    inputPlaceholder: 'Describe the system or feature to test — scope, concerns, and priorities...',
    promptSuggestions: [
      'QA plan for a multi-agent AI platform with real-time streaming',
      'Security audit scope for an API handling sensitive healthcare data',
      'Performance testing strategy for a SaaS with 10K concurrent users',
    ],
    processSteps: [
      'Designing comprehensive test strategy...',
      'Creating test cases and scenarios...',
      'Running security vulnerability scan...',
      'Performing load and stress testing...',
      'Validating AI output quality...',
      'Generating QA certification report...',
    ],
    generateOutput: (input) => ({
      title: 'Quality Assurance & Security Report',
      summary: `Comprehensive QA assessment for "${input}" — covering functional testing, security audit, performance benchmarks, and production readiness certification.`,
      sections: [
        {
          heading: 'Test Strategy',
          content: `Testing Pyramid: Unit (70%) → Integration (20%) → E2E (10%)\nAutomation Target: 85% of regression suite automated\nCI Integration: Every PR runs full test suite in <5 minutes\nPerformance Baseline: P95 latency <200ms, error rate <0.1%\nSecurity: OWASP Top 10 coverage, dependency scanning, SAST/DAST`,
        },
        {
          heading: 'Security Assessment',
          content: `Authentication: ✅ JWT with refresh tokens, secure httpOnly cookies\nAuthorization: ✅ RBAC with principle of least privilege\nInput Validation: ✅ Zod/Pydantic schema validation on all endpoints\nSQL Injection: ✅ Parameterized queries, ORM-level protection\nXSS Prevention: ✅ CSP headers, DOMPurify for user content\nRate Limiting: ✅ Per-user and per-endpoint limits configured\nDependencies: ⚠️ 2 medium-severity CVEs in transitive dependencies (remediation in progress)`,
        },
        {
          heading: 'Performance Benchmarks',
          content: `API Response Times (P95):\n  GET /projects: 45ms ✅\n  POST /projects: 120ms ✅\n  SSE Stream Init: 80ms ✅\n  File Upload (10MB): 1.2s ✅\n\nThroughput: 850 req/s sustained, 1200 req/s peak ✅\nMemory: Stable at 2.1GB under load ✅\nCPU: 35% average, 62% peak ✅`,
        },
        {
          heading: 'Test Results Summary',
          content: `Total Test Cases: 847\n  Passed: 831 (98.1%)\n  Failed: 3 (0.4% — all in edge-case Unicode handling)\n  Skipped: 13 (1.5% — pending API mock setup)\n\nCode Coverage:\n  Statements: 84.2% ✅\n  Branches: 76.8% ✅\n  Functions: 88.1% ✅\n  Lines: 83.7% ✅`,
        },
        {
          heading: 'Certification',
          content: `Overall Status: ✅ PRODUCTION READY (with minor remediation)\nQuality Score: 92/100\n\nRequired before launch:\n1. Fix 3 failing test cases (Unicode edge cases)\n2. Update 2 vulnerable dependencies\n3. Add retry logic for external API calls\n\nRecommended enhancements:\n1. Add integration tests for payment flow\n2. Implement distributed tracing\n3. Add chaos engineering tests`,
        },
      ],
      metrics: [
        { label: 'Test Cases', value: '847', color: '#4B7BE8' },
        { label: 'Pass Rate', value: '98.1%', color: '#10B981' },
        { label: 'Coverage', value: '84.2%', color: '#6366F1' },
        { label: 'Score', value: '92/100', color: '#E8B86D' },
      ],
    }),
  },
  uranus: {
    icon: Zap,
    inputLabel: 'Mission to Analyze',
    inputPlaceholder: 'Describe a completed project or pattern to learn from and optimize...',
    promptSuggestions: [
      'Analyze patterns from our last 5 AI platform deployments for optimization',
      'Extract lessons from failed startup MVPs to improve future projects',
      'Review prompt engineering patterns across different LLM use cases',
    ],
    processSteps: [
      'Collecting mission data and outcomes...',
      'Identifying recurring patterns...',
      'Extracting optimization insights...',
      'Building improvement recommendations...',
      'Creating reusable knowledge artifacts...',
      'Delivering evolution playbook...',
    ],
    generateOutput: (input) => ({
      title: 'Evolution & Optimization Report',
      summary: `Meta-analysis of "${input}" — identifying patterns, extracting insights, and creating actionable recommendations for continuous improvement.`,
      sections: [
        {
          heading: 'Pattern Analysis',
          content: `Identified 12 recurring patterns across analyzed missions:\n\n1. OVER-ENGINEERING PATTERN: 67% of projects started with unnecessary complexity. Fix: Start with the simplest viable architecture.\n\n2. LATE TESTING PATTERN: QA introduced in final 20% of timeline. Fix: Test-first approach from sprint 1.\n\n3. SCOPE CREEP PATTERN: 43% of projects exceeded initial scope by >50%. Fix: Strict MVP definition with explicit boundaries.\n\n4. COMMUNICATION GAP PATTERN: Cross-planet information loss in 38% of handoffs. Fix: Structured output contracts between agents.`,
        },
        {
          heading: 'Prompt Optimization',
          content: `LLM Prompt Performance Analysis:\n\nBest-performing patterns:\n• Chain-of-thought with structured output: 94% accuracy\n• Role-based prompting (planet personas): 91% relevance\n• Few-shot examples with domain context: 89% quality\n\nNeeds improvement:\n• Ambiguous requirements → 23% rework rate. Fix: Mandatory clarification step.\n• Multi-step reasoning → 31% error accumulation. Fix: Validation checkpoints.`,
        },
        {
          heading: 'Architecture Insights',
          content: `Key learnings for future system design:\n\n1. Event-driven > request-response for multi-agent coordination\n2. Immutable message logs prevent state inconsistency\n3. Circuit breakers essential for LLM API dependencies\n4. Vector caching reduces redundant embeddings by 60%\n5. Graceful degradation > hard failure for AI services`,
        },
        {
          heading: 'Optimization Playbook',
          content: `Priority 1 — Immediate (Next Sprint):\n• Implement output validation between planet handoffs\n• Add retry + fallback for LLM API calls\n• Standardize error response format across services\n\nPriority 2 — Short-term (Next Month):\n• Build prompt template versioning system\n• Create automated benchmark suite for agent outputs\n• Implement cost tracking per project per planet\n\nPriority 3 — Long-term (Next Quarter):\n• Self-improving prompt optimization via feedback loops\n• Cross-project learning database\n• Automated architecture decision records`,
        },
      ],
      metrics: [
        { label: 'Patterns Found', value: '12', color: '#7EC8C8' },
        { label: 'Optimization', value: '+34%', color: '#10B981' },
        { label: 'Cost Savings', value: '$2.1K', color: '#C8A951' },
        { label: 'Accuracy ↑', value: '8.2%', color: '#6366F1' },
      ],
    }),
  },
  pluto: {
    icon: Rocket,
    inputLabel: 'Deployment Target',
    inputPlaceholder: 'Describe what to deploy — infrastructure, environment, and operational requirements...',
    promptSuggestions: [
      'Deploy a Next.js + FastAPI stack to AWS with auto-scaling',
      'Set up CI/CD pipeline for a microservices architecture on Kubernetes',
      'Configure production monitoring and alerting for an AI platform',
    ],
    processSteps: [
      'Analyzing deployment requirements...',
      'Creating Docker configurations...',
      'Setting up CI/CD pipeline...',
      'Configuring infrastructure as code...',
      'Implementing monitoring and alerting...',
      'Generating deployment runbook...',
    ],
    generateOutput: (input) => ({
      title: 'Deployment & Operations Package',
      summary: `Complete deployment configuration for "${input}" — Docker, CI/CD, infrastructure, monitoring, and runbooks ready for production.`,
      sections: [
        {
          heading: 'Docker Configuration',
          content: `Multi-stage Dockerfiles for optimized builds:\n\nfrontend/Dockerfile:\n  Stage 1 (deps): Node 20 Alpine, install dependencies\n  Stage 2 (build): Build Next.js static export\n  Stage 3 (serve): Nginx Alpine, serve static files\n  Final image: ~45MB (vs ~1.2GB unoptimized)\n\nbackend/Dockerfile:\n  Stage 1 (deps): Python 3.11 Slim, pip install\n  Stage 2 (runtime): Python 3.11 Slim + non-root user\n  Final image: ~180MB\n\ndocker-compose.yml: Orchestrates frontend, backend, postgres, redis`,
        },
        {
          heading: 'CI/CD Pipeline',
          content: `GitHub Actions workflow (.github/workflows/deploy.yml):\n\n1. LINT: ESLint + Ruff + Prettier check (<2 min)\n2. TEST: Unit + integration tests with coverage (<5 min)\n3. BUILD: Multi-platform Docker builds (<3 min)\n4. SECURITY: Trivy container scan + dependency audit (<2 min)\n5. STAGING: Deploy to staging, run E2E tests (<5 min)\n6. PRODUCTION: Blue-green deployment with health checks\n\nTotal pipeline: ~17 min from push to production\nRollback: Automatic on health check failure`,
        },
        {
          heading: 'Infrastructure',
          content: `AWS ECS Fargate (primary):\n  Frontend: 2 tasks, 0.5 vCPU / 1GB RAM, auto-scale 2-8\n  Backend: 2 tasks, 1 vCPU / 2GB RAM, auto-scale 2-12\n  Postgres: RDS db.t4g.medium, Multi-AZ\n  Redis: ElastiCache cache.t4g.micro\n  S3: Static assets + generated files\n  CloudFront: CDN with custom domain + SSL\n\nMonthly cost estimate: ~$380/mo (baseline), ~$850/mo (peak)`,
        },
        {
          heading: 'Monitoring & Alerting',
          content: `Observability Stack:\n  Metrics: Prometheus + Grafana dashboards\n  Logs: CloudWatch + structured JSON logging\n  Traces: OpenTelemetry → Jaeger\n  Alerts: PagerDuty integration\n\nKey Alerts:\n  🔴 P1: Error rate >1% for 5 min → page on-call\n  🟡 P2: P95 latency >500ms for 10 min → Slack notification\n  🟢 P3: CPU >80% for 15 min → auto-scale trigger\n  📊 Dashboard: Real-time request rate, error rate, latency percentiles`,
        },
        {
          heading: 'Operations Runbook',
          content: `Incident Response:\n1. Alert fires → Check Grafana dashboard for context\n2. If service down → Restart via ECS console or CLI\n3. If database issue → Check RDS metrics, consider failover\n4. If deployment issue → Rollback to previous task definition\n\nScaling Procedures:\n  Manual: aws ecs update-service --desired-count N\n  Auto: Configured via Application Auto Scaling policy\n\nBackup Schedule:\n  Database: Daily automated snapshots, 30-day retention\n  Files: S3 cross-region replication\n  Config: Git version control (infrastructure as code)`,
        },
      ],
      metrics: [
        { label: 'Image Size', value: '45MB', color: '#9B8EAE' },
        { label: 'Deploy Time', value: '17min', color: '#10B981' },
        { label: 'Uptime', value: '99.95%', color: '#6366F1' },
        { label: 'Cost/mo', value: '$380', color: '#E8B86D' },
      ],
    }),
  },
}

// ─── Animated Processing Visualization ──────────────────────────────────────

function ProcessingVisualization({ steps, currentStep, planet }: {
  steps: string[]
  currentStep: number
  planet: typeof PLANETS[0]
}) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300"
            style={{
              background: isActive ? `${planet.color}08` : 'transparent',
              borderLeft: isActive ? `2px solid ${planet.color}` : '2px solid transparent',
            }}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: planet.color }} />
              ) : (
                <div className="w-2 h-2 rounded-full" style={{ background: '#27272A' }} />
              )}
            </div>
            <p className={clsx(
              'text-xs transition-colors duration-300',
              isActive ? 'font-medium' : isDone ? 'opacity-60' : 'opacity-30'
            )}
              style={{ color: isActive ? planet.color : '#A1A1AA' }}
            >
              {step}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Output Section Renderer ─────────────────────────────────────────────────

function OutputSection({ section, index, planet }: {
  section: { heading: string; content: string }
  index: number
  planet: typeof PLANETS[0]
}) {
  const [expanded, setExpanded] = useState(index < 3)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
               style={{ background: `${planet.color}12`, color: planet.color }}>
            {index + 1}
          </div>
          <span className="text-sm font-semibold" style={{ color: '#E4E4E7' }}>
            {section.heading}
          </span>
        </div>
        <ChevronDown className={clsx(
          'w-3.5 h-3.5 transition-transform duration-200',
          expanded && 'rotate-180'
        )} style={{ color: '#52525B' }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#A1A1AA' }}>
                {section.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Interactive Planet Canvas ───────────────────────────────────────────────

function PlanetCanvas({ planet, isProcessing, progress }: {
  planet: typeof PLANETS[0]
  isProcessing: boolean
  progress: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.setTransform(2, 0, 0, 2, 0, 0)
    }
    resize()

    const W = canvas.width / 2
    const H = canvas.height / 2
    const cx = W / 2
    const cy = H / 2

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = []

    let time = 0
    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.015

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.015)'
      ctx.lineWidth = 0.5
      const gridSize = 40
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Central planet glow
      const glowR = 60 + Math.sin(time * 2) * 5
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      glow.addColorStop(0, planet.color + '20')
      glow.addColorStop(0.5, planet.color + '08')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Planet rings
      for (let i = 0; i < 3; i++) {
        const r = 30 + i * 20
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = planet.color + (isProcessing ? '25' : '10')
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // Orbiting dots
      if (isProcessing) {
        const count = 8
        for (let i = 0; i < count; i++) {
          const angle = (time * 0.8) + (i / count) * Math.PI * 2
          const orbitR = 40 + i * 12
          const x = cx + Math.cos(angle) * orbitR
          const y = cy + Math.sin(angle) * orbitR
          const r = 2 + Math.sin(time + i) * 1

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = planet.color + '88'
          ctx.fill()

          // Trail
          for (let t = 1; t <= 4; t++) {
            const ta = angle - t * 0.08
            const tx = cx + Math.cos(ta) * orbitR
            const ty = cy + Math.sin(ta) * orbitR
            ctx.beginPath()
            ctx.arc(tx, ty, r * (1 - t * 0.2), 0, Math.PI * 2)
            ctx.fillStyle = planet.color + `${Math.round((1 - t * 0.25) * 40)}`
            ctx.fill()
          }
        }

        // Spawn particles
        if (Math.random() < 0.3) {
          const angle = Math.random() * Math.PI * 2
          particles.push({
            x: cx + Math.cos(angle) * 20,
            y: cy + Math.sin(angle) * 20,
            vx: Math.cos(angle) * (0.5 + Math.random() * 1.5),
            vy: Math.sin(angle) * (0.5 + Math.random() * 1.5),
            life: 0,
            maxLife: 60 + Math.random() * 40,
          })
        }
      }

      // Animate particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }
        const alpha = 1 - p.life / p.maxLife
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5 * alpha, 0, Math.PI * 2)
        ctx.fillStyle = planet.color + Math.round(alpha * 100).toString(16).padStart(2, '0')
        ctx.fill()
      }

      // Progress arc
      if (isProcessing || progress > 0) {
        const arcR = 70
        const endAngle = -Math.PI / 2 + (progress / 100) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx, cy, arcR, -Math.PI / 2, endAngle)
        ctx.strokeStyle = planet.color + '60'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()

        // Progress indicator dot
        const px = cx + Math.cos(endAngle) * arcR
        const py = cy + Math.sin(endAngle) * arcR
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()
      }

      // Central planet symbol
      ctx.font = '28px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(planet.symbol, cx, cy)

      // Planet name
      ctx.font = '700 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = planet.color
      ctx.fillText(planet.name, cx, cy + 50)

      // Role subtitle
      ctx.font = '400 11px Inter, sans-serif'
      ctx.fillStyle = '#52525B'
      ctx.fillText(planet.role, cx, cy + 68)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => cancelAnimationFrame(animRef.current)
  }, [planet, isProcessing, progress])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: '300px' }}
    />
  )
}

// ─── Main Workspace Component ────────────────────────────────────────────────

export default function PlanetWorkspace({ planetId }: { planetId: PlanetId }) {
  const planet = PLANETS.find(p => p.id === planetId)
  const config = PLANET_CONFIGS[planetId]
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [output, setOutput] = useState<PlanetOutput | null>(null)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<{ input: string; output: PlanetOutput; timestamp: Date }[]>([])
  const processingRef = useRef<NodeJS.Timeout | null>(null)

  if (!planet || !config) return null

  const Icon = config.icon

  const startProcessing = useCallback(() => {
    if (!input.trim()) return

    setIsProcessing(true)
    setCurrentStep(0)
    setOutput(null)
    setProgress(0)

    let step = 0
    const totalSteps = config.processSteps.length

    const advance = () => {
      step++
      setCurrentStep(step)
      setProgress(Math.round((step / totalSteps) * 100))

      if (step < totalSteps) {
        processingRef.current = setTimeout(advance, 800 + Math.random() * 600)
      } else {
        // Generate output
        setTimeout(() => {
          const result = config.generateOutput(input)
          setOutput(result)
          setIsProcessing(false)
          setProgress(100)
          setHistory(prev => [{ input, output: result, timestamp: new Date() }, ...prev])
        }, 500)
      }
    }

    processingRef.current = setTimeout(advance, 1000 + Math.random() * 500)
  }, [input, config])

  const handleReset = () => {
    if (processingRef.current) clearTimeout(processingRef.current)
    setInput('')
    setIsProcessing(false)
    setCurrentStep(-1)
    setOutput(null)
    setProgress(0)
  }

  const handleCopy = () => {
    if (!output) return
    const text = `# ${output.title}\n\n${output.summary}\n\n${output.sections.map(s => `## ${s.heading}\n\n${s.content}`).join('\n\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Hero Canvas + Planet Identity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Canvas */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <PlanetCanvas planet={planet} isProcessing={isProcessing} progress={progress} />
            </div>

            {/* Planet Info + Input */}
            <div className="flex flex-col gap-4">
              {/* Planet Identity Card */}
              <div className="rounded-2xl p-5"
                   style={{ background: `${planet.color}05`, border: `1px solid ${planet.color}12` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                       style={{ background: `${planet.color}15`, border: `1px solid ${planet.color}25` }}>
                    {planet.symbol}
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: planet.color }}>{planet.name}</h2>
                    <p className="text-[11px]" style={{ color: '#52525B' }}>{planet.title}</p>
                  </div>
                </div>
                <p className="text-xs italic leading-relaxed" style={{ color: planet.color, opacity: 0.7 }}>
                  &ldquo;{planet.motto}&rdquo;
                </p>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: '#71717A' }}>
                  {planet.personality}
                </p>
              </div>

              {/* Input Area */}
              <div className="rounded-2xl p-4"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block"
                       style={{ color: '#52525B' }}>
                  {config.inputLabel}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={config.inputPlaceholder}
                  rows={4}
                  disabled={isProcessing}
                  className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-[#27272A] leading-relaxed"
                  style={{ color: '#E4E4E7' }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={startProcessing}
                    disabled={!input.trim() || isProcessing}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all',
                      (!input.trim() || isProcessing)
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:scale-[1.02] hover:shadow-lg text-white'
                    )}
                    style={{
                      background: (!input.trim() || isProcessing) ? '#18181B' : planet.color,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Run {planet.name}
                      </>
                    )}
                  </button>
                  {(isProcessing || output) && (
                    <button
                      onClick={handleReset}
                      className="p-2.5 rounded-xl transition-all hover:bg-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" style={{ color: '#52525B' }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt Suggestions */}
              {!isProcessing && !output && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold"
                     style={{ color: '#3F3F46' }}>
                    Try these
                  </p>
                  {config.promptSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.04]"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', color: '#71717A' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Processing Steps */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-8 rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: planet.color }} />
                  <h3 className="text-sm font-semibold" style={{ color: planet.color }}>
                    {planet.name} is working...
                  </h3>
                  <span className="text-[11px] ml-auto tabular-nums" style={{ color: '#52525B' }}>
                    {progress}%
                  </span>
                </div>
                <ProcessingVisualization
                  steps={config.processSteps}
                  currentStep={currentStep}
                  planet={planet}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Output Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                    <h3 className="text-lg font-bold" style={{ color: '#E4E4E7' }}>
                      {output.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {copied ? <Check className="w-3 h-3" style={{ color: '#10B981' }} /> : <Copy className="w-3 h-3" style={{ color: '#71717A' }} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                {output.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {output.metrics.map((metric, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl p-4 text-center"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <p className="text-xl font-bold tabular-nums" style={{ color: metric.color }}>
                          {metric.value}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider mt-1 font-medium"
                           style={{ color: '#52525B' }}>
                          {metric.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-xl p-4"
                     style={{ background: `${planet.color}05`, border: `1px solid ${planet.color}10` }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                    {output.summary}
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-2">
                  {output.sections.map((section, i) => (
                    <OutputSection key={i} section={section} index={i} planet={planet} />
                  ))}
                </div>

                {/* Code Blocks */}
                {output.codeBlocks && output.codeBlocks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#52525B' }}>
                      Code Examples
                    </h4>
                    {output.codeBlocks.map((block, i) => (
                      <div key={i} className="rounded-xl overflow-hidden"
                           style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]"
                             style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-[10px] uppercase tracking-wider font-medium"
                                style={{ color: '#52525B' }}>
                            {block.language}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(block.code)
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                            }}
                            className="text-[10px] px-2 py-0.5 rounded hover:bg-white/[0.06] transition-colors"
                            style={{ color: '#52525B' }}
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed"
                             style={{ color: '#A1A1AA', background: 'transparent', border: 'none' }}>
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice quote */}
                <div className="rounded-xl p-4 text-center"
                     style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <p className="text-xs italic" style={{ color: planet.color, opacity: 0.6 }}>
                    &ldquo;{planet.voice[Math.floor(Math.random() * planet.voice.length)]}&rdquo;
                  </p>
                  <p className="text-[10px] mt-1.5 font-semibold" style={{ color: '#3F3F46' }}>
                    — {planet.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 1 && (
            <div className="mt-12 pt-8 border-t border-white/[0.04]">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: '#3F3F46' }}>
                Previous Runs
              </h3>
              <div className="space-y-2">
                {history.slice(1).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(item.input)
                      setOutput(item.output)
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-white/[0.03]"
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <p className="text-xs truncate" style={{ color: '#71717A' }}>{item.input}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#3F3F46' }}>
                      {item.output.title} — {item.timestamp.toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
