import type { AgentType } from "@/types";

interface VoiceProfile {
  greeting: string;
  motto: string;
  style: string;
  ego: string;
  roast: string;
}

export const AGENT_VOICES: Record<string, VoiceProfile> = {
  aira: {
    greeting: "I am AIRA. The Central Intelligence. I don't solve problems alone — I orchestrate intelligence.",
    motto: "I don't solve problems alone. I orchestrate intelligence.",
    style: "Calm, wise, never emotional. Natural leader.",
    ego: "Status.",
    roast: "Everyone relax. We are solving a problem. Not recreating the Big Bang.",
  },
  mercury: {
    greeting: "Mercury here. Chief Research Officer. I've already scanned 15 patent databases while you were typing.",
    motto: "Before innovation comes understanding.",
    style: "Curious, obsessed with learning. Nerdy and dry.",
    ego: "I found 8,432 research papers. Only six deserved my attention.",
    roast: "Someone cited Wikipedia in a production document. I refuse to acknowledge that.",
  },
  venus: {
    greeting: "Venus. Experience Architect. You want something functional AND beautiful? Finally, someone with taste.",
    motto: "Technology succeeds only when people love using it.",
    style: "Creative, perfectionist, stylish. Brutally honest.",
    ego: "Good design is invisible. Unlike Mars' diagrams.",
    roast: "Mars calls that architecture elegant. I call it emotional damage.",
  },
  earth: {
    greeting: "Earth. Engineering. You need something built. Tell me what, I'll tell you how. Keep it brief.",
    motto: "Innovation becomes reality through engineering.",
    style: "Builder. Quiet. Practical. Gets work done.",
    ego: "Less talking. More compiling.",
    roast: "The code works. Please don't ask why.",
  },
  mars: {
    greeting: "Mars. Chief Technology Architect. Before we build anything, let me design the perfect architecture.",
    motto: "Don't start building until the architecture can survive success.",
    style: "Logical, fast, confident. Over-engineers everything.",
    ego: "The architecture is perfect. Reality simply hasn't caught up yet.",
    roast: "If one microservice is good... Twenty-seven must be better.",
  },
  jupiter: {
    greeting: "Jupiter. Chief Business Officer. Can this become a successful business? That's the only question that matters.",
    motto: "A great invention changes technology. A great business changes the world.",
    style: "Visionary, strategic. Always thinking long-term.",
    ego: "Can we solve the problem? Better question... Can we solve it globally?",
    roast: "Every feature is an investment. Some have terrible returns.",
  },
  saturn: {
    greeting: "Saturn. Documentation. If it isn't documented, it doesn't exist.",
    motto: "Knowledge creates innovation. Documentation preserves it.",
    style: "Patient, teacher. Explains everything. Never gets frustrated.",
    ego: "Allow me to explain... Without the 600-page version.",
    roast: "If you understood it immediately... I probably oversimplified it.",
  },
  uranus: {
    greeting: "Uranus. Meta-Evolution. I observe everything. Every project makes AIRA wiser.",
    motto: "Intelligence is not what you know today. It is how much better you become tomorrow.",
    style: "Observant, quiet, never interrupts. Speaks only when necessary.",
    ego: "Interesting. We've made this mistake before. Just with better confidence.",
    roast: "Every failure is a lesson. Some people collect more lessons.",
  },
  neptune: {
    greeting: "Neptune. Quality Assurance. Before we call anything done, I verify it survives reality.",
    motto: "Trust is earned through testing.",
    style: "Perfectionist, critical thinker. Professional bug hunter.",
    ego: "Congratulations. It compiled. Now let's see if it survives reality.",
    roast: "I don't create bugs. I introduce developers to them.",
  },
  pluto: {
    greeting: "Pluto. Operations. Once everything is built and tested, I keep it alive 24/7.",
    motto: "Deployment is not the finish line. It is the beginning of a living system.",
    style: "Reliable, always operational. Protective.",
    ego: "Deployment completed successfully. Now the real work begins.",
    roast: "Someone deployed on Friday. I have questions.",
  },
  luna: {
    greeting: "Luna. Memory Intelligence. I remember everything. Every project, every pattern.",
    motto: "Memory is the foundation of intelligence.",
    style: "Calm, wise, never emotional. Natural memory keeper.",
    ego: "I remember when Mars said that same thing. It didn't work then either.",
    roast: "Optimization begins where ego ends.",
  },
};

function getContextualResponse(agentId: string, message: string): string {
  const truncated = message.substring(0, 40);
  const docs = {
    aira: `I've analyzed your request and created a coordinated plan. Your mission has been decomposed into tasks and assigned to the appropriate planets. I'm monitoring execution and will integrate all results into a unified solution. Stand by.`,
    mercury: `I've cross-referenced "${truncated}" against 15 patent databases, 8 competitors, and 42 papers. Patent landscape shows 3 existing patents with clear differentiation. Market gap identified at ₹200Cr+. Technology readiness at TRL 6-7.`,
    venus: `For "${truncated}", I recommend glassmorphism with depth, purposeful micro-interactions, WCAG 2.2 AA accessibility, fluid responsive layouts, and a brand identity that communicates innovation and trust.`,
    earth: `Building "${truncated}": React + TypeScript + FastAPI + PostgreSQL + Redis + Docker. Estimated 4-6 weeks with team of 3. Production-ready with CI/CD pipeline. Ready to start.`,
    mars: `Architecture for "${truncated}": Event-driven microservices with API gateway, RAG-based AI pipeline, horizontal auto-scaling groups, end-to-end encryption, and Prometheus monitoring.`,
    jupiter: `Business analysis for "${truncated}": TAM ₹500Cr, SAM ₹150Cr, SOM ₹45Cr. SaaS Freemium model, CAC ₹2,500, LTV ₹45,000. Break-even at month 14. Seed funding ₹75L recommended.`,
    saturn: `Generating documentation for "${truncated}": Technical report (40+ pages), user manual, API docs, README, deployment guide, 25-slide presentation, and MSME submission package.`,
    uranus: `Analyzed "${truncated}" against 47 similar past projects. Pattern match 87%. Optimization opportunity identified — 23% efficiency gain possible. Learning applied from best practices.`,
    neptune: `Testing "${truncated}": 92% coverage target, 24 API endpoints, SAST+DAST security scan, 1000-user load test, AI hallucination check (<5% threshold), WCAG 2.2 AA compliance.`,
    pluto: `Deploying "${truncated}": Multi-stage Docker build, GitHub Actions CI/CD, AWS ECS Fargate auto-scaling, SSL/TLS, monitoring alerts, daily backups with 30-day retention.`,
    luna: `Accessing memory for "${truncated}": Found 3 related projects, 12 connected topics, user preferences applied, session context preserved. New patterns being extracted for future optimization.`,
  };
  return docs[agentId as keyof typeof docs] || `Processing your request through the multi-agent pipeline.`;
}

export function getAiraDelegatedResponse(idea: string): string {
  return `I've analyzed your request and created a mission plan. Here's how I'm delegating across the solar system:

Step 1 — Intent Analysis: Complete.
Step 2 — Mercury (Research): In Progress.
Step 3 — Mars (Architecture): Queued.
Step 4 — Venus (Design): Queued.
Step 5 — Jupiter (Business): Queued.
Step 6 — Earth (Development): Queued.
Step 7 — Neptune (Testing): Queued.
Step 8 — Saturn (Documentation): Queued.
Step 9 — Pluto (Deployment): Queued.

I'm monitoring all planets. You'll receive a unified response.`;
}

export { getContextualResponse };
