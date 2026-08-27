'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import {
  Brain, Send, Upload, X, Sparkles, ChevronDown, ChevronRight,
  Loader2, AlertCircle, Lightbulb, ArrowLeft,
} from 'lucide-react'
import { createProject, uploadFile, checkHealth } from '@/lib/api'
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-base">☀️</span>
          </div>
          <div>
            <p className="font-bold text-[13px] text-zinc-900 leading-none">AIRA OS</p>
            <p className="text-[10px] text-zinc-400 leading-none mt-0.5">Multi-Agent AI</p>
          </div>
        </Link>
        <p className="text-sm text-zinc-400">New Project</p>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Form */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-zinc-900">
              Start a New <span className="text-gradient">Project</span>
            </h1>
            <p className="text-sm mb-8 text-zinc-500">
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
              <p className="text-[11px] mt-1.5 text-zinc-400">
                Be descriptive — the more context you give, the better the output.
              </p>
            </div>

            {/* Example ideas */}
            <div className="mb-6">
              <p className="text-[11px] mb-1.5 flex items-center gap-1 text-zinc-400">
                <Lightbulb className="w-3 h-3" /> Example ideas:
              </p>
              <div className="space-y-1">
                {EXAMPLE_IDEAS.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setIdea(ex)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 inline mr-1 text-zinc-300" />
                    <span className="text-zinc-500">{ex}</span>
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
                  'border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all',
                  isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-zinc-300 hover:border-indigo-300 bg-white'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-7 h-7 mx-auto mb-2 text-zinc-300" />
                <p className="text-sm text-zinc-500">
                  {isDragActive ? 'Drop files here' : 'Drag MSME PDFs, PPTs, docs here, or click to browse'}
                </p>
                <p className="text-[11px] mt-1 text-zinc-400">PDF, PPT, DOCX, TXT &bull; Max 5 files</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {uploadedFiles.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
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
              className="flex items-center gap-1.5 text-sm transition-colors mb-3 text-zinc-500 hover:text-zinc-700"
            >
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-2.5 pb-4">
                <div>
                  <label className="label">MSME / Hackathon Theme</label>
                  <select value={msmeTheme} onChange={(e) => setMsmeTheme(e.target.value)} className="input-field text-sm">
                    <option value="">Select theme...</option>
                    {MSME_THEMES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="label">Target Audience</label>
                  <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Small manufacturers, rural clinics, college students" className="input-field text-sm" />
                </div>
                <div>
                  <label className="label">Technology Preferences</label>
                  <input value={techPreferences} onChange={(e) => setTechPreferences(e.target.value)}
                    placeholder="e.g., React, Python, open source only" className="input-field text-sm" />
                </div>
                <div>
                  <label className="label">Competition / Event Name</label>
                  <input value={competitionName} onChange={(e) => setCompetitionName(e.target.value)}
                    placeholder="e.g., MSME Innovation Challenge 2026" className="input-field text-sm" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4 bg-red-50 border border-red-200 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !idea.trim()}
              className={clsx(
                'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all',
                isSubmitting || !idea.trim()
                  ? 'opacity-40 cursor-not-allowed bg-zinc-200 text-zinc-400'
                  : 'text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5'
              )}
              style={!isSubmitting && idea.trim() ? { background: 'linear-gradient(135deg, #6366F1, #4F46E5)' } : {}}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Launching AIRA...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Launch AIRA Pipeline <Send className="w-4 h-4" /></>
              )}
            </button>

            {apiOnline === false && (
              <p className="text-[11px] text-center mt-3 text-amber-500">
                ⚠️ Backend API appears offline. Make sure it&apos;s running on port 8000.
              </p>
            )}
          </div>

          {/* Right: Pipeline steps */}
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">What Happens Next</p>
              <p className="text-[11px] text-zinc-300">10 AI agents work in sequence</p>
            </div>
            <div className="space-y-2">
              {PLANETS.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200">
                  <span className="text-lg w-8 text-center">{step.symbol}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold" style={{ color: step.color }}>{step.name}</span>
                    <p className="text-[11px] text-zinc-400 truncate">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
