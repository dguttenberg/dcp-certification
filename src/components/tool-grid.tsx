'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Tool {
  name: string
  icon: string
  summary: string
  detail: string
  access: string
}

interface ToolGridProps {
  tools: Tool[]
}

function AccessBadge({ access }: { access: string }) {
  let colors = 'bg-surface-100 text-surface-600 border-surface-200'

  if (access === 'Everyone') {
    colors = 'bg-aurora-green/15 text-accent-800 border-aurora-green/30'
  } else if (access === 'Managed access') {
    colors = 'bg-aurora-violet/15 text-aurora-violet border-aurora-violet/30'
  } else if (access === 'Network-level') {
    colors = 'bg-sky/20 text-midnight border-sky/40'
  }

  return (
    <span className={`inline-block text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${colors}`}>
      {access}
    </span>
  )
}

export default function ToolGrid({ tools }: ToolGridProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {tools.map((tool, index) => {
        const isExpanded = expandedIndex === index

        return (
          <button
            key={index}
            onClick={() => toggleExpand(index)}
            className={`
              text-left rounded-xl border transition-all duration-200
              ${isExpanded
                ? 'border-aurora-violet bg-aurora-violet/5 shadow-md'
                : 'border-surface-200 bg-white hover:shadow-sm hover:border-aurora-violet/40'
              }
            `}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none" role="img">
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-midnight text-sm tracking-tight">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-surface-600 mt-0.5 leading-relaxed">
                      {tool.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <AccessBadge access={tool.access} />
                  <ChevronDown
                    className={`w-4 h-4 text-surface-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              <div
                className={`
                  grid transition-all duration-300 ease-out
                  ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}
                `}
              >
                <div className="overflow-hidden">
                  <div className="pt-3 border-t border-aurora-violet/20 space-y-3">
                    {tool.detail.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm text-surface-700 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
