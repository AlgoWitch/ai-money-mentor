import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ messages, isTyping, onQuickReply }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      className="flex-1 overflow-y-auto chat-scroll px-4 sm:px-6 py-8 flex flex-col gap-6"
      role="log"
      aria-live="polite"
    >
      <div className="max-w-chat mx-auto w-full flex flex-col gap-8">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            onQuickReply={onQuickReply}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  )
}
