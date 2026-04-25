import { useCallback, useRef } from 'react'
import type { Token } from '@/lib/tokenize'
import { WordDisplay } from './WordDisplay'
import { PeripheralContext } from './PeripheralContext'
import { ProgressBar } from './ProgressBar'
import { ScrubBar } from './ScrubBar'

interface ReaderViewProps {
  tokens: Token[]
  index: number
  playing: boolean
  wpm: number
  peripheral: boolean
  fontSize: 'small' | 'medium' | 'large'
  animate: boolean
  wordMult: number
  periMult: number
  punctMult: number
  easePunct: boolean
  onToggle: () => void
  onNudge: (d: number) => void
  onSeek: (i: number) => void
  flashBar: boolean
  chromeVisible: boolean
}

export function ReaderView({
  tokens,
  index,
  playing,
  wpm,
  peripheral,
  fontSize,
  animate,
  wordMult,
  periMult,
  punctMult,
  easePunct,
  onToggle,
  onNudge,
  onSeek,
  flashBar,
  chromeVisible,
}: ReaderViewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const baseFontSizePx =
    fontSize === 'small'
      ? 'clamp(2.4rem, 6vw, 5rem)'
      : fontSize === 'large'
        ? 'clamp(3.6rem, 10vw, 9rem)'
        : 'clamp(3rem, 8vw, 7rem)'
  const fontSizePx = `calc(${baseFontSizePx} * ${wordMult || 1})`

  const tok = tokens[index]
  const prevTok = index > 0 ? tokens[index - 1] : null
  const nextTok = index < tokens.length - 1 ? tokens[index + 1] : null

  const handleMeasure = useCallback(
    ({ leftEdge, rightEdge }: { leftEdge: number; rightEdge: number }) => {
      if (!innerRef.current) return
      innerRef.current.style.setProperty('--word-left', leftEdge + 'px')
      innerRef.current.style.setProperty('--word-right', rightEdge + 'px')
    },
    [],
  )

  const touchRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchRef.current
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    const dt = Date.now() - s.time
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      onNudge(dx > 0 ? 1 : -1)
    } else if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      onToggle()
    }
    touchRef.current = null
  }

  return (
    <div
      ref={rootRef}
      className={'reader ' + (playing ? 'playing' : 'paused')}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (
          target === rootRef.current ||
          target.classList.contains('reader-inner') ||
          target.classList.contains('word-row') ||
          target.classList.contains('word') ||
          target.classList.contains('anchor-guide')
        ) {
          onToggle()
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="reader-inner" ref={innerRef}>
        <div className="anchor-guide" aria-hidden="true">
          <div className="anchor-tick anchor-top" />
          <div className="anchor-tick anchor-bottom" />
        </div>

        {peripheral && (
          <PeripheralContext
            prev={prevTok && prevTok.word}
            next={nextTok && nextTok.word}
            periMult={periMult}
          />
        )}

        {tok && (
          <WordDisplay
            word={tok.word}
            fontSize={fontSizePx}
            onMeasure={handleMeasure}
            animate={animate}
          />
        )}

        {!playing && (
          <div className={'paused-hint ' + (chromeVisible ? 'show' : '')}>
            paused · space to resume
          </div>
        )}

        <ScrubBar index={index} total={tokens.length} onSeek={onSeek} playing={playing} />
      </div>

      <div className={'esc-hint ' + (chromeVisible ? 'show' : '')}>
        <span>esc</span> to exit
      </div>

      <ProgressBar
        index={index}
        total={tokens.length}
        wpm={wpm}
        tokens={tokens}
        flash={flashBar}
        punctMult={punctMult}
        easePunct={easePunct}
      />
    </div>
  )
}
