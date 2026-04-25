import { Slider } from '@/components/ui/slider'

interface ChromeSliderProps {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  tabbable: boolean
  display: string
  unit?: string
  invert?: boolean
}

// Wraps shadcn Slider. When inverted, the slider visually runs right→left:
// a leftward thumb position corresponds to a HIGHER underlying value.
export function ChromeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  tabbable,
  display,
  unit,
  invert,
}: ChromeSliderProps) {
  const inner = invert ? min + max - value : value
  const handle = (raw: number) => {
    const v = invert ? min + max - raw : raw
    onChange(v)
  }
  return (
    <div className="cs-row">
      <div className="cs-head">
        <span className="cs-label">{label}</span>
        <span className="cs-value">
          {display}
          {unit ? ' ' + unit : ''}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[inner]}
        onValueChange={(vals) => handle(vals[0])}
        tabIndex={tabbable ? 0 : -1}
      />
    </div>
  )
}
