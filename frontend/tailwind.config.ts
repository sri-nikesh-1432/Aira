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
        primary: '#8B5A2B',
        'primary-dark': '#6B3F1F',
        'primary-light': '#C4956A',
        secondary: '#10B981',
        accent: '#D4A574',
        background: '#F5F0EB',
        surface: '#FFFCF9',
        'surface-2': '#F0E8E0',
        'surface-3': '#E4DCD4',
        border: 'rgba(44, 36, 32, 0.06)',
        'text-primary': '#2C2420',
        'text-secondary': '#5A544E',
        'text-muted': '#A19B95',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        aira: '#8B5A2B',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44,36,32,0.04)',
        'card-hover': '0 4px 12px rgba(44,36,32,0.06)',
        'elevated': '0 8px 24px rgba(44,36,32,0.06)',
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
