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

    // Simulate network latency — replace with real fetch('/analyze')
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))

    const response = getMockResponse(text)

    const aiMsg = {
      id: nextId(),
      role: 'ai',
      text: response.text,
      cards: response.cards || [],
      quickReplies: [],
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages(prev => [...prev, aiMsg])
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
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: nextId(),
            role: 'ai',
            text: `Got it! I've received your document **${file.name}**. I'm analyzing it now...`,
            cards: [
              {
                type: 'plan',
                title: '📊 Document Analysis',
                content: 'Once analyzed, I\'ll identify your income, tax deductions, and suggest optimizations tailored to your financial profile.',
              },
            ],
            quickReplies: [],
            timestamp: new Date(),
          },
        ])
      }, 1800)
    }, 300)
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
