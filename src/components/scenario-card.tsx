'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ScenarioCardProps {
  situation: string
  options: { text: string; correct: boolean; explanation: string }[]
}

export default function ScenarioCard({ situation, options }: ScenarioCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
  }

  const correctIndex = options.findIndex((o) => o.correct)
  const hasAnswered = selectedIndex !== null
  const selectedCorrectly = hasAnswered && options[selectedIndex].correct

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-lg font-medium text-midnight leading-relaxed">
          {situation}
        </p>
      </div>

      {/* Options */}
      <div className="px-6 pb-6 space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index
          const isCorrectOption = option.correct

          let borderColor = 'border-surface-200'
          let bgColor = 'bg-white'
          let textColor = 'text-surface-700'
          let cursor = 'cursor-pointer hover:border-aurora-violet hover:shadow-sm'
          let icon = null

          if (hasAnswered) {
            cursor = 'cursor-default'

            if (isSelected && isCorrectOption) {
              borderColor = 'border-aurora-green'
              bgColor = 'bg-aurora-green/10'
              textColor = 'text-midnight'
              icon = <CheckCircle2 className="w-5 h-5 text-accent-700 flex-shrink-0" />
            } else if (isSelected && !isCorrectOption) {
              borderColor = 'border-ember'
              bgColor = 'bg-ember/10'
              textColor = 'text-midnight'
              icon = <XCircle className="w-5 h-5 text-ember flex-shrink-0" />
            } else if (isCorrectOption) {
              borderColor = 'border-aurora-green'
              bgColor = 'bg-aurora-green/10'
              textColor = 'text-midnight'
              icon = <CheckCircle2 className="w-5 h-5 text-accent-700 flex-shrink-0" />
            } else {
              bgColor = 'bg-surface-50'
              textColor = 'text-surface-500'
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={hasAnswered}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200
                ${borderColor} ${bgColor} ${textColor} ${cursor}
                flex items-center gap-3
              `}
            >
              {!hasAnswered && (
                <span className="w-5 h-5 rounded-full border-2 border-surface-300 flex-shrink-0" />
              )}
              {icon}
              <span className="text-sm leading-relaxed">{option.text}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation reveal */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-out
          ${hasAnswered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className={`
          mx-6 mb-6 p-4 rounded-xl border-l-[3px]
          ${selectedCorrectly
            ? 'bg-aurora-green/10 border-aurora-green'
            : 'bg-ember/10 border-ember'
          }
        `}>
          <p className={`
            text-[11px] font-bold tracking-[0.15em] uppercase mb-1.5
            ${selectedCorrectly ? 'text-accent-700' : 'text-ember'}
          `}>
            {selectedCorrectly ? 'Correct' : 'Not quite — here\'s the right approach'}
          </p>
          <p className="text-sm leading-relaxed text-midnight">
            {hasAnswered ? options[correctIndex].explanation : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
