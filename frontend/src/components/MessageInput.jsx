import React, { useState, useRef } from 'react'
import { Paperclip, ArrowUp, Loader2 } from 'lucide-react'

export default function MessageInput({ onSend, onUpload, disabled }) {
  const [value, setValue]   = useState('')
  const fileRef             = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    const t = value.trim()
    if (!t || disabled) return
    onSend(t)
    setValue('')
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e) }
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (f) { onUpload(f); e.target.value = '' }
  }

  return (
    <div className="bg-white border-t border-slate-100 px-4 sm:px-6 py-4">
      <div className="max-w-chat mx-auto">
        <form onSubmit={submit} className="chat-input-wrap">
          {/* Input */}
          <input
            id="chat-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder="Tell me about your financial goal..."
            disabled={disabled}
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-navy-light placeholder-slate-300
                       outline-none disabled:opacity-50 min-w-0"
          />

          {/* Attach */}
          <button
            type="button"
            title="Attach Financial Document"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 text-slate-300 hover:text-gold transition-colors duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed p-1"
            aria-label="Attach financial document"
          >
            <Paperclip size={15} strokeWidth={1.8} />
          </button>

          {/* Send */}
          <button
            type="submit"
            id="send-btn"
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-navy flex items-center justify-center
                       text-white hover:bg-navy-light transition-all duration-150
                       disabled:opacity-35 disabled:cursor-not-allowed active:scale-95"
          >
            {disabled
              ? <Loader2 size={14} className="animate-spin text-gold" />
              : <ArrowUp size={14} strokeWidth={2.2} />
            }
          </button>
        </form>

        {/* Subtle upload hint */}
        <div className="flex items-center justify-center mt-2.5 gap-1.5">
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-2xs text-slate-300 hover:text-gold tracking-finance uppercase transition-colors duration-150"
          >
            Attach Financial Document
          </button>
          <span className="text-2xs text-slate-200">·</span>
          <span className="text-2xs text-slate-300 tracking-finance uppercase">Form 16 / Statement</span>
        </div>
      </div>
    </div>
  )
}
