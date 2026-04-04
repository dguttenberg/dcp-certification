'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface SummaryCardProps {
  heading: string
  points: string[]
}

export default function SummaryCard({ heading, points }: SummaryCardProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= points.length) return

    const timeout = setTimeout(() => {
      setVisibleCount((prev) => prev + 1)
    }, 150)

    return () => clearTimeout(timeout)
  }, [visibleCount, points.length])

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200 overflow-hidden">
      {/* Left accent bar + content */}
      <div className="border-l-4 border-brand-500 pl-6 pr-6 py-6">
        {/* Heading */}
        <h3 className="text-lg font-bold text-brand-900 mb-4">
          {heading}
        </h3>

        {/* Points */}
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li
              key={index}
              className={`
                flex items-start gap-3 transition-all duration-400 ease-out
                ${index < visibleCount
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
                }
              `}
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-surface-800 leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
