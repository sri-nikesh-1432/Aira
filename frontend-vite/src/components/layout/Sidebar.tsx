import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Lightbulb,
  ShieldCheck,
  FileText,
  Gavel,
  Rocket,
  Sun,
  Globe,
  BookOpen,
  Cpu,
  BarChart3,
  Target,
  Radio,
  Shield,
  Database,
  Moon,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const mainLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, desc: "System overview" },
    { href: "/aira", label: "AIRA Central", icon: Sun, desc: "Orchestrator" },
    { href: "/workspace", label: "Workspace", icon: MessageSquare, desc: "All conversations" },
  ];

  const agentLinks = [
    { href: "/agent/mercury", label: "Mercury", icon: Globe, desc: "Research", color: "#A0A0A0" },
    { href: "/agent/venus", label: "Venus", icon: Lightbulb, desc: "Design", color: "#E8CDA0" },
    { href: "/agent/earth", label: "Earth", icon: Cpu, desc: "Development", color: "#4A90D9" },
    { href: "/agent/mars", label: "Mars", icon: Bot, desc: "Architecture", color: "#CD5C5C" },
    { href: "/agent/jupiter", label: "Jupiter", icon: BarChart3, desc: "Business", color: "#DAA06D" },
    { href: "/agent/saturn", label: "Saturn", icon: BookOpen, desc: "Documentation", color: "#F4D03F" },
    { href: "/agent/uranus", label: "Uranus", icon: Radio, desc: "Evolution", color: "#73C2FB" },
    { href: "/agent/neptune", label: "Neptune", icon: Shield, desc: "Testing", color: "#3F51B5" },
    { href: "/agent/pluto", label: "Pluto", icon: Rocket, desc: "Operations", color: "#C4A35A" },
    { href: "/agent/luna", label: "Luna", icon: Moon, desc: "Memory", color: "#E8E8E8" },
  ];

  const toolLinks = [
    { href: "/generator", label: "Idea Generator", icon: Lightbulb, desc: "Generate ideas" },
    { href: "/validator", label: "Validator", icon: ShieldCheck, desc: "Validate ideas" },
    { href: "/evaluator", label: "Evaluation", icon: FileText, desc: "Evaluate projects" },
    { href: "/judge", label: "Judge Sim", icon: Gavel, desc: "Practice pitching" },
    { href: "/deploy", label: "Deploy", icon: Target, desc: "Deploy projects" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card/50 border-r border-white/5 pt-16 fixed left-0 top-0">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Main</div>
          {mainLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
                    isActive
                      ? link.href === "/aira"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-accent/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-inherit")} />
                  <div className="flex flex-col">
                    <span className="font-medium">{link.label}</span>
                    <span className="text-[10px] text-gray-500 opacity-60">{link.desc}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Solar System</span>
          </div>
          {agentLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer",
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-accent/50"
                  )}
                  style={isActive ? { backgroundColor: link.color + "20", border: "1px solid " + link.color + "40" } : {}}
                >
                  <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: link.color } : {}} />
                  <div className="flex flex-col">
                    <span className="font-medium">{link.label}</span>
                    <span className="text-[10px] text-gray-500 opacity-60">{link.desc}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div>
          <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Tools</div>
          {toolLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-accent/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                  <div className="flex flex-col">
                    <span className="font-medium">{link.label}</span>
                    <span className="text-[10px] text-gray-500 opacity-60">{link.desc}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator-tools"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/5">
        <div className="glass-light rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">System Online</span>
          </div>
          <p className="text-[10px] text-gray-500">10 planets ready - AIRA v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
