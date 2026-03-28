import React from 'react'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        {/* Minimal icon mark */}
        <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center flex-shrink-0">
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <polyline
              points="1.5,11 5,7 8,9.5 12.5,3"
              stroke="#C6A969" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <span className="text-sm font-semibold text-navy tracking-tight">
            AI Money Mentor
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        <span className="text-2xs font-medium text-slate-400 tracking-finance uppercase hidden sm:inline">
          Active
        </span>
      </div>
    </header>
  )
}
