import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shreyas Kapale - Portfolio',
  description: 'Professional portfolio with AI chatbot assistant. Ask about skills, projects, and work experience.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
