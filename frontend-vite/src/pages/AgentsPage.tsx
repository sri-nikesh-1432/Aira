import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";
import {
  Brain, Zap, Settings, Cpu, Radio, Eye, Wrench, Shield,
  Globe, Database, Rocket, MessageSquare, ChevronRight, Activity,
  X, Star, AlertCircle, CheckCircle2, Info, ArrowUpRight
} from "lucide-react";

const capabilityIcons: Record<string, React.ReactNode> = {
  "Internet Research": <Globe className="w-3 h-3" />,
  "Patent Analysis": <Eye className="w-3 h-3" />,
  "UI/UX Design": <Settings className="w-3 h-3" />,
  "Frontend Dev": <Cpu className="w-3 h-3" />,
  "System Architecture": <Brain className="w-3 h-3" />,
  "Startup Validation": <Zap className="w-3 h-3" />,
  "Reports": <Database className="w-3 h-3" />,
  "Voice AI": <Radio className="w-3 h-3" />,
  "QA Testing": <Shield className="w-3 h-3" />,
  "Docker": <Rocket className="w-3 h-3" />,
  "Long-Term Memory": <Database className="w-3 h-3" />,
};

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="glass h-full hover:border-[var(--agent-color)]/30 transition-all duration-300 group overflow-hidden"
        style={{ "--agent-color": agent.color } as React.CSSProperties}
      >
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${agent.color}60, ${agent.color}20)` }}
        />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: agent.color + "15", border: `1px solid ${agent.color}30` }}
              >
                {agent.emoji}
              </div>
              <div>
                <CardTitle className="text-lg" style={{ color: agent.color }}>
                  {agent.name}
                </CardTitle>
                <CardDescription className="text-xs">{agent.role}</CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="gap-1 text-[10px]"
              style={{
                borderColor:
                  agent.status === "working" ? "#22c55e40" :
                  agent.status === "error" ? "#ef444440" : "#6b728040",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor:
                    agent.status === "idle" ? "#6b7280" :
                    agent.status === "working" ? "#22c55e" :
                    agent.status === "error" ? "#ef4444" : "#eab308",
                }}
              />
              {agent.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.capabilities.slice(0, 4).map((cap) => (
              <Badge key={cap} variant="secondary" className="text-[10px] gap-1">
                {capabilityIcons[cap] || <Zap className="w-3 h-3" />}
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 4 && (
              <Badge variant="secondary" className="text-[10px]">+{agent.capabilities.length - 4}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[10px] text-gray-500">Click to explore</span>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AgentDetail({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="glass rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: agent.color + "15", border: `1px solid ${agent.color}30` }}
            >
              {agent.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: agent.color }}>{agent.name}</h2>
              <p className="text-sm text-gray-400">{agent.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Description
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">{agent.longDescription}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="gap-1">
                  {capabilityIcons[cap] || <Zap className="w-3 h-3" />}
                  {cap}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Outputs
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.outputs.map((output) => (
                <Badge key={output} variant="outline" className="text-xs">{output}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Personality
            </h3>
            <p className="text-sm text-gray-400">{agent.personality}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Humor Style
            </h3>
            <p className="text-sm text-gray-400">{agent.humorType}</p>
          </div>

          <Link to="/workspace">
            <Button className="w-full gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat with {agent.name}
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AgentsPage() {
  const agents = useAgentStore((s) => s.agents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Agents</h1>
        <p className="text-gray-400">
          Meet the 10 specialized AI agents that power the AIRA operating system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <AgentCard agent={agent} onClick={() => setSelectedAgent(agent)} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedAgent && (
          <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
