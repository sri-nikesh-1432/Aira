import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Rocket, Sun } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/workspace", label: "Workspace" },
  { href: "/agents", label: "Agents" },
  { href: "/generator", label: "Generator" },
  { href: "/validator", label: "Validator" },
  { href: "/judge", label: "Judge Sim" },
  { href: "/deploy", label: "Deploy" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            {navLinks.map((link) => {
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
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/workspace">
              <Button size="sm" className="gap-2">
                <Rocket className="w-4 h-4" />
                Launch Project
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
              {navLinks.map((link) => (
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
              <Link to="/workspace" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gap-2 mt-2">
                  <Rocket className="w-4 h-4" />
                  Launch Project
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
