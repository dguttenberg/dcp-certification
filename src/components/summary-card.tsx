'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

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
    <div className="relative rounded-2xl overflow-hidden bg-midnight border border-aurora-violet/30 shadow-xl">
      {/* Atmospheric accents */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-aurora-violet/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-aurora-green/10 blur-3xl pointer-events-none" />

      <div className="relative p-8 sm:p-10">
        <span className="dcp-eyebrow dcp-eyebrow--green">Key Takeaways</span>
        <h3 className="mt-2 text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
          {heading}
        </h3>
        <div className="mt-3 w-10 h-[3px] bg-aurora-green rounded-full" />

        <ul className="mt-6 space-y-4">
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
              <span className="mt-0.5 w-5 h-5 rounded-full bg-aurora-green/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-aurora-green" strokeWidth={3} />
              </span>
              <span className="text-sm sm:text-base text-white/85 leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
