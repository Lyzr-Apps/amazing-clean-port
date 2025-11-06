'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  "What are Shreyas's technical skills?",
  "Tell me about his recent projects",
  "What's his work experience?",
  "What are his areas of expertise?"
]

const INITIAL_GREETING = "Hi! I'm here to answer questions about Shreyas's background and work. What would you like to know?"

export default function HomePage() {
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

    // Clear input immediately
    setInput('')

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      // Call the agent API with the user's query
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

      // Extract the response from the agent
      let agentResponse = ''
      if (data.success && data.response) {
        // Handle different response formats from agent
        agentResponse = typeof data.response === 'string'
          ? data.response
          : data.response.response || JSON.stringify(data.response)
      } else {
        agentResponse = "I'm having trouble retrieving that information. Could you ask another question?"
      }

      // Add agent message
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Error:', error)
      // Add error message
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Dancing Monkey */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-48 h-48">
          {/* Monkey body */}
          <div className="absolute inset-0 flex items-center justify-center animate-bounce" style={{ animationDuration: '1s' }}>
            {/* Head */}
            <div className="relative">
              {/* Ears */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-8">
                <div className="w-10 h-10 bg-orange-400 rounded-full" />
                <div className="w-10 h-10 bg-orange-400 rounded-full" />
              </div>

              {/* Face */}
              <div className="w-20 h-20 bg-orange-300 rounded-full flex items-center justify-center relative">
                {/* Eyes */}
                <div className="absolute flex gap-6 top-5">
                  <div className="w-3 h-3 bg-slate-900 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-slate-900 rounded-full animate-pulse" />
                </div>

                {/* Mouth */}
                <div className="absolute top-12 text-2xl">
                  😄
                </div>
              </div>

              {/* Body */}
              <div className="mt-2 w-16 h-20 bg-orange-400 rounded-lg mx-auto relative">
                {/* Arms - dancing motion */}
                <div className="absolute -left-8 top-2 w-6 h-12 bg-orange-300 rounded-full transform-gpu" style={{
                  animation: 'swing-left 0.8s ease-in-out infinite',
                  transformOrigin: 'top center'
                }} />
                <div className="absolute -right-8 top-2 w-6 h-12 bg-orange-300 rounded-full transform-gpu" style={{
                  animation: 'swing-right 0.8s ease-in-out infinite',
                  transformOrigin: 'top center'
                }} />

                {/* Legs */}
                <div className="absolute -bottom-6 left-1 w-5 h-8 bg-orange-300 rounded-full" />
                <div className="absolute -bottom-6 right-1 w-5 h-8 bg-orange-300 rounded-full" />
              </div>

              {/* Tail */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-3 h-20 bg-orange-600 rounded-full" style={{
                animation: 'wiggle 0.6s ease-in-out infinite',
                transformOrigin: 'top center'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content - placeholder for website */}
      <div className="text-center max-w-2xl relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">
          Shreyas Kapale
        </h1>
        <p className="text-slate-300 text-xl mb-8">
          Full-stack Developer & AI Enthusiast
        </p>
        <p className="text-slate-400 text-lg">
          Ask the chatbot about my background, skills, and projects using the widget in the bottom-right corner
        </p>
      </div>

      {/* Chat Widget Container */}
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

      <style jsx>{`
        @keyframes swing-left {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-45deg);
          }
        }

        @keyframes swing-right {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(45deg);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-15deg);
          }
        }
      `}</style>
    </div>
  )
}
