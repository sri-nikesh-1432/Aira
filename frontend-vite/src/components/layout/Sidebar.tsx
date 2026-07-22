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
} from "lucide-react";

const sidebarLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "System overview" },
  { href: "/workspace", label: "Workspace", icon: MessageSquare, description: "Chat with AIRA" },
  { href: "/agents", label: "Agents", icon: Bot, description: "View all agents" },
  { href: "/generator", label: "Idea Generator", icon: Lightbulb, description: "Generate ideas" },
  { href: "/validator", label: "Validator", icon: ShieldCheck, description: "Validate ideas" },
  { href: "/evaluator", label: "Evaluation Portal", icon: FileText, description: "Evaluate projects" },
  { href: "/judge", label: "Judge Simulator", icon: Gavel, description: "Practice pitching" },
  { href: "/deploy", label: "Deploy", icon: Rocket, description: "Deploy projects" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card/50 border-r border-white/5 pt-16 fixed left-0 top-0">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sidebarLinks.map((link) => {
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
                    <span className="text-[10px] text-gray-500 opacity-60">{link.description}</span>
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
      </ScrollArea>

      <div className="p-3 border-t border-white/5">
        <div className="glass-light rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">System Online</span>
          </div>
          <p className="text-[10px] text-gray-500">10 agents ready • v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
