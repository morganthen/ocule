import { splitORP } from '@/lib/orp'

interface OculeLogoProps {
  visible: boolean
  onAboutClick?: () => void
}

const WORD = 'Oculé'

export function OculeLogo({ visible, onAboutClick }: OculeLogoProps) {
  const parts = splitORP(WORD)
  return (
    <div className={'logo ' + (visible ? 'visible' : 'hidden')} aria-label={WORD}>
      <span className="logo-word">
        <span className="logo-before">{parts.before}</span>
        <span className="logo-orp">{parts.orp}</span>
        <span className="logo-after">{parts.after}</span>
      </span>
      {onAboutClick && (
        <button
          className="logo-about"
          onClick={onAboutClick}
          aria-label="About Oculé"
          title="About"
          type="button"
        >
          ?
        </button>
      )}
    </div>
  )
}
