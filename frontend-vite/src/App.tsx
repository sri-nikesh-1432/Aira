import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import WorkspacePage from "@/pages/WorkspacePage";
import AgentsPage from "@/pages/AgentsPage";
import GeneratorPage from "@/pages/GeneratorPage";
import ValidatorPage from "@/pages/ValidatorPage";
import EvaluatorPage from "@/pages/EvaluatorPage";
import JudgePage from "@/pages/JudgePage";
import DeployPage from "@/pages/DeployPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/validator" element={<ValidatorPage />} />
          <Route path="/evaluator" element={<EvaluatorPage />} />
          <Route path="/judge" element={<JudgePage />} />
          <Route path="/deploy" element={<DeployPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
