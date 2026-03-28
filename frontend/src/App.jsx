import React from 'react'
import Header from './components/Header'
import ProgressTracker from './components/ProgressTracker'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import { useChat } from './hooks/useChat'

export default function App() {
  const {
    messages,
    isTyping,
    stageIndex,
    sendMessage,
    handleQuickReply,
    handleFileUpload,
  } = useChat()

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-gold-subtle selection:text-navy">
      <Header />
      <ProgressTracker stageIndex={stageIndex} />

      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        onQuickReply={handleQuickReply}
      />

      <MessageInput
        onSend={sendMessage}
        onUpload={handleFileUpload}
        disabled={isTyping}
      />
    </div>
  )
}
