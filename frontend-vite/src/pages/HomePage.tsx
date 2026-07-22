import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Bot, Lightbulb, ShieldCheck, Gavel, Rocket,
  Upload, Zap, BarChart3, Sparkles, Sun, ArrowRight, Activity,
  Cpu, Globe, Users, Code, TrendingUp, Star, Orbit
} from "lucide-react";

const quickLinks = [
  { href: "/workspace", label: "Workspace", icon: MessageSquare, description: "Chat with AIRA", color: "#5c7cfa" },
  { href: "/agents", label: "Agents", icon: Bot, description: "View all 10 AI agents", color: "#22c55e" },
  { href: "/generator", label: "Idea Generator", icon: Lightbulb, description: "Generate innovative ideas", color: "#eab308" },
  { href: "/validator", label: "Validator", icon: ShieldCheck, description: "Validate your ideas", color: "#8b5cf6" },
  { href: "/evaluator", label: "Evaluation", icon: Upload, description: "Evaluate existing projects", color: "#06b6d4" },
  { href: "/judge", label: "Judge Sim", icon: Gavel, description: "Practice with AI judges", color: "#ec4899" },
  { href: "/deploy", label: "Deploy", icon: Rocket, description: "Deploy your project", color: "#f97316" },
];

const stats = [
  { label: "AI Planets", value: "10", icon: Orbit, color: "#5c7cfa" },
  { label: "Active Projects", value: "3", icon: BarChart3, color: "#22c55e" },
  { label: "Tasks Completed", value: "47", icon: Zap, color: "#eab308" },
  { label: "MSME Success Rate", value: "94%", icon: TrendingUp, color: "#ec4899" },
];

const planetsForDisplay = [
  { id: "mercury", name: "Mercury", emoji: "☿", color: "#A0A0A0", size: 28, orbit: 60, speed: 8 },
  { id: "venus", name: "Venus", emoji: "♀", color: "#E8CDA0", size: 32, orbit: 90, speed: 12 },
  { id: "earth", name: "Earth", emoji: "🌍", color: "#4A90D9", size: 34, orbit: 120, speed: 16 },
  { id: "mars", name: "Mars", emoji: "♂", color: "#CD5C5C", size: 30, orbit: 150, speed: 20 },
  { id: "jupiter", name: "Jupiter", emoji: "♃", color: "#DAA06D", size: 44, orbit: 190, speed: 28 },
  { id: "saturn", name: "Saturn", emoji: "♄", color: "#F4D03F", size: 38, orbit: 230, speed: 35 },
  { id: "uranus", name: "Uranus", emoji: "♅", color: "#73C2FB", size: 36, orbit: 270, speed: 42 },
  { id: "neptune", name: "Neptune", emoji: "♆", color: "#3F51B5", size: 36, orbit: 310, speed: 48 },
  { id: "pluto", name: "Pluto", emoji: "🪐", color: "#C4A35A", size: 26, orbit: 350, speed: 55 },
];

export default function HomePage() {
  const agents = useAgentStore((s) => s.agents);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-yellow-500/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400">System Online</span>
              </Badge>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                AIRA
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-6 max-w-xl">
              Artificial Intelligence Research & Innovation Assistant — A Multi-Agent AI Operating System for MSME Innovation. Transform ideas into complete, competition-ready solutions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/workspace">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/agents">
                <Button variant="outline" size="lg" className="gap-2">
                  <Bot className="w-5 h-5" />
                  Meet the Agents
                </Button>
              </Link>
            </div>
          </div>

          {/* Solar System Visualization */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center glow-sun">
                <Sun className="w-8 h-8 text-white" />
              </div>
            </div>
            {planetsForDisplay.map((planet) => (
              <motion.div
                key={planet.id}
                className="absolute inset-0"
                style={{ animation: `orbit ${planet.speed}s linear infinite` }}
              >
                <div
                  className="absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-150"
                  style={{
                    width: planet.size,
                    height: planet.size,
                    left: `calc(50% - ${planet.size / 2}px)`,
                    top: `calc(50% - ${planet.orbit}px - ${planet.size / 2}px)`,
                    backgroundColor: planet.color + "30",
                    border: `1px solid ${planet.color}60`,
                    boxShadow: activePlanet === planet.id ? `0 0 20px ${planet.color}80` : "none",
                  }}
                  onMouseEnter={() => setActivePlanet(planet.id)}
                  onMouseLeave={() => setActivePlanet(null)}
                >
                  <span className="text-xs">{planet.emoji}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: stat.color + "15" }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agent Status */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          Agent Fleet Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to="/agents">
                <Card className="glass hover:border-primary/30 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: agent.color + "15" }}
                      >
                        {agent.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{agent.name}</div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                agent.status === "idle" ? "#6b7280" :
                                agent.status === "working" ? "#22c55e" : "#eab308"
                            }}
                          />
                          <span className="text-[10px] text-gray-500 capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={link.href}>
                <Card className="glass hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: link.color + "15" }}
                      >
                        <link.icon className="w-5 h-5" style={{ color: link.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.label}</CardTitle>
                        <CardDescription className="text-xs">{link.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Multi-Agent Pipeline */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Multi-Agent Orchestration Pipeline
          </CardTitle>
          <CardDescription>
            How AIRA processes your request through the solar system of AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {["☀️ AIRA", "→ ☿ Mercury", "→ ♂ Mars", "→ ♀ Venus", "→ ♃ Jupiter", "→ 🌍 Earth", "→ ♆ Neptune", "→ ♄ Saturn", "→ ♅ Uranus", "→ 🪐 Pluto"].map((step, i) => (
              <React.Fragment key={i}>
                <Badge variant="secondary" className="text-xs py-1.5">
                  {step}
                </Badge>
                {i < 9 && <span className="text-gray-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
