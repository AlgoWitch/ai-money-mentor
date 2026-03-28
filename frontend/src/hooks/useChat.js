import { useState, useCallback, useRef } from 'react'
import { getMockResponse, STAGES } from '../data/mockData'

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
  const [stageIndex, setStageIndex] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const messageIdCounter = useRef(1)
  const userMessageCount = useRef(0)
  const stageRef = useRef(0)

  const nextId = () => `msg-${messageIdCounter.current++}`

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    // Add user message
    const userMsg = {
      id: nextId(),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Advance stage every 3 user messages
    userMessageCount.current += 1
    if (userMessageCount.current % 3 === 0 && stageRef.current < STAGES.length - 1) {
      stageRef.current += 1
      setStageIndex(stageRef.current)
    }

    // Real API Call to Backend
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const response = await res.json()

      const aiMsg = {
        id: nextId(),
        role: 'ai',
        text: response.text || "I processed that.",
        cards: response.cards || [],
        quickReplies: [],
        timestamp: new Date(),
      }

      setIsTyping(false)
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'ai',
        text: "I'm having trouble connecting to my backend right now.",
        timestamp: new Date()
      }])
    }
  }, [])

  const handleQuickReply = useCallback((reply) => {
    sendMessage(reply)
  }, [sendMessage])

  const handleFileUpload = useCallback((file) => {
    setUploadedFile(file)
    const noticeMsg = {
      id: nextId(),
      role: 'user',
      text: `📎 Uploaded: ${file.name}`,
      isUpload: true,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, noticeMsg])

    // Trigger AI response about the uploaded doc
    setTimeout(async () => {
      setIsTyping(true)
      try {
        const docText = encodeURIComponent(`Dummy extracted text from ${file.name} showing income of ₹85,000/month.`)
        const res = await fetch(`http://localhost:8000/analyze-profile?doc_text=${docText}`, { method: 'POST' })
        const response = await res.json()
        
        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: nextId(),
            role: 'ai',
            text: `Got it! I've analyzed your document **${file.name}**.\n\n${response.analysis}`,
            cards: [
              {
                type: 'plan',
                title: '📊 Document Analysis',
                content: response.ai_verification || 'Tax profile verified.',
              },
            ],
            quickReplies: [],
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        setIsTyping(false)
        setMessages(prev => [...prev, {
          id: nextId(), role: 'ai', text: "Failed to upload document to backend.", timestamp: new Date()
        }])
      }
    }, 500)
  }, [])

  return {
    messages,
    isTyping,
    stageIndex,
    uploadedFile,
    sendMessage,
    handleQuickReply,
    handleFileUpload,
  }
}
