import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2, Sun } from "lucide-react";

const HomePage = lazy(() => import("@/pages/HomePage"));
const AiraPage = lazy(() => import("@/pages/AiraPage"));
const WorkspacePage = lazy(() => import("@/pages/WorkspacePage"));
const AgentsPage = lazy(() => import("@/pages/AgentsPage"));
const AgentDetailPage = lazy(() => import("@/pages/AgentDetailPage"));
const GeneratorPage = lazy(() => import("@/pages/GeneratorPage"));
const ValidatorPage = lazy(() => import("@/pages/ValidatorPage"));
const EvaluatorPage = lazy(() => import("@/pages/EvaluatorPage"));
const JudgePage = lazy(() => import("@/pages/JudgePage"));
const DeployPage = lazy(() => import("@/pages/DeployPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 glow-sun">
          <Sun className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        <p className="text-sm text-gray-400 mt-2">Loading AIRA module...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/aira" element={<AiraPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agent/:id" element={<AgentDetailPage />} />
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/validator" element={<ValidatorPage />} />
              <Route path="/evaluator" element={<EvaluatorPage />} />
              <Route path="/judge" element={<JudgePage />} />
              <Route path="/deploy" element={<DeployPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
