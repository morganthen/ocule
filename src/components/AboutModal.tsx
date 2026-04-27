import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>About Oculé</DialogTitle>
        <DialogDescription>How to use Oculé, about, and links.</DialogDescription>

        <button
          className="about-close"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>

        <div className="about-donate-wrap">
          <button className="about-donate" type="button" onClick={() => {}}>
            Buy me a coffee
          </button>
        </div>

        <section className="about-section">
          <h2>How to use Oculé</h2>
          <p>
            Bump up the font size, sit back, and relax your eyes. Do not try to read — just let
            the words pass through. Your brain will pull them in on its own.
          </p>
          <p>
            When you are getting used to this sort of reading, take one or two paragraphs, start
            around 300 wpm, and re-read until it clicks. After that, play with speed, punctuation
            pause, and the size knobs until it feels comfortable.
          </p>
          <p>
            Everyone has different preferences. Once you find your settings, they stick around in
            your browser.
          </p>
        </section>

        <section className="about-section">
          <h2>About Oculé</h2>
          <ul className="about-list">
            <li>
              <span className="about-term">Private</span> — nothing leaves your browser. Your
              pasted text, your session, your settings: all local.
            </li>
            <li>
              <span className="about-term">Editable</span> — the source is small and legible.
              Fork it, tune it, make it yours.
            </li>
            <li>
              <span className="about-term">Secure</span> — fully client-side. Safe to use on
              confidential reading without an IT review.
            </li>
            <li>
              <span className="about-term">Accessible</span> — the font picker includes a
              dyslexia-friendly option alongside serif, sans, and monospace families.
            </li>
            <li>
              <span className="about-term">Comfortable</span> — speed eases in and out of
              punctuation instead of slamming into it, so long sentences feel natural.
            </li>
            <li>
              <span className="about-term">Thoughtful</span> — WPM, pauses, sizes, theme —
              everything you adjust is remembered.
            </li>
            <li>
              <span className="about-term">Open Source</span> — the codebase is public.
            </li>
            <li>
              <span className="about-term">Donation Supported</span> — if this is useful to you,
              a small tip keeps it going.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Links</h2>
          <div className="about-links">
            <a
              className="about-link"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                className="about-link-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 3.5a2.5 2.5 0 0 1 5 0v2h3.5A1.5 1.5 0 0 1 19 7v3.5h2a2.5 2.5 0 0 1 0 5h-2V19a1.5 1.5 0 0 1-1.5 1.5H14v-2a2.5 2.5 0 0 0-5 0v2H5.5A1.5 1.5 0 0 1 4 19v-3.5H6.5a2.5 2.5 0 0 0 0-5H4V7a1.5 1.5 0 0 1 1.5-1.5H9v-2Z" />
              </svg>
              Chrome Extension
            </a>
            <a
              className="about-link"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                className="about-link-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
              Oculé on GitHub
            </a>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}
