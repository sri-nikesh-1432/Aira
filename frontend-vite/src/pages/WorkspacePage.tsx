import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentStore, useChatStore } from "@/lib/store";
import { cn, getAgentResponse } from "@/lib/utils";
import { sendChatMessage } from "@/lib/api";
import type { AgentType, Message } from "@/types";
import {
  Send, Bot, User, Sparkles, Lightbulb, FileText,
  Zap, Brain, Paperclip, Mic, Loader2, Sun,
  AlertCircle, RefreshCw
} from "lucide-react";

const quickActions = [
  { icon: Lightbulb, label: "Generate Idea", prompt: "Help me generate an innovative project idea for the MSME sector with AI and sustainability focus" },
  { icon: FileText, label: "Validate Idea", prompt: "I want to validate my project idea against MSME guidelines. The idea is an AI-powered healthcare assistant for rural areas." },
  { icon: Brain, label: "Build Project", prompt: "Help me build a complete project architecture and code for an AI chatbot for MSME customer support" },
  { icon: Zap, label: "Business Plan", prompt: "Create a comprehensive business plan with revenue model, market analysis, and go-to-market strategy for my startup" },
];

function AgentSelector({ onSelect, activeAgent }: { onSelect: (id: AgentType | null) => void; activeAgent: AgentType | null }) {
  const agents = useAgentStore((s) => s.agents);
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border whitespace-nowrap",
          !activeAgent
            ? "bg-primary/10 text-primary border-primary/30"
            : "border-white/10 text-gray-400 hover:border-primary/20"
        )}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>AIRA Core</span>
      </button>
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelect(agent.id)}
          className={cn(
            "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border whitespace-nowrap",
            activeAgent === agent.id
              ? "text-white"
              : "border-white/10 text-gray-400 hover:border-primary/20"
          )}
          style={
            activeAgent === agent.id
              ? { backgroundColor: agent.color + "20", borderColor: agent.color + "40" }
              : {}
          }
        >
          <span>{agent.emoji}</span>
          <span>{agent.name}</span>
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const agents = useAgentStore((s) => s.agents);
  const isUser = message.role === "user";
  const agent = message.agentId ? agents.find((a) => a.id === message.agentId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
          style={{ backgroundColor: (agent?.color || "#5c7cfa") + "20" }}
        >
          {agent ? agent.emoji : "☀️"}
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser ? "bg-primary/20 text-white border border-primary/20" : "glass"
        )}
      >
        {!isUser && agent && (
          <div className="text-xs font-medium mb-1" style={{ color: agent.color }}>
            {agent.name} — {agent.role}
          </div>
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        <div className="text-[10px] text-gray-500 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </motion.div>
  );
}

export default function WorkspacePage() {
  const { messages, addMessage, isStreaming, setStreaming } = useChatStore();
  const { activeAgent, setActiveAgent } = useAgentStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");
    setError(null);

    if (!isMountedRef.current) return;

    addMessage({
      role: "user",
      content: userMessage,
      agentId: activeAgent || undefined,
    });

    setStreaming(true);

    const timeout = 1500;
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      try {
        const response = await sendChatMessage(userMessage, activeAgent || undefined);
        if (!isMountedRef.current) return;
        addMessage({
          role: "assistant",
          content: response.content,
          agentId: (response.agent_id as AgentType) || activeAgent || undefined,
        });
      } catch {
        if (!isMountedRef.current) return;
        const fallbackContent = activeAgent
          ? getAgentResponse(activeAgent, userMessage)
          : `☀️ AIRA Core orchestrating your request...\n\nI've analyzed your input through our multi-agent pipeline:\n\n${getAgentResponse("mercury", userMessage)}\n\nWould you like me to dive deeper with any specific agent?`;

        addMessage({
          role: "assistant",
          content: fallbackContent,
          agentId: activeAgent || undefined,
        });
      }
      if (isMountedRef.current) {
        setStreaming(false);
      }
    }, timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    useChatStore.getState().clearMessages();
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AIRA Workspace</h1>
          <p className="text-sm text-gray-400">Collaborate with AIRA and its specialized AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </Badge>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1">
              <RefreshCw className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Agent Selector */}
      <AgentSelector onSelect={setActiveAgent} activeAgent={activeAgent} />

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mt-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
            ✕
          </Button>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 glow-sun">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to AIRA OS</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Your Multi-Agent AI Operating System is ready. Select an agent below or choose a quick action.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="glass rounded-xl p-4 text-left hover:border-primary/30 transition-all duration-200 group"
                  >
                    <action.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-[10px] text-gray-500 mt-1 line-clamp-2 text-left">
                      {action.prompt.substring(0, 60)}...
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="glass rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-gray-400">AIRA is processing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="glass rounded-2xl p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-4 h-4 text-gray-400" />
          </Button>
          <Input
            id="chat-input"
            name="chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeAgent ? `Message ${activeAgent}...` : "Message AIRA..."}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
          />
          <Button variant="ghost" size="icon" className="shrink-0">
            <Mic className="w-4 h-4 text-gray-400" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
