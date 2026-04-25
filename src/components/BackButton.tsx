interface BackButtonProps {
  onBack: () => void
  visible: boolean
}

export function BackButton({ onBack, visible }: BackButtonProps) {
  return (
    <button
      className={'back-btn ' + (visible ? 'visible' : 'hidden')}
      onClick={onBack}
      aria-label="Back to text"
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
