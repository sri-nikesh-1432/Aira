export type AgentType =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "luna";

export type AgentStatus = "idle" | "thinking" | "working" | "completed" | "error";

export interface Agent {
  id: AgentType;
  name: string;
  role: string;
  description: string;
  longDescription: string;
  emoji: string;
  color: string;
  status: AgentStatus;
  capabilities: string[];
  outputs: string[];
  personality: string;
  humorType: string;
}

export type MessageRole = "user" | "assistant" | "system" | "agent";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  agentId?: AgentType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type ProjectStatus = "idea" | "validated" | "in-progress" | "completed" | "deployed";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  idea: string;
  theme?: string;
  budget?: string;
  teamSize?: number;
  msmeGuidelines?: string;
  createdAt: Date;
  updatedAt: Date;
  deliverables: Deliverable[];
}

export interface Deliverable {
  id: string;
  type: DeliverableType;
  name: string;
  content: string;
  format: string;
  createdAt: Date;
  agentId: AgentType;
}

export type DeliverableType =
  | "research-report"
  | "architecture"
  | "source-code"
  | "documentation"
  | "business-plan"
  | "ppt"
  | "test-report"
  | "deployment-guide"
  | "judge-prep"
  | "financial-forecast";

export interface WorkspaceTask {
  id: string;
  projectId: string;
  assignedAgent: AgentType;
  status: "pending" | "in-progress" | "completed" | "failed";
  description: string;
  result?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ValidationCriteria {
  novelty: number;
  technicalFeasibility: number;
  businessFeasibility: number;
  msmeCompliance: number;
  scalability: number;
  costEffectiveness: number;
  overall: number;
}

export interface ValidationResult {
  score: ValidationCriteria;
  feedback: string[];
  recommendations: string[];
  risks: string[];
}

export interface JudgeQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer?: string;
}

export interface JudgeSimulation {
  stage: number;
  questions: JudgeQuestion[];
  responses: { questionId: string; answer: string; score: number }[];
  overallScore: number;
}

export interface FinancialForecast {
  year: number;
  revenue: number;
  costs: number;
  profit: number;
  users: number;
}

export type DocumentType = "pdf" | "ppt" | "docx" | "zip" | "image" | "text";

export interface UploadedDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  extractedData?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeAgents: number;
  completedTasks: number;
  deliverablesGenerated: number;
}

export interface Idea {
  title: string;
  description: string;
  score: number;
  tags: string[];
  marketSize: string;
  competition: string;
  timeline: string;
  budget: string;
}
