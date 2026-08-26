import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIRA OS — Multi-Agent AI Orchestration System',
  description:
    'AIRA (Artificial Intelligence Research & Innovation Assistant) — The Central Intelligence of AIRA OS. Orchestrating 5 specialized AI planets to build complete projects.',
  authors: [{ name: 'Sri D' }],
  keywords: ['AI', 'Multi-Agent', 'Orchestration', 'AIRA', 'MSME', 'Hackathon'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
