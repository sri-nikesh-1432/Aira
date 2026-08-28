import type { Metadata, Viewport } from 'next'
import { AuthGuard } from '@/components/auth/AuthGuard'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIRA OS — Multi-Agent AI Orchestration System',
  description: 'Orchestrating 10 specialized AI agents to build complete projects.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F0EB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F0EB] text-[#2C2420] antialiased min-h-screen">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
