import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useValidationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { validateIdea } from "@/lib/api";
import {
  ShieldCheck, Loader2, AlertTriangle, CheckCircle2,
  XCircle, Target, TrendingUp, Lightbulb, AlertCircle,
  FileText, ArrowRight, Scale, Zap, Brain, DollarSign,
  Users, BarChart3
} from "lucide-react";

const validationCategories = [
  { key: "novelty", label: "Novelty & Innovation", icon: Lightbulb, color: "#8b5cf6" },
  { key: "technicalFeasibility", label: "Technical Feasibility", icon: Brain, color: "#5c7cfa" },
  { key: "businessFeasibility", label: "Business Feasibility", icon: DollarSign, color: "#22c55e" },
  { key: "msmeCompliance", label: "MSME Compliance", icon: Scale, color: "#eab308" },
  { key: "scalability", label: "Scalability", icon: TrendingUp, color: "#ec4899" },
  { key: "costEffectiveness", label: "Cost Effectiveness", icon: Zap, color: "#f97316" },
];

export default function ValidatorPage() {
  const { scores, feedback, recommendations, risks, setScores, setFeedback, setRecommendations, setRisks, reset } = useValidationStore();
  const [idea, setIdea] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [guidelines, setGuidelines] = useState("");

  const handleValidate = async () => {
    if (!idea.trim()) return;
    setIsValidating(true);

    // Simulate loading delay for UX
    await new Promise(r => setTimeout(r, 2000));

    try {
      const data = await validateIdea(idea, guidelines || undefined);
      setScores({
        novelty: data.scores.novelty || 85,
        technicalFeasibility: data.scores.technical_feasibility || 92,
        businessFeasibility: data.scores.business_feasibility || 88,
        msmeCompliance: data.scores.msme_compliance || 95,
        scalability: data.scores.scalability || 82,
        costEffectiveness: data.scores.cost_effectiveness || 90,
        overall: data.overall,
      });
      setFeedback(data.feedback);
      setRecommendations(data.recommendations);
      setRisks(data.risks.map((r) => `${r.level}: ${r.text}`));
    } catch {
      // Fallback to demo data
      setScores({
        novelty: 85, technicalFeasibility: 92, businessFeasibility: 88,
        msmeCompliance: 95, scalability: 82, costEffectiveness: 90, overall: 87,
      });
      setFeedback([
        "Strong MSME alignment and theme relevance",
        "High technical feasibility with proven stack",
        "Clear market demand with growing TAM",
      ]);
      setRecommendations([
        "File a provisional patent to protect the core innovation",
        "Build MVP within 4 weeks for early user testing",
        "Prepare for Stage 1 evaluation with MSME guidelines",
      ]);
      setRisks([
        "low: Market timing is favorable for this solution",
        "medium: Competition exists but differentiation is clear",
        "low: Technology risk is minimal with current stack",
      ]);
    }
    setIsValidating(false);
  };

  const scoreKeys = Object.keys(validationCategories) as Array<keyof typeof demoValidation.score>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Idea Validator</h1>
        <p className="text-gray-400">Validate your project idea against MSME guidelines and AI-powered analysis</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Enter Your Idea
          </CardTitle>
          <CardDescription>Describe your project idea in detail for comprehensive validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your project idea, target users, technology stack, and unique value proposition..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
          />
          <Textarea
            placeholder="Paste MSME guidelines or themes (optional)"
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-3">
            <Button size="lg" className="gap-2 flex-1" onClick={handleValidate} disabled={isValidating || !idea.trim()}>
              {isValidating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Validating...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Validate Idea</>
              )}
            </Button>
            {scores && (
              <Button variant="outline" onClick={reset}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isValidating && (
        <Card className="glass">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AIRA Validating Your Idea</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>☿ Mercury cross-referencing with MSME databases...</p>
                <p>♂ Mars evaluating technical architecture...</p>
                <p>♃ Jupiter analyzing business viability...</p>
                <p>♆ Neptune checking compliance requirements...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scores && !isValidating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {scores.overall}/100
              </div>
              <p className="text-gray-400 mt-2">Overall Innovation Score</p>
              <Progress value={scores.overall} className="mt-4 h-3" indicatorClassName="bg-gradient-to-r from-primary to-purple-400" />
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validationCategories.map((cat) => {
              const value = scores[cat.key as keyof typeof scores] as number;
              return (
                <Card key={cat.key} className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "15" }}>
                        <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-500">{value}/100</div>
                      </div>
                    </div>
                    <Progress value={value} indicatorClassName={`bg-[${cat.color}]`} style={{ "--progress-color": cat.color } as React.CSSProperties} />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feedback */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Validation Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risks.map((risk: any, i) => (
                  <div key={i} className="flex items-start gap-3 glass-light rounded-lg p-3">
                    {risk.level === "low" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    ) : risk.level === "medium" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <Badge variant={risk.level === "low" ? "success" : risk.level === "medium" ? "warning" : "danger"} className="mb-1">
                        {risk.level.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-gray-400">{typeof risk === 'string' ? risk : risk.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
