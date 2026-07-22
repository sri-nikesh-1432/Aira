import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Loader2, FileText, CheckCircle2, AlertTriangle,
  BarChart3, Code, Shield, Zap, Target, Download
} from "lucide-react";

export default function EvaluatorPage() {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluated(true);
    }, 3000);
  };

  const categories = [
    { label: "MSME Compliance", score: 88, color: "#22c55e", icon: Shield },
    { label: "Technical Quality", score: 85, color: "#5c7cfa", icon: Code },
    { label: "Innovation Score", score: 79, color: "#8b5cf6", icon: Zap },
    { label: "Code Quality", score: 90, color: "#06b6d4", icon: BarChart3 },
    { label: "Business Validation", score: 72, color: "#eab308", icon: Target },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Evaluation Portal</h1>
        <p className="text-gray-400">Upload and evaluate existing projects against MSME standards</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Project
          </CardTitle>
          <CardDescription>Upload your project files (PDF, ZIP, or source code) for comprehensive evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/30 transition-all duration-200 cursor-pointer">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-1">Drop your project files here</p>
            <p className="text-sm text-gray-500">or click to browse • PDF, ZIP, DOCX up to 50MB</p>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Project...</>
            ) : (
              <><FileText className="w-5 h-5" /> Evaluate Project</>
            )}
          </Button>
        </CardContent>
      </Card>

      {isEvaluating && (
        <Card className="glass">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AIRA Analyzing Your Project</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>🔍 Scanning codebase structure...</p>
                <p>📊 Running quality metrics...</p>
                <p>✅ Checking MSME compliance...</p>
                <p>📝 Generating evaluation report...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {evaluated && !isEvaluating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                82/100
              </div>
              <p className="text-gray-400 mt-2">Overall Project Score</p>
              <Progress value={82} className="mt-4 h-3" indicatorClassName="bg-gradient-to-r from-green-400 to-blue-400" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.label} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "15" }}>
                      <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.score}/100</div>
                    </div>
                  </div>
                  <Progress value={cat.score} indicatorClassName={`bg-[${cat.color}]`} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Evaluation Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Follows MSME guidelines and theme alignment</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Solid technical implementation with best practices</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span>Documentation needs improvement for submission</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span>Business validation section could be stronger</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="gap-2 flex-1">
              <Download className="w-4 h-4" />
              Download Full Report
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
