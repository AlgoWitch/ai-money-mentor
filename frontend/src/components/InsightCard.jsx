import React from 'react'

// Maps insight card types to their premium label + icon char
const META = {
  problem:    { label: 'Key Insight',      icon: '◆' },
  plan:       { label: 'Recommended Plan', icon: '◈' },
  action:     { label: 'Next Action',      icon: '→' },
  projection: { label: 'Projection',       icon: '∿' },
}

export default function InsightBlock({ card }) {
  const meta = META[card.type] || META.plan

  return (
    <div className="insight-block">
      {/* Label row */}
      <p className="insight-label">
        <span className="text-gold opacity-70">{meta.icon}</span>
        {meta.label}
      </p>
      {/* Content */}
      <p className="insight-value">{card.content}</p>
    </div>
  )
}
