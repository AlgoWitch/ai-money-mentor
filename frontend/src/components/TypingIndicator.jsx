import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 animate-fade-in" aria-label="AI is composing a response">
      {/* Monogram */}
      <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <polyline
            points="1.5,11 5,7 8,9.5 12.5,3"
            stroke="#C6A969" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5 pt-2.5">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  )
}
