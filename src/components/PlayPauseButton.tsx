interface PlayPauseButtonProps {
  playing: boolean
  onToggle: () => void
  visible: boolean
}

export function PlayPauseButton({ playing, onToggle, visible }: PlayPauseButtonProps) {
  return (
    <button
      className={'playpause ' + (visible ? 'visible' : 'hidden')}
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
  )
}
