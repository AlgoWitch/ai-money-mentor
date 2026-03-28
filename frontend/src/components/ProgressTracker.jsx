import React from 'react'
import { STAGES } from '../data/mockData'

export default function ProgressTracker({ stageIndex }) {
  return (
    <div
      className="bg-white border-b border-slate-100 px-6 py-2.5"
      role="progressbar"
      aria-label="Financial journey progress"
      aria-valuenow={stageIndex}
      aria-valuemax={STAGES.length - 1}
    >
      <div className="max-w-chat mx-auto flex items-center gap-4">
        {/* Label */}
        <span className="text-2xs tracking-finance uppercase text-slate-300 font-medium whitespace-nowrap hidden sm:block">
          Journey
        </span>

        {/* Stages */}
        <div className="flex items-center gap-0 flex-1 min-w-0">
          {STAGES.map((stage, idx) => {
            const isActive   = idx === stageIndex
            const isComplete = idx < stageIndex

            return (
              <React.Fragment key={stage.id}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`stage-pill transition-all duration-700
                      ${isActive   ? 'stage-pill-active' :
                        isComplete ? 'stage-pill-done'   : 'stage-pill-idle'}`}
                  >
                    {stage.label}
                  </span>
                  {/* Active underline */}
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-gold inline-block animate-fade-in" />
                  )}
                </div>

                {/* Separator arrow */}
                {idx < STAGES.length - 1 && (
                  <span className={`mx-2 text-2xs transition-colors duration-700
                    ${isComplete ? 'text-gold-muted' : 'text-slate-200'}`}>
                    →
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
