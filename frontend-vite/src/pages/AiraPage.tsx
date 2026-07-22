import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getAiraDelegatedResponse } from "@/lib/agentVoices";
import { Sun, Send, User, Loader2, MessageSquare, Activity, Sparkles, Orbit } from "lucide-react";

const planets = [
  { id: "mercury", name: "Mercury", emoji: "☿", color: "#A0A0A0", role: "Research" },
  { id: "venus", name: "Venus", emoji: "♀", color: "#E8CDA0", role: "Design" },
  { id: "earth", name: "Earth", emoji: "🌍", color: "#4A90D9", role: "Development" },
  { id: "mars", name: "Mars", emoji: "♂", color: "#CD5C5C", role: "Architecture" },
  { id: "jupiter", name: "Jupiter", emoji: "♃", color: "#DAA06D", role: "Business" },
  { id: "saturn", name: "Saturn", emoji: "♄", color: "#F4D03F", role: "Documentation" },
  { id: "uranus", name: "Uranus", emoji: "♅", color: "#73C2FB", role: "Evolution" },
  { id: "neptune", name: "Neptune", emoji: "♆", color: "#3F51B5", role: "Testing" },
  { id: "pluto", name: "Pluto", emoji: "🪐", color: "#C4A35A", role: "Operations" },
  { id: "luna", name: "Luna", emoji: "🌑", color: "#E8E8E8", role: "Memory" },
];

const pipelineSteps = [
  "AIRA Planning", "Mercury Research", "Mars Architecture",
  "Venus Design", "Jupiter Business", "Earth Development",
  "Neptune QA", "Saturn Docs", "Uranus Evolution", "Pluto Deploy"
];

export default function AiraPage() {
  const { messages, addMessage, isStreaming, setStreaming } = useChatStore();
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const scrollRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    addMessage({ role: "user", content: msg });
    setStreaming(true);
    timeoutRef.current = setTimeout(() => {
      addMessage({ role: "assistant", content: getAiraDelegatedResponse(msg) });
      setStreaming(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 md:p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,53,0.05))" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center glow-sun shrink-0">
            <Sun className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">AIRA Central</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Artificial Intelligence Research & Innovation Assistant.
              I orchestrate 10 specialized AI planets to transform your ideas into complete solutions.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {planets.slice(0, 5).map((p) => (
                <Link key={p.id} to={"/agent/" + p.id}>
                  <Badge variant="outline" className="gap-1 text-xs hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: p.color + "40" }}>
                    <span>{p.emoji}</span> <span>{p.name}</span>
                  </Badge>
                </Link>
              ))}
              <Badge variant="secondary" className="text-xs">+5 more</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "chat", label: "Chat with AIRA", icon: MessageSquare },
          { id: "pipeline", label: "Pipeline", icon: Activity },
          { id: "agents", label: "Solar System", icon: Orbit },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
              activeTab === tab.id
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/20")}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[calc(100vh-22rem)]">
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 glow-sun">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                  I'm AIRA, the Central Intelligence. Tell me what you want to build,
                  and I'll coordinate my entire solar system of AI agents to make it happen.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                  {[
                    "Build an AI-powered healthcare assistant for rural India",
                    "Create a complete business plan for my EdTech startup",
                    "Design and deploy an e-commerce platform for MSMEs",
                    "Generate a full project with documentation and pitch deck"
                  ].map((prompt) => (
                    <button key={prompt} onClick={() => setInput(prompt)}
                      className="glass rounded-xl p-3 text-left text-xs hover:border-yellow-500/30 transition-all group">
                      <Sparkles className="w-4 h-4 text-yellow-400 mb-1" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex gap-3 mb-4 justify-end">
                      <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-primary/20 text-white border border-primary/20">
                        <div className="text-sm">{msg.content}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shrink-0 glow-sun">
                        <Sun className="w-5 h-5 text-white" />
                      </div>
                      <div className="max-w-[85%] rounded-2xl px-5 py-4 glass border-yellow-500/10">
                        <div className="text-xs font-medium mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          ☀️ AIRA — Central Intelligence
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  )
                )}
                {isStreaming && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shrink-0">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="glass rounded-2xl p-2 mt-4">
            <div className="flex items-center gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Tell AIRA what you want to build..."
                className="border-0 bg-transparent focus-visible:ring-0" />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isStreaming}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === "pipeline" && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Multi-Agent Orchestration Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineSteps.map((step, i) => {
                const p = planets[i] || planets[0];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: p.color + "30", border: "1px solid " + p.color + "60" }}>
                      {p.emoji}
                    </div>
                    <div className="flex-1 text-sm font-medium">{step}</div>
                    <span className="text-yellow-400 text-xs animate-pulse">Ready</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents Tab */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {planets.map((p) => (
            <Link key={p.id} to={"/agent/" + p.id}>
              <Card className="glass hover:border-yellow-500/30 transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.color + "20" }}>
                    {p.emoji}
                  </div>
                  <div className="text-sm font-medium" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.role}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
