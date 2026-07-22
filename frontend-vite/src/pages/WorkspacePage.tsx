import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentStore, useChatStore } from "@/lib/store";
import { cn, PLANET_COLORS, getAgentResponse } from "@/lib/utils";
import type { AgentType } from "@/types";
import {
  Send, Bot, User, Sparkles, Lightbulb, FileText,
  Zap, Brain, Paperclip, Mic, Loader2, Sun,
  Globe, Eye, Wrench, Shield, Database, Rocket,
  Radio, Cpu, Settings, ChevronRight
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
          "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border",
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
            "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border",
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

function MessageBubble({ message }: { message: any }) {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage, agentId: activeAgent || undefined });
    setStreaming(true);

    timeoutRef.current = setTimeout(() => {
      if (activeAgent) {
        const response = getAgentResponse(activeAgent, userMessage);
        addMessage({ role: "assistant", content: response, agentId: activeAgent });
      } else {
        const agentToUse: AgentType = "mercury";
        const response = getAgentResponse(agentToUse, userMessage);
        addMessage({
          role: "assistant",
          content: `☀️ AIRA Core orchestrating your request...\n\nI've analyzed your input and routed it through our multi-agent pipeline. Here's what I've found:\n\n${response}\n\nWould you like me to dive deeper with any specific agent?`,
        });
      }
      setStreaming(false);
    }, 1500);
  }, [input, isStreaming, activeAgent, addMessage, setStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
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
          <Button variant="ghost" size="sm" onClick={() => useChatStore.getState().clearMessages()}>
            Clear
          </Button>
        </div>
      </div>

      <AgentSelector onSelect={setActiveAgent} activeAgent={activeAgent} />

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
                Your Multi-Agent AI Operating System is ready. Select an agent or choose a quick action below.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="glass rounded-xl p-4 text-left hover:border-primary/30 transition-all duration-200 group"
                  >
                    <action.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{action.prompt}</div>
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
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

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
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
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
