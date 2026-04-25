import { useMemo, useState } from 'react'
import type { Token } from '@/lib/tokenize'
import { dwellMs } from '@/lib/dwell'

interface ProgressBarProps {
  index: number
  total: number
  wpm: number
  tokens: Token[]
  flash?: boolean
  punctMult?: number
  easePunct?: boolean
}

export function ProgressBar({
  index,
  total,
  wpm,
  tokens,
  flash,
  punctMult,
  easePunct,
}: ProgressBarProps) {
  const [hover, setHover] = useState(false)
  const pct = total > 0 ? (index / Math.max(1, total - 1)) * 100 : 0

  const remainingMs = useMemo(() => {
    if (!tokens || index >= tokens.length) return 0
    let sum = 0
    for (let i = index; i < tokens.length; i++) {
      sum += dwellMs(tokens[i], wpm, punctMult, easePunct)
    }
    return sum
  }, [index, tokens, wpm, punctMult, easePunct])

  const remainingText = useMemo(() => {
    const s = Math.round(remainingMs / 1000)
    if (s < 60) return `${s}s remaining`
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}m ${r.toString().padStart(2, '0')}s remaining`
  }, [remainingMs])

  return (
    <div
      className={'progress ' + (hover ? 'hover ' : '') + (flash ? 'flash' : '')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && <div className="progress-time">{remainingText}</div>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
