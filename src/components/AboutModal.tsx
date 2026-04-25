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
              Chrome Extension
            </a>
            <a
              className="about-link"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Oculé on GitHub
            </a>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}
