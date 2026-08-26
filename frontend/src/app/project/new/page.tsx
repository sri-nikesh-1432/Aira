'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  Brain, Send, Upload, X, Sparkles, ChevronDown, ChevronRight,
  Loader2, AlertCircle, Lightbulb
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { createProject, uploadFile } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'

const EXAMPLE_IDEAS = [
  "Build an AI-powered Healthcare Assistant for rural clinics with voice support",
  "Create a Smart Manufacturing Platform with Digital Twin and IoT monitoring",
  "Develop a Multi-Agent Research Tool for MSME entrepreneurs",
  "Build an AI-powered Netflix Clone with neural recommendation system",
  "Create an Agentic Code Review Platform for development teams",
]

const MSME_THEMES = [
  "Industry 4.0 & Smart Manufacturing",
  "Healthcare & MedTech",
  "AgriTech & Rural Development",
  "EdTech & Skill Development",
  "FinTech & Digital Payments",
  "Clean Energy & Sustainability",
  "Supply Chain & Logistics",
  "Cybersecurity & Data Privacy",
]

export default function NewProjectPage() {
  const router = useRouter()
  const [idea, setIdea] = useState('')
  const [msmeTheme, setMsmeTheme] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [techPreferences, setTechPreferences] = useState('')
  const [competitionName, setCompetitionName] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; id: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const result = await uploadFile(file)
        setUploadedFiles(prev => [...prev, { name: file.name, id: result.file_id }])
      } catch {
        setError(`Failed to upload ${file.name}`)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt', '.md'],
    },
    maxFiles: 5,
  })

  const handleSubmit = async () => {
    if (!idea.trim()) {
      setError('Please describe your project idea')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await createProject({
        idea: idea.trim(),
        msme_theme: msmeTheme || undefined,
        target_audience: targetAudience || undefined,
        tech_preferences: techPreferences || undefined,
        competition_name: competitionName || undefined,
      })

      router.push(`/project/${result.project_id}`)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to start project. Is the backend running?')
      setIsSubmitting(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setIdea(example)
  }

  return (
    <div className="min-h-screen space-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">AIRA OS</span>
        </button>
        <p className="text-sm text-text-muted">New Project</p>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold mb-2">
                Start a New
                <span className="text-gradient"> Project</span>
              </h1>
              <p className="text-text-muted mb-8">
                Describe your idea and AIRA will orchestrate all 9 specialized AI planets to build it end-to-end.
              </p>

              {/* Main idea input */}
              <div className="mb-4">
                <label className="label">Project Idea *</label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe what you want to build... e.g., 'Build an AI Healthcare Assistant for MSME clinics with voice support and patient management'"
                  rows={5}
                  className="input-field resize-none text-sm leading-relaxed"
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Be descriptive — the more context you give, the better the output.
                </p>
              </div>

              {/* Example ideas */}
              <div className="mb-6">
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Example ideas:
                </p>
                <div className="space-y-1.5">
                  {EXAMPLE_IDEAS.slice(0, 3).map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(ex)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg glass border border-border hover:border-primary/30 hover:text-white text-text-muted transition-all"
                    >
                      <ChevronRight className="w-3 h-3 inline mr-1" />
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div className="mb-4">
                <label className="label">Upload Files (Optional)</label>
                <div
                  {...getRootProps()}
                  className={clsx(
                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    {isDragActive ? 'Drop files here' : 'Drag MSME PDFs, PPTs, docs here, or click to browse'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">PDF, PPT, DOCX, TXT • Max 5 files</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                        {f.name}
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced options */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-3"
              >
                <ChevronDown className={clsx('w-4 h-4 transition-transform', showAdvanced && 'rotate-180')} />
                Advanced Options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pb-4">
                      <div>
                        <label className="label">MSME / Hackathon Theme</label>
                        <select
                          value={msmeTheme}
                          onChange={(e) => setMsmeTheme(e.target.value)}
                          className="input-field text-sm"
                        >
                          <option value="">Select theme...</option>
                          {MSME_THEMES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Target Audience</label>
                        <input
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g., Small manufacturers, rural clinics, college students"
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="label">Technology Preferences</label>
                        <input
                          value={techPreferences}
                          onChange={(e) => setTechPreferences(e.target.value)}
                          placeholder="e.g., React, Python, open source only"
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="label">Competition / Event Name</label>
                        <input
                          value={competitionName}
                          onChange={(e) => setCompetitionName(e.target.value)}
                          placeholder="e.g., MSME Innovation Challenge 2026"
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !idea.trim()}
                className={clsx(
                  'w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all',
                  isSubmitting || !idea.trim()
                    ? 'opacity-50 cursor-not-allowed bg-surface-2 text-text-muted'
                    : 'btn-primary text-white'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Launching AIRA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Launch AIRA Pipeline
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Right: Solar system preview + info */}
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SolarSystem
                planetStatuses={Object.fromEntries(PLANETS.map((p) => [p.id, 'idle']))}
                size="md"
              />
            </motion.div>

            {/* Pipeline steps — all 10 agents */}
            <div className="w-full space-y-2">
              {PLANETS.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl glass border border-border"
                >
                  <span className="text-lg w-8 text-center">{step.symbol}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold" style={{ color: step.color }}>
                      {step.name}
                    </span>
                    <p className="text-xs text-text-muted truncate">
                      {step.id === 'aira' && 'Understands your goal & orchestrates every planet'}
                      {step.id === 'mercury' && 'Researches domain, competitors, patents, MSME rules'}
                      {step.id === 'mars' && 'Designs system architecture & tech stack'}
                      {step.id === 'venus' && 'Creates design system & UI/UX guidelines'}
                      {step.id === 'earth' && 'Generates complete production-ready code'}
                      {step.id === 'jupiter' && 'Builds business model, pricing & investor pitch'}
                      {step.id === 'saturn' && 'Writes documentation, reports & pitch deck'}
                      {step.id === 'neptune' && 'Runs tests, security scans & QA validation'}
                      {step.id === 'uranus' && 'Extracts lessons & optimizes future missions'}
                      {step.id === 'pluto' && 'Produces Docker, CI/CD & deployment config'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
