'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'

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
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-3">
          <HelpCircle className="w-4 h-4" />
          <span>What would you do?</span>
        </div>
        <p className="text-lg font-medium text-surface-900 leading-relaxed">
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
          let cursor = 'cursor-pointer hover:border-brand-300 hover:shadow-sm'
          let icon = null

          if (hasAnswered) {
            cursor = 'cursor-default'

            if (isSelected && isCorrectOption) {
              borderColor = 'border-green-400'
              bgColor = 'bg-green-50'
              textColor = 'text-green-900'
              icon = <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            } else if (isSelected && !isCorrectOption) {
              borderColor = 'border-red-400'
              bgColor = 'bg-red-50'
              textColor = 'text-red-900'
              icon = <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            } else if (isCorrectOption) {
              borderColor = 'border-green-400'
              bgColor = 'bg-green-50'
              textColor = 'text-green-900'
              icon = <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            } else {
              bgColor = 'bg-surface-50'
              textColor = 'text-surface-400'
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={hasAnswered}
              className={`
                w-full text-left px-4 py-3 rounded-lg border transition-all duration-200
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
          mx-6 mb-6 p-4 rounded-lg
          ${selectedCorrectly
            ? 'bg-green-50 border border-green-200'
            : 'bg-amber-50 border border-amber-200'
          }
        `}>
          <p className={`
            text-sm font-semibold mb-1
            ${selectedCorrectly ? 'text-green-800' : 'text-amber-800'}
          `}>
            {selectedCorrectly ? 'Correct!' : 'Not quite — here\'s the right approach:'}
          </p>
          <p className={`
            text-sm leading-relaxed
            ${selectedCorrectly ? 'text-green-700' : 'text-amber-700'}
          `}>
            {hasAnswered ? options[correctIndex].explanation : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
