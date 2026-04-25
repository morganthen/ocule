import { Slider } from '@/components/ui/slider'

interface ScrubBarProps {
  index: number
  total: number
  onSeek: (i: number) => void
  playing: boolean
}

// Scrubbable position indicator that sits just beneath the paused hint.
// Fades out while playing; fully visible and draggable when paused.
export function ScrubBar({ index, total, onSeek, playing }: ScrubBarProps) {
  const max = Math.max(0, total - 1)
  return (
    <div
      className={'scrub-bar ' + (playing ? 'playing' : 'paused')}
      aria-hidden={playing}
    >
      <Slider
        min={0}
        max={max}
        step={1}
        value={[Math.min(index, max)]}
        onValueChange={(v) => onSeek(v[0])}
        aria-label="Reader position"
      />
    </div>
  )
}
