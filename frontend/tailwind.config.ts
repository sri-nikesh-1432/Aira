import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        'primary-light': '#818CF8',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#0A0A14',
        surface: '#12121F',
        'surface-2': '#1A1A2E',
        'surface-3': '#16213E',
        border: '#1E2340',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Planet colors
        mercury: '#B5A9A9',
        mars: '#CF4B2B',
        venus: '#E8B86D',
        earth: '#4B9CD3',
        pluto: '#9B8EAE',
        aira: '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #1e2340 1px, transparent 1px)",
        'glow-primary': 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      },
      animation: {
        'spin-very-slow': 'spin 60s linear infinite',
        'spin-slow': 'spin 30s linear infinite',
        'spin-medium': 'spin 15s linear infinite',
        'spin-reverse': 'spin-reverse 25s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'typewriter': 'typewriter 3s steps(40) forwards',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99,102,241,0.4)',
        'glow-secondary': '0 0 20px rgba(16,185,129,0.4)',
        'glow-accent': '0 0 20px rgba(245,158,11,0.4)',
        'glow-mercury': '0 0 15px rgba(181,169,169,0.4)',
        'glow-mars': '0 0 15px rgba(207,75,43,0.4)',
        'glow-venus': '0 0 15px rgba(232,184,109,0.4)',
        'glow-earth': '0 0 15px rgba(75,156,211,0.4)',
        'glow-pluto': '0 0 15px rgba(155,142,174,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
