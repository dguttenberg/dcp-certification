'use client'

interface ProgressRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  label?: string
  variant?: 'light' | 'dark'
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  variant = 'dark',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference
  const percentage = Math.round(progress * 100)

  const trackColor = variant === 'dark' ? 'rgba(255,255,255,0.12)' : '#E6E7E8'
  const progressColor = '#20FE8F'
  const textColor = variant === 'dark' ? '#FFFFFF' : '#000531'
  const labelColor = variant === 'dark' ? 'rgba(255,255,255,0.55)' : '#6F7378'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: textColor }}>{percentage}%</span>
        {label && (
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-0.5" style={{ color: labelColor }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
