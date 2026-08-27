'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import {
  Brain, Send, Upload, X, Sparkles, ChevronDown, ChevronRight,
  Loader2, AlertCircle, Lightbulb, Globe,
} from 'lucide-react'
import { SolarSystem } from '@/components/planets/SolarSystem'
import { createProject, uploadFile, checkHealth } from '@/lib/api'
import { PLANETS } from '@/types'
import { clsx } from 'clsx'
import { useEffect } from 'react'

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
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

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

  return (
    <div className="min-h-screen space-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4"
              style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(255,215,0,0.1)', boxShadow: '0 0 20px rgba(255,215,0,0.1)' }}>
            <span className="text-lg">☀️</span>
          </div>
          <div>
            <p className="font-bold text-sm text-white">AIRA OS</p>
            <p className="text-[11px] text-[#52525B] leading-none">Multi-Agent AI</p>
          </div>
        </Link>
        <p className="text-sm" style={{ color: '#71717A' }}>New Project</p>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Start a New
                <span className="text-gradient"> Project</span>
              </h1>
              <p className="text-sm mb-8" style={{ color: '#71717A' }}>
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
                <p className="text-xs mt-1.5" style={{ color: '#52525B' }}>
                  Be descriptive — the more context you give, the better the output.
                </p>
              </div>

              {/* Example ideas */}
              <div className="mb-6">
                <p className="text-xs mb-2 flex items-center gap-1" style={{ color: '#52525B' }}>
                  <Lightbulb className="w-3 h-3" /> Example ideas:
                </p>
                <div className="space-y-1.5">
                  {EXAMPLE_IDEAS.slice(0, 3).map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setIdea(ex)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg glass-card transition-all"
                    >
                      <ChevronRight className="w-3 h-3 inline mr-1" style={{ color: '#52525B' }} />
                      <span style={{ color: '#71717A' }}>{ex}</span>
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
                    isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                  )}
                  style={{ borderColor: isDragActive ? '#6366F1' : 'rgba(255,255,255,0.08)' }}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#52525B' }} />
                  <p className="text-sm" style={{ color: '#71717A' }}>
                    {isDragActive ? 'Drop files here' : 'Drag MSME PDFs, PPTs, docs here, or click to browse'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#3F3F46' }}>PDF, PPT, DOCX, TXT • Max 5 files</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
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
                className="flex items-center gap-2 text-sm transition-colors mb-3"
                style={{ color: '#71717A' }}
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
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
                     style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
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
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-white hover:scale-[1.01] hover:shadow-glow-primary'
                )}
                style={{
                  background: isSubmitting || !idea.trim() ? '#18181B' : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                }}
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

              {/* API Status */}
              {apiOnline === false && (
                <p className="text-xs text-center mt-3" style={{ color: '#F59E0B' }}>
                  ⚠️ Backend API appears offline. Make sure it&apos;s running on port 8000.
                </p>
              )}
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

            {/* Pipeline steps */}
            <div className="w-full space-y-1.5">
              {PLANETS.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl glass-card"
                >
                  <span className="text-lg w-8 text-center">{step.symbol}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold" style={{ color: step.color }}>
                      {step.name}
                    </span>
                    <p className="text-xs truncate" style={{ color: '#52525B' }}>
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
