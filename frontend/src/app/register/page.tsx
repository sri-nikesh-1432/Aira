'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { register } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const router = useRouter()
  const { user, setAuth, loadFromStorage } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    loadFromStorage()
    setInitialized(true)
  }, [loadFromStorage])

  useEffect(() => {
    if (initialized && user) router.replace('/dashboard')
  }, [initialized, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const data = await register({ name: name.trim(), email: email.trim(), password, confirm_password: confirmPassword })
      setAuth(data.user, data.token)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (initialized && user) return null

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5A2B] to-[#6B3F1F] flex items-center justify-center shadow-sm">
              <span className="text-xl">☀️</span>
            </div>
            <div>
              <p className="font-bold text-lg text-[#2C2420] leading-none">AIRA OS</p>
              <p className="text-[10px] text-[#A19B95] leading-none mt-0.5">Multi-Agent AI</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#2C2420]">Create your account</h1>
          <p className="text-sm text-[#A19B95] mt-1">Start building with AIRA&apos;s 9 AI agents</p>
        </div>

        <div className="p-8 rounded-2xl bg-[#FFFCF9] border border-[#2C2420]/8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200/60 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#716B65] mb-1.5">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4C8BC]" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2C2420]/10 bg-white text-sm text-[#2C2420] placeholder:text-[#D4C8BC] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]/40 transition-all"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#716B65] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4C8BC]" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2C2420]/10 bg-white text-sm text-[#2C2420] placeholder:text-[#D4C8BC] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]/40 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#716B65] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4C8BC]" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#2C2420]/10 bg-white text-sm text-[#2C2420] placeholder:text-[#D4C8BC] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]/40 transition-all"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4C8BC] hover:text-[#A19B95] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#716B65] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4C8BC]" />
                <input
                  type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2C2420]/10 bg-white text-sm text-[#2C2420] placeholder:text-[#D4C8BC] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B]/40 transition-all"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#2C2420]/5 text-center">
            <p className="text-xs text-[#A19B95]">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#8B5A2B] hover:text-[#6B3F1F] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
