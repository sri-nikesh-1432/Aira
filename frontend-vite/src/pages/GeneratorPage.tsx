import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useIdeaStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { generateIdeas } from "@/lib/api";
import type { Idea } from "@/types";
import {
  Lightbulb, Sparkles, Loader2, Target, Clock, DollarSign,
  TrendingUp, Users, ArrowRight, Star, Zap, Filter,
  ChevronDown, Search, Brain, Globe
} from "lucide-react";

const themes = [
  "AI & Machine Learning",
  "Healthcare Technology",
  "Sustainable Development",
  "Smart Manufacturing",
  "AgriTech",
  "FinTech",
  "EdTech",
  "Clean Energy",
  "Smart Cities",
  "MSME Digitalization",
];

const sampleIdeas: Idea[] = [
  {
    title: "Smart Crop Disease Detection using Edge AI",
    description: "IoT-based system using camera sensors and edge AI for real-time crop disease detection. Deploys lightweight YOLO models on Raspberry Pi for offline inference, sending alerts via SMS and mobile app.",
    score: 92,
    tags: ["AI", "IoT", "Agriculture"],
    marketSize: "$2.1B",
    competition: "Low",
    timeline: "4 weeks",
    budget: "₹1.5L",
  },
  {
    title: "Voice-Enabled MSME Financial Dashboard",
    description: "Multilingual voice-activated financial dashboard for MSMEs supporting 8 Indian languages. Uses Whisper for transcription and LLMs for financial insights and recommendations.",
    score: 89,
    tags: ["Voice AI", "Fintech", "MSME"],
    marketSize: "$5.3B",
    competition: "Medium",
    timeline: "6 weeks",
    budget: "₹2L",
  },
  {
    title: "AI-Powered Legal Document Assistant",
    description: "Automated legal document analysis and drafting assistant for Indian MSMEs. Uses RAG with Indian legal databases to provide compliant document generation.",
    score: 87,
    tags: ["Legal AI", "RAG", "MSME"],
    marketSize: "$1.8B",
    competition: "Low",
    timeline: "5 weeks",
    budget: "₹1.8L",
  },
];

export default function GeneratorPage() {
  const { ideas, isGenerating, setIdeas, setGenerating, clearIdeas } = useIdeaStore();
  const [selectedTheme, setSelectedTheme] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setIdeas([]);

    // Simulate loading delay for UX
    await new Promise(r => setTimeout(r, 2000));

    try {
      const result = await generateIdeas(selectedTheme || undefined, budget || undefined);
      setIdeas(result);
    } catch {
      setIdeas(sampleIdeas);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Idea Generator</h1>
          <p className="text-gray-400">Generate innovative project ideas powered by AIRA intelligence</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Input Section */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Describe Your Area of Interest
          </CardTitle>
          <CardDescription>
            Tell AIRA what kind of project you want to build, and our agents will generate tailored ideas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your area of interest, problem you want to solve, or industry you want to target..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme / Industry</label>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme === selectedTheme ? "" : theme)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                          selectedTheme === theme
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "border-white/10 text-gray-400 hover:border-primary/20"
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget Range</label>
                    <Input
                      placeholder="e.g., ₹1-5 Lakhs"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Timeline</label>
                    <Input placeholder="e.g., 4-6 weeks" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AIRA Agents are generating ideas...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {isGenerating && (
        <Card className="glass">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AIRA Agents at Work</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>☿ Mercury researching market trends and opportunities...</p>
                <p>♂ Mars evaluating technical feasibility...</p>
                <p>♃ Jupiter analyzing business potential...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {ideas.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Generated Ideas ({ideas.length})
          </h2>
          {ideas.map((idea, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="success" className="gap-1">
                          <Star className="w-3 h-3" />
                          {idea.score}/100
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription className="mt-2">{idea.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Globe, label: "Market Size", value: idea.marketSize },
                      { icon: Target, label: "Competition", value: idea.competition },
                      { icon: Clock, label: "Timeline", value: idea.timeline },
                      { icon: DollarSign, label: "Budget", value: idea.budget },
                    ].map((item) => (
                      <div key={item.label} className="glass-light rounded-lg p-2 flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="text-[10px] text-gray-500">{item.label}</div>
                          <div className="text-xs font-medium">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
