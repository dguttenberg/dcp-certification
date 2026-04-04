'use client'

import { useState } from 'react'

interface PromptSide {
  prompt: string
  output: string
  label: string
}

interface PromptCompareProps {
  bad: PromptSide
  good: PromptSide
}

function ChatBubbles({ side, tint }: { side: PromptSide; tint: 'bad' | 'good' }) {
  const userBubbleBg = tint === 'good' ? 'bg-brand-600 text-white' : 'bg-surface-600 text-white'
  const aiBubbleBg = tint === 'good' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
  const labelColor = tint === 'good' ? 'text-green-700' : 'text-red-600'
  const labelBg = tint === 'good' ? 'bg-green-100' : 'bg-red-100'

  return (
    <div className="flex flex-col h-full">
      {/* Label */}
      <div className="mb-3">
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${labelBg} ${labelColor}`}>
          {side.label}
        </span>
      </div>

      {/* Chat area */}
      <div className={`
        flex-1 rounded-xl border p-4 space-y-3
        ${tint === 'good'
          ? 'bg-green-50/30 border-green-200'
          : 'bg-red-50/30 border-red-200'
        }
      `}>
        {/* User message — right-aligned */}
        <div className="flex justify-end">
          <div className={`${userBubbleBg} rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{side.prompt}</p>
          </div>
        </div>

        {/* AI response — left-aligned */}
        <div className="flex justify-start">
          <div className={`${aiBubbleBg} rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%] border ${tint === 'good' ? 'border-green-200' : 'border-red-200'}`}>
            <p className="text-xs font-medium opacity-60 mb-1">Claude</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{side.output}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PromptCompare({ bad, good }: PromptCompareProps) {
  const [showGood, setShowGood] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bad side — always visible */}
        <ChatBubbles side={bad} tint="bad" />

        {/* Good side — revealed on click (mobile) or always visible (desktop) */}
        <div className="hidden md:block">
          <ChatBubbles side={good} tint="good" />
        </div>

        {/* Mobile: reveal toggle */}
        <div className="md:hidden">
          {!showGood ? (
            <button
              onClick={() => setShowGood(true)}
              className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-brand-300 text-brand-600 font-medium text-sm hover:bg-brand-50 transition-colors"
            >
              See a better approach &rarr;
            </button>
          ) : (
            <div className="animate-fade-in">
              <ChatBubbles side={good} tint="good" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
