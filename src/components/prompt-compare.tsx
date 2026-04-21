'use client'

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
  const userBubbleBg = tint === 'good'
    ? 'bg-aurora-green text-midnight'
    : 'bg-surface-500 text-white'
  const aiBubbleBg = tint === 'good'
    ? 'bg-white text-midnight border-aurora-green/30'
    : 'bg-white text-midnight border-ember/30'
  const labelColor = tint === 'good' ? 'text-accent-800' : 'text-ember'
  const labelBg = tint === 'good' ? 'bg-aurora-green/20' : 'bg-ember/15'
  const areaBg = tint === 'good'
    ? 'bg-aurora-green/5 border-aurora-green/20'
    : 'bg-ember/5 border-ember/20'

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <span className={`inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${labelBg} ${labelColor}`}>
          {side.label}
        </span>
      </div>

      <div className={`flex-1 rounded-xl border p-4 space-y-3 ${areaBg}`}>
        {/* User message */}
        <div className="flex justify-end">
          <div className={`${userBubbleBg} rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{side.prompt}</p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div className={`${aiBubbleBg} rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%] border`}>
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-surface-400 mb-1">Claude</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{side.output}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PromptCompare({ bad, good }: PromptCompareProps) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChatBubbles side={bad} tint="bad" />
        <ChatBubbles side={good} tint="good" />
      </div>
    </div>
  )
}
