import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const lastInitialRef = useRef(initialText || '')

  // Adopt new initialText whenever the parent passes a different value (e.g.
  // a postMessage handoff arriving after mount). Don't overwrite mid-edit:
  // only replace if the local text matches the previous initial — meaning
  // the user hasn't typed anything new yet.
  useEffect(() => {
    const incoming = initialText || ''
    if (incoming === lastInitialRef.current) return
    if (text === lastInitialRef.current || !text) {
      setText(incoming)
    }
    lastInitialRef.current = incoming
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
  const [confirmOpen, setConfirmOpen] = useState(false)

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
          placeholder="a news article, a long essay, a chapter from a book…"
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
              <button
                type="button"
                className="resume-btn"
                onClick={onResume}
              >
                resume
              </button>
              <button
                type="button"
                className="resume-btn resume-btn-discard"
                onClick={() => setConfirmOpen(true)}
              >
                start new
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="confirm-modal">
          <DialogTitle>Discard saved reading?</DialogTitle>
          <DialogDescription>
            Confirm clearing your saved reading position before starting new.
          </DialogDescription>
          <div className="confirm-body">
            <h3>discard saved reading?</h3>
            <p>
              {resumable
                ? `you've read ${resumable.pct}% of the previous text. starting new will clear it from this browser.`
                : `this will clear your saved reading from this browser.`}
            </p>
          </div>
          <div className="confirm-actions">
            <button
              type="button"
              className="confirm-btn confirm-cancel"
              onClick={() => setConfirmOpen(false)}
            >
              cancel
            </button>
            <button
              type="button"
              className="confirm-btn confirm-discard"
              onClick={() => {
                setConfirmOpen(false)
                onClearResume()
              }}
            >
              discard
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
