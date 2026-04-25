import { useLayoutEffect, useMemo, useRef } from 'react'
import { splitORP } from '@/lib/orp'

interface WordDisplayProps {
  word: string
  fontSize: string
  onMeasure?: (edges: { leftEdge: number; rightEdge: number }) => void
  animate?: boolean
}

export function WordDisplay({ word, fontSize, onMeasure, animate }: WordDisplayProps) {
  const parts = useMemo(() => splitORP(word), [word])
  const wordRef = useRef<HTMLDivElement>(null)
  const orpRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const wordEl = wordRef.current
    const orpEl = orpRef.current
    if (!wordEl || !orpEl) return

    // ORP center within the word's box. Translation is constant across both
    // rects, so this offset is invariant to whatever transform is currently
    // applied — no need to reset before measuring.
    const wordRect = wordEl.getBoundingClientRect()
    const orpRect = orpEl.getBoundingClientRect()
    const orpCx = (orpRect.left + orpRect.right) / 2 - wordRect.left

    wordEl.style.setProperty('--orp-cx', orpCx + 'px')

    if (onMeasure) {
      // Reading the rect again forces a synchronous layout, so we get the
      // post-translate edges to feed peripheral positioning.
      const newRect = wordEl.getBoundingClientRect()
      onMeasure({ leftEdge: newRect.left, rightEdge: newRect.right })
    }
  }, [word, fontSize, onMeasure])

  return (
    <div className="word-row" style={{ fontSize }}>
      <div
        className={'word ' + (animate ? 'word-animate' : '')}
        ref={wordRef}
        key={animate ? word + '-a' : undefined}
      >
        <span className="word-before">{parts.before}</span>
        <span className="word-orp" ref={orpRef}>{parts.orp}</span>
        <span className="word-after">{parts.after}</span>
      </div>
    </div>
  )
}
