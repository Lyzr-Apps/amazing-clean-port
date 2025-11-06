'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
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
          agent_id: 'portfolio-assistant',
          conversation_context: messages.map(m => ({
            type: m.type,
            content: m.content
          }))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Main content - placeholder for website */}
      <div className="text-center max-w-2xl">
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

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Minimized Chat Bubble */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700",
              "shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-blue-600",
              "flex items-center justify-center text-white transition-all duration-200",
              "hover:scale-110 active:scale-105",
              "border border-blue-500/50"
            )}
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-pulse" style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </button>
        )}

        {/* Expanded Chat Panel */}
        {isOpen && (
          <Card className={cn(
            "absolute bottom-0 right-0 w-full max-w-sm h-[32rem] sm:h-96 rounded-2xl",
            "bg-white shadow-2xl border border-slate-200",
            "flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 duration-300"
          )}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Ask me about Shreyas</h3>
                  <p className="text-blue-100 text-xs">Portfolio Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 pr-4">
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
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Suggested Prompts - only show when no user messages */}
                {messages.length === 1 && !loading && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs text-slate-500 px-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          disabled={loading}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full",
                            "bg-slate-100 text-slate-700 hover:bg-slate-200",
                            "transition-colors border border-slate-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-white">
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
                  placeholder="Ask about experience, skills, projects..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "flex-1 text-sm border-slate-300",
                    "focus:border-blue-500 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={cn(
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "p-2 h-10 w-10"
                  )}
                  size="icon"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
