import { useEffect, useMemo, useRef } from 'react'
import type { Token } from '@/lib/tokenize'

interface ContextViewProps {
  tokens: Token[]
  index: number
  onSeek?: (i: number) => void
}

export function ContextView({ tokens, index, onSeek }: ContextViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLSpanElement>(null)
  const firstRunRef = useRef(true)

  const paragraphs = useMemo(() => {
    const result: { items: Token[]; startIdx: number }[] = []
    let current: Token[] = []
    let startIdx = 0
    tokens.forEach((t, i) => {
      if (current.length === 0) startIdx = i
      current.push(t)
      if (t.paraBreak) {
        result.push({ items: current, startIdx })
        current = []
      }
    })
    if (current.length) result.push({ items: current, startIdx })
    return result
  }, [tokens])

  useEffect(() => {
    const c = containerRef.current
    const el = activeRef.current
    if (!c || !el) return

    const cRect = c.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const margin = cRect.height * 0.3

    const outOfZone =
      eRect.top < cRect.top + margin || eRect.bottom > cRect.bottom - margin

    if (firstRunRef.current || outOfZone) {
      const target = el.offsetTop - c.clientHeight / 2 + el.offsetHeight / 2
      c.scrollTo({
        top: target,
        behavior: firstRunRef.current ? 'auto' : 'smooth',
      })
      firstRunRef.current = false
    }
  }, [index, paragraphs])

  return (
    <div className="context-view" ref={containerRef}>
      <div className="context-inner">
        {paragraphs.map(({ items, startIdx }, pi) => (
          <p key={pi} className="context-para">
            {items.map((t, ti) => {
              const i = startIdx + ti
              const isActive = i === index
              return (
                <span
                  key={ti}
                  ref={isActive ? activeRef : null}
                  className={'context-token' + (isActive ? ' active' : '')}
                  onClick={
                    onSeek
                      ? (e) => {
                          e.stopPropagation()
                          onSeek(i)
                        }
                      : undefined
                  }
                >
                  {t.word}
                  {ti < items.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </p>
        ))}
      </div>
    </div>
  )
}
