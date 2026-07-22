import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";import {
  Rocket, Loader2, CheckCircle2, Globe, Server,
  Cloud, ExternalLink, Terminal, GitBranch, Box,
  ArrowRight, RefreshCw, Shield, Zap
} from "lucide-react";

const platforms = [
  { id: "vercel", name: "Vercel", icon: Globe, color: "#5c7cfa", description: "Best for frontend apps" },
  { id: "netlify", name: "Netlify", icon: Cloud, color: "#22c55e", description: "Great for static sites" },
  { id: "railway", name: "Railway", icon: Server, color: "#8b5cf6", description: "Full-stack deployment" },
  { id: "docker", name: "Docker", icon: Box, color: "#06b6d4", description: "Container deployment" },
  { id: "render", name: "Render", icon: Cloud, color: "#eab308", description: "Backend services" },
  { id: "aws", name: "AWS", icon: Server, color: "#f97316", description: "Enterprise cloud" },
  { id: "github", name: "GitHub Pages", icon: GitBranch, color: "#ec4899", description: "Static hosting" },
];

export default function DeployPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");

  const handleDeploy = () => {
    if (!selectedPlatform) return;
    setIsDeploying(true);

    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
      setDeployUrl(`https://your-project.${selectedPlatform}.app`);
    }, 4000);
  };

  const deploySteps = [
    { label: "Building application", done: true },
    { label: "Running tests", done: true },
    { label: "Optimizing assets", done: true },
    { label: "Pushing to platform", done: !isDeploying && deployed },
    { label: "Configuring domain", done: deployed },
    { label: "Deploying to production", done: deployed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deploy Project</h1>
        <p className="text-gray-400">Deploy your project to any platform with AIRA's intelligent deployment pipeline</p>
      </div>

      {!deployed && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Select Deployment Platform
            </CardTitle>
            <CardDescription>Choose where you want to deploy your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    "glass rounded-xl p-4 text-center hover:border-primary/30 transition-all duration-200",
                    selectedPlatform === platform.id && "border-primary/30 ring-1 ring-primary/30"
                  )}
                  style={selectedPlatform === platform.id ? { borderColor: platform.color + "60" } : {}}
                >
                  <platform.icon
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: platform.color }}
                  />
                  <div className="text-sm font-medium">{platform.name}</div>
                  <div className="text-[10px] text-gray-500">{platform.description}</div>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleDeploy}
              disabled={!selectedPlatform || isDeploying}
            >
              {isDeploying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</>
              ) : (
                <><Rocket className="w-5 h-5" /> Deploy to {platforms.find(p => p.id === selectedPlatform)?.name || "Platform"}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isDeploying && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary animate-pulse" />
              AIRA Deployment Pipeline
            </CardTitle>
            <CardDescription>Pluto is orchestrating your deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deploySteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    step.done ? "bg-green-500/20 text-green-400" : "bg-secondary text-gray-500"
                  )}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                  <span className={cn("text-sm", step.done ? "text-green-400" : "text-gray-500")}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {deployed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="glass border-green-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Deployment Successful!</h2>
              <p className="text-gray-400 mb-4">Your project is now live and accessible</p>
              <div className="glass-light rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Globe className="w-4 h-4" />
                  Production URL
                </div>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {deployUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "SSL/TLS", value: "Active" },
                  { icon: Zap, label: "Response Time", value: "45ms" },
                  { icon: Globe, label: "CDN", value: "Enabled" },
                  { icon: RefreshCw, label: "Auto-scaling", value: "Configured" },
                ].map((item) => (
                  <div key={item.label} className="glass-light rounded-lg p-3 text-center">
                    <item.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-green-400">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Live Site
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => { setDeployed(false); setSelectedPlatform(""); }}>
              <RefreshCw className="w-4 h-4" />
              Deploy Again
            </Button>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Deployment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Platform</span><span>{platforms.find(p => p.id === selectedPlatform)?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Build Time</span><span>12.3s</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bundle Size</span><span>284 KB (gzipped)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Deployed At</span><span>{new Date().toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-400">Healthy</span></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
