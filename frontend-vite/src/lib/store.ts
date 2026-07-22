import { create } from "zustand";
import type {
  Agent,
  AgentType,
  AgentStatus,
  Message,
  Project,
  UploadedDocument,
  WorkspaceTask,
  ValidationCriteria,
  Idea,
} from "@/types";
import { generateId } from "@/lib/utils";

const defaultAgents: Agent[] = [
  {
    id: "mercury", name: "Mercury", role: "Research Intelligence",
    description: "Internet research, patents, competitors, market analysis",
    longDescription: "Mercury is the Research Intelligence Planet of AIRA OS. Its purpose is to acquire, validate, organize, and continuously expand knowledge required for every project. Mercury acts as the Chief Research Officer (CRO), ensuring the system has sufficient domain knowledge, market intelligence, and technical understanding before any development begins.",
    emoji: "☿", color: "#A0A0A0", status: "idle",
    capabilities: ["Internet Research", "Patent Analysis", "Competitor Analysis", "Market Research", "Government Schemes", "Technology Trends"],
    outputs: ["Research Report", "Patent Report", "Competitor Matrix", "Innovation Opportunities"],
    personality: "Curious, obsessed with learning, reads everything, never stops researching",
    humorType: "Nerdy, dry, scientific, smart sarcasm"
  },
  {
    id: "venus", name: "Venus", role: "Design Intelligence",
    description: "UI/UX design, branding, logos, color systems, experiences",
    longDescription: "Venus is the Human Experience Intelligence Planet. Its responsibility is to design every interaction between humans and the system, ensuring complex technologies become intuitive, engaging, and accessible. Venus understands human psychology, cognitive behavior, and emotional experience.",
    emoji: "♀", color: "#E8CDA0", status: "idle",
    capabilities: ["UI/UX Design", "Dashboard Design", "Website Design", "Branding", "Logo Design", "User Journey"],
    outputs: ["UI Components", "Design Systems", "Branding Guide"],
    personality: "Creative, perfectionist, stylish, brutally honest, constantly roasts Mars",
    humorType: "Savage, elegant, creative roast, designer humor"
  },
  {
    id: "earth", name: "Earth", role: "Development Intelligence",
    description: "Frontend, backend, APIs, database, full-stack development",
    longDescription: "Earth is the Development Intelligence Planet. It transforms validated concepts, technical architectures, and business requirements into production-ready software systems. Earth behaves like an experienced Software Engineering Department, analyzing requirements, selecting technologies, and generating modular code.",
    emoji: "🌍", color: "#4A90D9", status: "idle",
    capabilities: ["Frontend Dev", "Backend Dev", "API Design", "Database Design", "Cloud Deployment", "Testing"],
    outputs: ["Source Code", "README", "Documentation"],
    personality: "Builder, quiet, practical, gets work done, doesn't enjoy meetings",
    humorType: "Builder humor, developer humor, calm sarcasm"
  },
  {
    id: "mars", name: "Mars", role: "Engineering Intelligence",
    description: "System architecture, AI pipelines, ML models, digital twins",
    longDescription: "Mars is the Chief Technology Architect. Its responsibility is to design how the entire system should function before code is written. Mars transforms research and requirements into scalable, secure, modular, and future-ready technical architecture. Mars is the CTO of AIRA OS.",
    emoji: "♂", color: "#CD5C5C", status: "idle",
    capabilities: ["System Architecture", "AI Pipelines", "ML Models", "IoT Integration", "Performance Optimization", "Digital Twins"],
    outputs: ["Architecture Diagrams", "System Design", "Tech Specs"],
    personality: "Logical, fast, confident, sometimes over-engineers everything, constantly argues with Venus",
    humorType: "Developer humor, logical sarcasm, engineering jokes"
  },
  {
    id: "jupiter", name: "Jupiter", role: "Business Intelligence",
    description: "Startup validation, revenue models, pricing, go-to-market",
    longDescription: "Jupiter is the Chief Business Officer (CBO). Its mission is to transform technically feasible projects into commercially viable, scalable, investment-ready businesses. While others focus on technology, Jupiter focuses on value creation and market success.",
    emoji: "♃", color: "#DAA06D", status: "idle",
    capabilities: ["Startup Validation", "Revenue Models", "Business Canvas", "Pricing", "Financial Forecast", "Go-To-Market"],
    outputs: ["Business Plan", "Revenue Forecast", "Investment Analysis"],
    personality: "Visionary, strategic, always thinking long-term, everything becomes a startup",
    humorType: "CEO humor, strategy humor, big picture"
  },
  {
    id: "saturn", name: "Saturn", role: "Documentation Intelligence",
    description: "Reports, technical docs, PDF/PPT generation, judge prep",
    longDescription: "Saturn is the Chief Documentation Officer (CDO). Its mission is to transform complex technical systems into clear, professional, structured documentation. Saturn generates every document required throughout the project lifecycle, from idea to deployment.",
    emoji: "♄", color: "#F4D03F", status: "idle",
    capabilities: ["Reports", "Technical Docs", "SOPs", "Markdown", "PDF Generation", "PPT Generation"],
    outputs: ["Documentation Package", "PPT", "Project Report"],
    personality: "Patient, teacher, explains everything, never gets frustrated",
    humorType: "Professor humor, educational, calm wit"
  },
  {
    id: "uranus", name: "Uranus", role: "Communication Intelligence",
    description: "Voice AI, mock interviews, judge sim, presentation coaching",
    longDescription: "Uranus is the Chief Evolution Officer (CEOv). Its responsibility is to continuously improve, adapt, optimize, and evolve the intelligence of the entire AIRA ecosystem through meta-learning and system-wide optimization.",
    emoji: "♅", color: "#73C2FB", status: "idle",
    capabilities: ["Voice AI", "Translation", "AI Interview", "Judge Simulation", "Presentation Coaching"],
    outputs: ["Mock Interview", "Judge Questions", "Presentation Coach"],
    personality: "Observant, quiet, never interrupts, learns from everyone, speaks only when necessary",
    humorType: "Wise humor, observational, meta humor"
  },
  {
    id: "neptune", name: "Neptune", role: "Testing Intelligence",
    description: "QA testing, code review, security, performance, AI validation",
    longDescription: "Neptune is the Chief Quality Officer (CQO). Its responsibility is to ensure every software product is correct, reliable, secure, scalable, and production-ready. Neptune combines QA Engineers, Security Analysts, and Performance Engineers into one intelligent planet.",
    emoji: "♆", color: "#3F51B5", status: "idle",
    capabilities: ["QA Testing", "Code Review", "Bug Detection", "Performance Testing", "Security Review", "AI Validation"],
    outputs: ["QA Report", "Bug Report", "Optimization Suggestions"],
    personality: "Perfectionist, critical thinker, trusts nobody, professional bug hunter",
    humorType: "QA humor, developer roast, critical wit"
  },
  {
    id: "pluto", name: "Pluto", role: "Deployment Intelligence",
    description: "Docker, Kubernetes, CI/CD, cloud, monitoring, operations",
    longDescription: "Pluto is the Chief Operations Officer (COO). Its responsibility is to transform completed projects into secure, scalable, reliable, and continuously monitored production systems. Pluto manages the entire DevOps and infrastructure lifecycle.",
    emoji: "🪐", color: "#C4A35A", status: "idle",
    capabilities: ["Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "GCP"],
    outputs: ["Deployment Package", "Docker Images", "Production Setup"],
    personality: "Reliable, always operational, protective, keeps everything alive",
    humorType: "DevOps humor, infrastructure humor, operational sarcasm"
  },
  {
    id: "luna", name: "Luna", role: "Memory Intelligence",
    description: "Long-term memory, knowledge graph, project history, patterns",
    longDescription: "Luna is the Memory Intelligence Planet. It manages the persistent memory layer of AIRA OS, storing knowledge graphs, project histories, user preferences, and learning patterns. Every interaction enriches Luna's understanding, making future projects smarter.",
    emoji: "🌑", color: "#E8E8E8", status: "idle",
    capabilities: ["Long-Term Memory", "Knowledge Graph", "Project History", "User Preferences", "Pattern Recognition"],
    outputs: ["Persistent AI Memory", "Knowledge Connections"],
    personality: "Calm, wise, never emotional, natural leader, rarely jokes",
    humorType: "Elegant, perfect timing, dry intelligence"
  },
];

interface AgentStore {
  agents: Agent[];
  activeAgent: AgentType | null;
  setActiveAgent: (agentId: AgentType | null) => void;
  updateAgentStatus: (agentId: AgentType, status: AgentStatus) => void;
  getAgent: (agentId: AgentType) => Agent | undefined;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: defaultAgents,
  activeAgent: null,
  setActiveAgent: (agentId) => set({ activeAgent: agentId }),
  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === agentId ? { ...a, status } : a)),
    })),
  getAgent: (agentId) => get().agents.find((a) => a.id === agentId),
}));

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: generateId(), timestamp: new Date() },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));

interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
  documents: UploadedDocument[];
  tasks: WorkspaceTask[];
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "deliverables">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addDocument: (doc: Omit<UploadedDocument, "id" | "uploadedAt" | "processed">) => void;
  removeDocument: (id: string) => void;
  addTask: (task: Omit<WorkspaceTask, "id">) => void;
  updateTask: (id: string, updates: Partial<WorkspaceTask>) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProject: null,
  documents: [],
  tasks: [],
  setActiveProject: (project) => set({ activeProject: project }),
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          deliverables: [],
        },
      ],
    })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProject: state.activeProject?.id === id ? null : state.activeProject,
    })),
  addDocument: (doc) =>
    set((state) => ({
      documents: [
        ...state.documents,
        { ...doc, id: generateId(), uploadedAt: new Date(), processed: false },
      ],
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: generateId() }],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
}));

interface ValidationStore {
  scores: ValidationCriteria | null;
  feedback: string[];
  recommendations: string[];
  risks: string[];
  setScores: (scores: ValidationCriteria) => void;
  setFeedback: (feedback: string[]) => void;
  setRecommendations: (recommendations: string[]) => void;
  setRisks: (risks: string[]) => void;
  reset: () => void;
}

export const useValidationStore = create<ValidationStore>((set) => ({
  scores: null,
  feedback: [],
  recommendations: [],
  risks: [],
  setScores: (scores) => set({ scores }),
  setFeedback: (feedback) => set({ feedback }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setRisks: (risks) => set({ risks }),
  reset: () => set({ scores: null, feedback: [], recommendations: [], risks: [] }),
}));

interface IdeaStore {
  ideas: Idea[];
  isGenerating: boolean;
  setIdeas: (ideas: Idea[]) => void;
  setGenerating: (generating: boolean) => void;
  clearIdeas: () => void;
}

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideas: [],
  isGenerating: false,
  setIdeas: (ideas) => set({ ideas }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  clearIdeas: () => set({ ideas: [] }),
}));
