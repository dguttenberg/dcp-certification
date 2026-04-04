'use client'

import { useState } from 'react'

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
  let colors = 'bg-surface-100 text-surface-600'

  if (access === 'Everyone') {
    colors = 'bg-green-100 text-green-700'
  } else if (access === 'Managed access') {
    colors = 'bg-blue-100 text-blue-700'
  } else if (access === 'Network-level') {
    colors = 'bg-purple-100 text-purple-700'
  }

  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors}`}>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tools.map((tool, index) => {
        const isExpanded = expandedIndex === index

        return (
          <button
            key={index}
            onClick={() => toggleExpand(index)}
            className={`
              text-left rounded-xl border transition-all duration-200
              ${isExpanded
                ? 'border-brand-300 bg-brand-50/40 shadow-md'
                : 'border-surface-200 bg-white hover:shadow-sm hover:border-surface-300'
              }
            `}
          >
            <div className="p-5">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" role="img">
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-surface-900 text-sm">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                      {tool.summary}
                    </p>
                  </div>
                </div>
                <AccessBadge access={tool.access} />
              </div>

              {/* Expandable detail */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-out
                  ${isExpanded ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}
                `}
              >
                <div className="pt-3 border-t border-surface-200">
                  <p className="text-sm text-surface-700 leading-relaxed">
                    {tool.detail}
                  </p>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
