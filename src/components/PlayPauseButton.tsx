interface PlayPauseButtonProps {
  playing: boolean
  onToggle: () => void
  onRewind: () => void
  onForward: () => void
  visible: boolean
}

export function PlayPauseButton({
  playing,
  onToggle,
  onRewind,
  onForward,
  visible,
}: PlayPauseButtonProps) {
  return (
    <div
      className={'transport ' + (visible ? 'visible' : 'hidden')}
      role="group"
      aria-label="Reader transport"
    >
      <button
        className="transport-btn transport-side"
        onClick={onRewind}
        aria-label="Rewind ten words"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8.5 3.5L3 8L8.5 12.5V3.5Z" fill="currentColor" />
          <path d="M14 3.5L8.5 8L14 12.5V3.5Z" fill="currentColor" />
        </svg>
      </button>
      <button
        className="transport-btn transport-main"
        onClick={onToggle}
        aria-label={playing ? 'Pause' : 'Play'}
        type="button"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="4.5" y="3.5" width="2.2" height="9" rx="0.4" fill="currentColor" />
            <rect x="9.3" y="3.5" width="2.2" height="9" rx="0.4" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 3.5L12 8L5 12.5V3.5Z" fill="currentColor" />
          </svg>
        )}
      </button>
      <button
        className="transport-btn transport-side"
        onClick={onForward}
        aria-label="Forward ten words"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 3.5L7.5 8L2 12.5V3.5Z" fill="currentColor" />
          <path d="M7.5 3.5L13 8L7.5 12.5V3.5Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
