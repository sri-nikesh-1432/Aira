import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentStore, useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AGENT_VOICES, getContextualResponse } from "@/lib/agentVoices";
import { sendChatMessage } from "@/lib/api";
import type { AgentType, Message } from "@/types";
import { Send, Bot, User, Loader2, ArrowLeft, Star, Activity, Zap, Globe, Shield, Database, Rocket, AlertCircle } from "lucide-react";

function MsgBubble({ msg, color }: { msg: Message; color: string }) {
  const agents = useAgentStore((s) => s.agents);
  const isUser = msg.role === "user";
  const agent = msg.agentId ? agents.find((a) => a.id === msg.agentId) : null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
          style={{ backgroundColor: (agent?.color || color) + "20" }}>
          {agent ? agent.emoji : "☀️"}
        </div>
      )}
      <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", isUser ? "text-white" : "glass")}
        style={isUser ? { backgroundColor: color + "30", border: "1px solid " + color + "40" } : {}}>
        {!isUser && agent && (
          <div className="text-xs font-medium mb-1" style={{ color: agent.color }}>
            {agent.name} — {agent.role}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
        <div className="text-[10px] text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </motion.div>
  );
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const agents = useAgentStore((s) => s.agents);
  const { messages, addMessage, isStreaming, setStreaming } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isMountedRef = useRef(true);

  const agent = agents.find((a) => a.id === id);
  const voice = AGENT_VOICES[id || ""];
  const agentMsgs = messages.filter((m) => m.agentId === id || m.role === "user");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [agentMsgs]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!agent || !voice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass p-8 text-center">
          <p className="text-gray-400 mb-4">Agent not found. Unknown coordinates.</p>
          <Link to="/agents"><Button variant="outline">Back</Button></Link>
        </Card>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage, agentId: agent.id as AgentType });
    setStreaming(true);
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      try {
        const resp = await sendChatMessage(userMessage, agent.id as AgentType);
        if (!isMountedRef.current) return;
        addMessage({ role: "assistant", content: resp.content, agentId: agent.id as AgentType });
      } catch {
        if (!isMountedRef.current) return;
        addMessage({ role: "assistant", content: getContextualResponse(agent.id, userMessage), agentId: agent.id as AgentType });
      }
      if (isMountedRef.current) setStreaming(false);
    }, 1200);
  };

  const c = agent.color;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/agents" className="text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> All Agents
        </Link>
        <span className="text-gray-600">/</span>
        <span style={{ color: c }} className="font-medium">{agent.name}</span>
      </div>

      <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, " + c + "18, transparent)" }}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
            style={{ backgroundColor: c + "20", border: "2px solid " + c + "40" }}>
            {agent.emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: c }}>{agent.name}</h1>
            <p className="text-gray-400">{agent.role}</p>
            <p className="text-sm text-gray-500 mt-3">{agent.longDescription}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: c }} /> Personality</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 italic">"{voice.ego}"</p>
              <p className="text-xs text-gray-500 mt-2">{voice.style}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: c }} /> Motto</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 italic">{voice.motto}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: c }} /> Capabilities</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Link to="/aira">
            <Button variant="outline" className="w-full gap-2">
              <Activity className="w-4 h-4" /> Back to AIRA Central
            </Button>
          </Link>
        </div>

        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-16rem)]">
          <Card className="glass flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: c + "20" }}>
                {agent.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: c }}>{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              {agentMsgs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                    style={{ backgroundColor: c + "20" }}>{agent.emoji}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: c }}>Chat with {agent.name}</h3>
                  <p className="text-sm text-gray-400 max-w-md">{voice.greeting}</p>
                </div>
              ) : (
                <div>
                  {agentMsgs.map((msg) => (
                    <MsgBubble key={msg.id} msg={msg} color={c} />
                  ))}
                  {isStreaming && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: c + "20" }}>
                        <Bot className="w-4 h-4" style={{ color: c }} />
                      </div>
                      <div className="glass rounded-2xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: c }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={"Message " + agent.name + "..."}
                  className="border-0 bg-secondary/50 focus-visible:ring-1" />
                <Button size="icon" onClick={handleSend} disabled={!input.trim() || isStreaming}
                  style={{ backgroundColor: c }}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
