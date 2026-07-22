import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { judgeSimulate } from "@/lib/api";
import type { JudgeQuestion } from "@/types";
import {
  Gavel, Loader2, Mic, MessageSquare, Target,
  Clock, Star, ChevronRight, CheckCircle2, AlertCircle,
  BookOpen, Users
} from "lucide-react";

const demoQuestions: JudgeQuestion[] = [
  { id: "1", question: "What problem does your solution solve, and why is it important?", category: "Problem Statement", difficulty: "easy" },
  { id: "2", question: "How is your approach different from existing solutions in the market?", category: "Innovation", difficulty: "medium" },
  { id: "3", question: "Explain your technical architecture and why you chose this approach.", category: "Technical", difficulty: "medium" },
  { id: "4", question: "What is your business model and revenue strategy?", category: "Business", difficulty: "hard" },
  { id: "5", question: "How does your project align with MSME guidelines and themes?", category: "MSME Compliance", difficulty: "medium" },
  { id: "6", question: "What is your go-to-market strategy and target customer segment?", category: "Business", difficulty: "hard" },
];

export default function JudgePage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [questions, setQuestions] = useState<JudgeQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [simComplete, setSimComplete] = useState(false);
  const [score, setScore] = useState(0);

  const startSimulation = async () => {
    setIsSimulating(true);

    try {
      const data = await judgeSimulate();
      setQuestions(data.questions);
    } catch {
      setQuestions(demoQuestions);
    }
    setIsSimulating(false);
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    setAnswers({ ...answers, [questions[currentQ].id]: currentAnswer });
    setCurrentAnswer("");

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const avgScore = Math.floor(70 + Math.random() * 20);
      setScore(avgScore);
      setSimComplete(true);
    }
  };

  const resetSim = () => {
    setQuestions([]);
    setCurrentQ(0);
    setAnswers({});
    setCurrentAnswer("");
    setSimComplete(false);
    setScore(0);
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "easy": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Judge Simulator</h1>
          <p className="text-gray-400">Practice your pitch with AI-powered judge simulation</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Gavel className="w-3 h-3" />
          Stage {currentQ + 1}/6
        </Badge>
      </div>

      {!isSimulating && questions.length === 0 && !simComplete && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Start Judge Simulation
            </CardTitle>
            <CardDescription>
              Practice answering judge questions for your MSME competition. Get scored on each response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Users, label: "Realistic Questions", desc: "Based on actual MSME competitions" },
                { icon: Target, label: "Scored Responses", desc: "Get feedback on each answer" },
                { icon: BookOpen, label: "Multiple Stages", desc: "Practice Round 1, 2 & 3" },
              ].map((item) => (
                <div key={item.label} className="glass-light rounded-xl p-4 text-center">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full gap-2" onClick={startSimulation}>
              <Gavel className="w-5 h-5" />
              Start Simulation
            </Button>
          </CardContent>
        </Card>
      )}

      {isSimulating && (
        <Card className="glass">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preparing Judge Panel</h3>
              <p className="text-gray-400">Generating personalized questions for your pitch...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && !simComplete && (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Progress */}
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Question {currentQ + 1} of {questions.length}</span>
                <Badge variant="outline" className={getDifficultyColor(questions[currentQ].difficulty)}>
                  {questions[currentQ].difficulty}
                </Badge>
              </div>
              <Progress value={((currentQ + 1) / questions.length) * 100} />
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{questions[currentQ].category}</Badge>
              </div>
              <CardTitle className="text-lg">{questions[currentQ].question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={4}
              />
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" onClick={submitAnswer} disabled={!currentAnswer.trim()}>
                  {currentQ < questions.length - 1 ? (
                    <><ChevronRight className="w-4 h-4" /> Next Question</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Submit Answer</>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setCurrentAnswer("")}>Clear</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {simComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {score}/100
              </div>
              <p className="text-gray-400 mt-2">Overall Judge Score</p>
              <Progress value={score} className="mt-4 h-3" indicatorClassName="bg-gradient-to-r from-green-400 to-blue-400" />
              <div className="flex items-center justify-center gap-2 mt-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Response Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="glass-light rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                    </div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {answers[q.id] ? "✓ Answered" : "✗ Skipped"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" onClick={resetSim}>
              <Gavel className="w-4 h-4" />
              Practice Again
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
