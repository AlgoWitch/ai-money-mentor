import { useState, useCallback, useRef } from 'react'
import { api } from '../utils/api'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your AI Money Mentor 👋\n\nWhat's your biggest money goal right now?",
  cards: [],
  quickReplies: ['Save money', 'Invest', 'Reduce debt'],
  timestamp: new Date(),
}

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const messageIdCounter = useRef(1)

  const nextId = () => `msg-${messageIdCounter.current++}`

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    const userMsg = {
      id: nextId(),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      // Uses api.js (axios + auth token injected automatically)
      const response = await api.chat(text)

      const aiMsg = {
        id: nextId(),
        role: 'ai',
        text: response.text || 'I processed that.',
        cards: response.cards || [],
        quickReplies: [],
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'ai',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }, [])

  const handleQuickReply = useCallback((reply) => {
    sendMessage(reply)
  }, [sendMessage])

  const handleFileUpload = useCallback(async (file) => {
    const noticeMsg = {
      id: nextId(),
      role: 'user',
      text: `📎 Uploaded: ${file.name}`,
      isUpload: true,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, noticeMsg])
    setIsTyping(true)

    try {
      // Upload PDF via api.js (has auth token)
      const res = await api.extractPdf(file)
      if (res.text) {
        const analysisRes = await api.analyzeProfile(res.text)
        setMessages(prev => [...prev, {
          id: nextId(),
          role: 'ai',
          text: `Got it! I've analyzed your document **${file.name}**.\n\n${analysisRes.analysis || 'Profile updated.'}`,
          cards: [{ type: 'plan', title: 'Document Verified', content: analysisRes.ai_verification || 'Wealth profile synced.' }],
          quickReplies: [],
          timestamp: new Date(),
        }])
      } else {
        throw new Error(res.message || 'Could not extract text')
      }
    } catch (err) {
      console.error('File upload error:', err)
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'ai',
        text: 'Failed to process the document. Please ensure it is a readable PDF.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }, [])

  return {
    messages,
    isTyping,
    sendMessage,
    handleQuickReply,
    handleFileUpload,
  }
}
