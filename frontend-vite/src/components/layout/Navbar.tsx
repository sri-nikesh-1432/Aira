import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Rocket, Sun, ChevronDown } from "lucide-react";

const topLinks = [
  { href: "/", label: "Home" },
  { href: "/aira", label: "AIRA Central" },
  { href: "/workspace", label: "Workspace" },
  { href: "/agents", label: "All Agents" },
  { href: "/generator", label: "Generator" },
  { href: "/validator", label: "Validator" },
];

const agents = [
  { href: "/agent/mercury", label: "☿ Mercury", desc: "Research" },
  { href: "/agent/venus", label: "♀ Venus", desc: "Design" },
  { href: "/agent/earth", label: "🌍 Earth", desc: "Development" },
  { href: "/agent/mars", label: "♂ Mars", desc: "Architecture" },
  { href: "/agent/jupiter", label: "♃ Jupiter", desc: "Business" },
  { href: "/agent/saturn", label: "♄ Saturn", desc: "Documentation" },
  { href: "/agent/uranus", label: "♅ Uranus", desc: "Evolution" },
  { href: "/agent/neptune", label: "♆ Neptune", desc: "Testing" },
  { href: "/agent/pluto", label: "🪐 Pluto", desc: "Deploy" },
  { href: "/agent/luna", label: "🌑 Luna", desc: "Memory" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center glow-sun">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 animate-ping opacity-20" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent tracking-wider">
                AIRA
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">Multi-Agent AI OS</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {topLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-sm transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            {/* Agents Dropdown */}
            <div className="relative"
              onMouseEnter={() => setAgentsOpen(true)}
              onMouseLeave={() => setAgentsOpen(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm transition-all duration-200 gap-1",
                  location.pathname.startsWith("/agent/")
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Planets <ChevronDown className="w-3 h-3" />
              </Button>
              <AnimatePresence>
                {agentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-1 glass rounded-xl border border-white/10 overflow-hidden min-w-[200px] shadow-2xl"
                  >
                    {agents.map((agent) => (
                      <Link
                        key={agent.href}
                        to={agent.href}
                        onClick={() => setAgentsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5",
                          location.pathname === agent.href ? "text-primary bg-primary/5" : "text-gray-300"
                        )}
                      >
                        <span>{agent.label}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">{agent.desc}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/aira">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                <Sun className="w-4 h-4" />
                Talk to AIRA
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {topLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-400 hover:text-white hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-1 text-xs text-gray-600 font-medium">PLANETS</div>
              {agents.map((agent) => (
                <Link
                  key={agent.href}
                  to={agent.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    location.pathname === agent.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-400 hover:text-white hover:bg-accent"
                  )}
                >
                  {agent.label}
                </Link>
              ))}
              <Link to="/aira" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gap-2 mt-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Sun className="w-4 h-4" />
                  Talk to AIRA
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
