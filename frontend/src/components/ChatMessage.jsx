import React from 'react'
import InsightBlock from './InsightCard'

function parseText(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold text-navy-light">{p.slice(2, -2)}</strong>
      : p
  )
}

export default function ChatMessage({ message, onQuickReply }) {
  const isUser = message.role === 'user'
  const time   = message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  /* ── User message ── */
  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-3 animate-fade-up">
        <div className="flex flex-col items-end gap-1">
          <div className="bubble-user">
            <p className="whitespace-pre-line">{message.text}</p>
          </div>
          <span className="text-2xs text-slate-300 pr-1">{time}</span>
        </div>
      </div>
    )
  }

  /* ── AI message ── */
  return (
    <div className="flex items-start gap-4 animate-fade-up">
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

      <div className="flex flex-col gap-0 flex-1 min-w-0">
        {/* Intro text */}
        <p className="bubble-ai whitespace-pre-line mb-1">
          {parseText(message.text)}
        </p>

        {/* Insight blocks — premium report style */}
        {message.cards?.length > 0 && (
          <div className="border border-slate-100 rounded-xl bg-white shadow-premium px-5 py-3 mt-2 max-w-xl">
            {message.cards.map((card, idx) => (
              <InsightBlock key={idx} card={card} />
            ))}
          </div>
        )}

        {/* Quick replies */}
        {message.quickReplies?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.quickReplies.map(reply => (
              <button
                key={reply}
                id={`qr-${reply.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onQuickReply(reply)}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200
                           text-slate-600 bg-white hover:border-gold hover:text-gold-muted
                           transition-all duration-150 active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <span className="text-2xs text-slate-300 mt-2">{time}</span>
      </div>
    </div>
  )
}
