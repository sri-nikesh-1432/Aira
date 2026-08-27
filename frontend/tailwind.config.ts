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
        background: '#09090B',
        surface: '#18181B',
        'surface-2': '#27272A',
        'surface-3': '#3F3F46',
        border: 'rgba(255, 255, 255, 0.06)',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        aira: '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
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
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(99,102,241,0.3)',
        'glow-secondary': '0 0 30px rgba(16,185,129,0.3)',
        'glow-accent': '0 0 30px rgba(245,158,11,0.3)',
        'glow-mercury': '0 0 20px rgba(181,169,169,0.3)',
        'glow-mars': '0 0 20px rgba(207,75,43,0.3)',
        'glow-venus': '0 0 20px rgba(232,184,109,0.3)',
        'glow-earth': '0 0 20px rgba(75,156,211,0.3)',
        'glow-pluto': '0 0 20px rgba(155,142,174,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
        'elevated': '0 12px 40px rgba(0,0,0,0.5)',
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
