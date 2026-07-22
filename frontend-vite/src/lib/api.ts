import type { AgentType, ValidationCriteria, Idea, JudgeQuestion } from "@/types";
import { getAgentResponse } from "@/lib/utils";

const API_BASE = "/api";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

// Chat API
export interface ChatRequest {
  content: string;
  agent_id?: string;
  project_id?: string;
}

export interface ChatResponse {
  id: string;
  role: string;
  content: string;
  agent_id?: string;
  timestamp: number;
}

export async function sendChatMessage(
  content: string,
  agentId?: AgentType,
  projectId?: string
): Promise<ChatResponse> {
  // Fallback to mock if API is not available
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await apiRequest<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({
        content,
        agent_id: agentId,
        project_id: projectId,
      } as ChatRequest),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch {
    clearTimeout(timeoutId);
    // Fallback to mock when backend is not running
    return {
      id: Math.random().toString(36).substring(2),
      role: "assistant",
      content: agentId
        ? getAgentResponse(agentId, content)
        : `☀️ AIRA Core orchestrating your request...\n\nI've analyzed your input and routed it through our multi-agent pipeline. Here's what I've found:\n\n${getAgentResponse("mercury", content)}\n\nWould you like me to dive deeper with any specific agent?`,
      agent_id: agentId || "mercury",
      timestamp: Date.now() / 1000,
    };
  }
}

// Agents API
export interface AgentInfo {
  name: string;
  role: string;
  emoji: string;
  color: string;
}

export async function fetchAgents(): Promise<Record<string, AgentInfo>> {
  const response = await apiRequest<{ agents: Record<string, AgentInfo> }>("/agents");
  return response.agents;
}

export async function fetchAgent(agentId: string): Promise<AgentInfo> {
  const response = await apiRequest<{ agent: AgentInfo }>(`/agents/${agentId}`);
  return response.agent;
}

// Validation API
export interface ValidationResponse {
  overall: number;
  scores: Record<string, number>;
  feedback: string[];
  recommendations: string[];
  risks: { level: string; text: string }[];
}

export async function validateIdea(
  idea: string,
  guidelines?: string
): Promise<ValidationResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await apiRequest<ValidationResponse>("/validate", {
      method: "POST",
      body: JSON.stringify({ idea, guidelines }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch {
    clearTimeout(timeoutId);
    // Fallback mock
    return {
      overall: 87,
      scores: {
        novelty: 85,
        technical_feasibility: 92,
        business_feasibility: 88,
        msme_compliance: 95,
        scalability: 82,
        cost_effectiveness: 90,
      },
      feedback: [
        "Strong MSME alignment and theme relevance",
        "High technical feasibility with proven stack",
        "Clear market demand with growing TAM",
      ],
      recommendations: [
        "File a provisional patent to protect the core innovation",
        "Build MVP within 4 weeks for early user testing",
        "Prepare for Stage 1 evaluation with MSME guidelines",
      ],
      risks: [
        { level: "low", text: "Market timing is favorable for this solution" },
        { level: "medium", text: "Competition exists but differentiation is clear" },
        { level: "low", text: "Technology risk is minimal with current stack" },
      ],
    };
  }
}

// Ideas API
export interface IdeaGenerationResponse {
  ideas: Idea[];
}

export async function generateIdeas(
  theme?: string,
  budget?: string,
  teamSize?: string
): Promise<Idea[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await apiRequest<IdeaGenerationResponse>("/generate-ideas", {
      method: "POST",
      body: JSON.stringify({ theme, budget, team_size: teamSize }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ideas;
  } catch {
    clearTimeout(timeoutId);
    // Fallback mock
    return [
      {
        title: "Smart Crop Disease Detection using Edge AI",
        description: "IoT-based system using camera sensors and edge AI for real-time crop disease detection. Deploys lightweight YOLO models on Raspberry Pi for offline inference.",
        score: 92,
        tags: ["AI", "IoT", "Agriculture"],
        marketSize: "$2.1B",
        competition: "Low",
        timeline: "4 weeks",
        budget: "₹1.5L",
      },
      {
        title: "Voice-Enabled MSME Financial Dashboard",
        description: "Multilingual voice-activated financial dashboard for MSMEs supporting 8 Indian languages. Uses Whisper for transcription and LLMs for financial insights.",
        score: 89,
        tags: ["Voice AI", "Fintech", "MSME"],
        marketSize: "$5.3B",
        competition: "Medium",
        timeline: "6 weeks",
        budget: "₹2L",
      },
      {
        title: "AI-Powered Legal Document Assistant",
        description: "Automated legal document analysis and drafting assistant for Indian MSMEs. Uses RAG with Indian legal databases for compliant document generation.",
        score: 87,
        tags: ["Legal AI", "RAG", "MSME"],
        marketSize: "$1.8B",
        competition: "Low",
        timeline: "5 weeks",
        budget: "₹1.8L",
      },
    ];
  }
}

// Judge API
export async function judgeSimulate(): Promise<{
  stage: number;
  questions: JudgeQuestion[];
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await apiRequest<{
      stage: number;
      questions: JudgeQuestion[];
    }>("/judge/simulate", { method: "POST", signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch {
    clearTimeout(timeoutId);
    return {
      stage: 1,
      questions: [
        { id: "1", question: "What problem does your solution solve, and why is it important?", category: "Problem Statement", difficulty: "easy" },
        { id: "2", question: "How is your approach different from existing solutions?", category: "Innovation", difficulty: "medium" },
        { id: "3", question: "Explain your technical architecture and key AI components.", category: "Technical", difficulty: "medium" },
        { id: "4", question: "What is your business model and revenue strategy?", category: "Business", difficulty: "hard" },
        { id: "5", question: "How does your project align with MSME guidelines and themes?", category: "MSME Compliance", difficulty: "medium" },
        { id: "6", question: "What is your go-to-market strategy and target customer segment?", category: "Business", difficulty: "hard" },
      ],
    };
  }
}

// Deploy API
export async function deployProject(
  platform: string
): Promise<{ status: string; platform: string; url: string; build_time: string }> {
  const response = await apiRequest(`/deploy?platform=${platform}`, {
    method: "POST",
  });
  return response;
}

// Evaluate API
export async function evaluateProject(): Promise<{
  overall: number;
  categories: Record<string, number>;
  feedback: string[];
}> {
  const response = await apiRequest("/evaluate", { method: "POST" });
  return response;
}

// Health check
export async function checkHealth(): Promise<{
  status: string;
  agents_online: number;
}> {
  const response = await apiRequest<{ status: string; agents_online: number }>("/health");
  return response;
}
