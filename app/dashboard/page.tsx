'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, Loader2, BarChart3, Users, FileText, Code2, Award, Zap, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
}

const SUGGESTED_PROMPTS = [
  "What are Shreyas's technical skills?",
  "Tell me about his recent projects",
  "What's his work experience?",
  "What are his areas of expertise?"
]

const INITIAL_GREETING = "Hi! I'm here to answer questions about Shreyas's background and work. What would you like to know?"

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'agent',
      content: INITIAL_GREETING,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    setInput('')

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          agent_id: process.env.NEXT_PUBLIC_AGENT_ID || '68fd263d71c6b27d6c8eb80f',
          user_id: `user-${Date.now()}`,
          session_id: `session-${Date.now()}`
        })
      })

      const data = await response.json()

      let agentResponse = ''
      if (data.success && data.response) {
        agentResponse = typeof data.response === 'string'
          ? data.response
          : data.response.response || JSON.stringify(data.response)
      } else {
        agentResponse = "I'm having trouble retrieving that information. Could you ask another question?"
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const stats: StatCard[] = [
    {
      icon: <Code2 className="w-6 h-6" />,
      label: 'Projects Completed',
      value: '24',
      trend: '+3 this month'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Skills',
      value: '18',
      trend: '+2 new skills'
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Clients Served',
      value: '15',
      trend: '+1 new client'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: 'Active Projects',
      value: '5',
      trend: 'On track'
    }
  ]

  const recentWork = [
    {
      id: 1,
      title: 'AI Chatbot System',
      category: 'Full-stack Development',
      date: 'Nov 2024',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'Portfolio Website',
      category: 'Web Development',
      date: 'Oct 2024',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      category: 'React + TypeScript',
      date: 'Sep 2024',
      status: 'Completed'
    },
    {
      id: 4,
      title: 'Machine Learning Integration',
      category: 'AI/ML',
      date: 'In Progress',
      status: 'Active'
    }
  ]

  const skills = [
    'React', 'TypeScript', 'Next.js', 'Python', 'Node.js', 'PostgreSQL',
    'MongoDB', 'AI/ML', 'AWS', 'Docker', 'GraphQL', 'REST APIs'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">Shreyas Kapale</h1>
        <p className="text-slate-300 text-xl">Full-stack Developer & AI Enthusiast</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-slate-800/50 border-slate-700/50 p-6 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg text-blue-400">
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="text-xs text-green-400 font-semibold">{stat.trend}</span>
              )}
            </div>
            <h3 className="text-slate-400 text-sm mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Recent Work */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          </div>
          <div className="space-y-4">
            {recentWork.map((work) => (
              <div key={work.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex-1">
                  <p className="text-white font-semibold">{work.title}</p>
                  <p className="text-slate-400 text-sm">{work.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    {work.date}
                  </div>
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                    work.status === 'Completed'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-blue-900/30 text-blue-400'
                  )}>
                    {work.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Overview</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Completion Rate</span>
                <span className="text-white font-semibold">95%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Client Satisfaction</span>
                <span className="text-white font-semibold">98%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Code Quality</span>
                <span className="text-white font-semibold">92%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Section */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-6 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Technical Skills</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, idx) => (
            <span key={idx} className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 text-sm font-medium hover:bg-blue-600/30 transition-colors">
              {skill}
            </span>
          ))}
        </div>
      </Card>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 w-96">
        {/* Minimized Chat Bubble */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 border border-blue-500/50"
            aria-label="Open chat"
          >
            <MessageCircle size={28} />
          </button>
        )}

        {/* Expanded Chat Panel */}
        {isOpen && (
          <div className="absolute bottom-0 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-96 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-sm">Ask me about Shreyas</h3>
                  <p className="text-blue-100 text-xs">Portfolio Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed",
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Suggested Prompts */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-slate-500 px-2">Try asking:</p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        disabled={loading}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 text-left disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-white flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-3"
              >
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about skills, projects..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 text-sm"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-10 w-10"
                  size="icon"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
