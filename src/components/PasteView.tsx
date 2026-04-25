import { useEffect, useRef, useState } from 'react'

interface Resumable {
  nextWord: string
  pct: number
}

interface PasteViewProps {
  onStart: (text: string) => void
  resumable: Resumable | null
  onResume: () => void
  onClearResume: () => void
  initialText?: string
}

export function PasteView({
  onStart,
  resumable,
  onResume,
  onClearResume,
  initialText,
}: PasteViewProps) {
  const [text, setText] = useState(initialText || '')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialText && !text) setText(initialText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText])

  useEffect(() => {
    taRef.current && taRef.current.focus()
  }, [])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (text.trim()) onStart(text)
    }
  }

  useEffect(() => {
    const onK = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && document.activeElement !== taRef.current) {
        if (text.trim()) {
          e.preventDefault()
          onStart(text)
        }
      }
    }
    window.addEventListener('keydown', onK)
    return () => window.removeEventListener('keydown', onK)
  }, [text, onStart])

  const canStart = text.trim().length > 0

  return (
    <div className="paste-view">
      <div className="paste-col">
        <div className="paste-prompt">Paste what you'd like to read</div>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          className="paste-textarea"
          spellCheck={false}
          placeholder=""
          rows={10}
        />
        <div className="paste-actions">
          <div className="paste-hint">
            {canStart ? (
              <span>
                <kbd>↵</kbd> or <kbd>⌘↵</kbd> to begin
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
          <button
            className="paste-start"
            disabled={!canStart}
            onClick={() => canStart && onStart(text)}
            type="button"
          >
            Start
          </button>
        </div>

        {resumable && (
          <div className="paste-resume">
            <span className="resume-label">Resume where you left off —</span>{' '}
            <span className="resume-preview">"{resumable.nextWord}"</span>
            <span className="resume-pct"> · {resumable.pct}% read</span>
            <div className="resume-actions">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onResume()
                }}
              >
                resume
              </a>
              <span className="resume-sep">·</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onClearResume()
                }}
              >
                start new
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
