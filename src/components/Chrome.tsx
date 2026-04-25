import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChromeSlider } from './ChromeSlider'
import { SettingsPopover } from './SettingsPopover'
import type { Settings } from '@/types'

interface ChromeProps {
  visible: boolean
  wpm: number
  setWpm: (v: number) => void
  settings: Settings
  setSettings: (s: Settings) => void
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2.5" y1="5" x2="13.5" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2.5" y1="11" x2="13.5" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function Chrome({ visible, wpm, setWpm, settings, setSettings }: ChromeProps) {
  const [popOpen, setPopOpen] = useState(false)
  const [wpmHover, setWpmHover] = useState(false)

  useEffect(() => {
    if (!visible) {
      setPopOpen(false)
      setWpmHover(false)
    }
  }, [visible])

  const punct = settings.punctMult ?? 1
  const wordMult = settings.wordMult ?? 1
  const periMult = settings.periMult ?? 1

  return (
    <div className={'chrome ' + (visible ? 'visible' : 'hidden')}>
      <div
        className={'chrome-tl ' + (wpmHover ? 'expanded' : '')}
        onMouseEnter={() => setWpmHover(true)}
        onMouseLeave={() => setWpmHover(false)}
      >
        <div className="wpm-display">
          <span className="wpm">{wpm}</span>
          <span className="wpm-unit">wpm</span>
        </div>

        <div className="wpm-panel" aria-hidden={!wpmHover}>
          <ChromeSlider
            label="speed"
            unit="wpm"
            min={50}
            max={1000}
            step={5}
            value={wpm}
            onChange={(v) => setWpm(v)}
            tabbable={wpmHover}
            display={String(wpm)}
          />
          <ChromeSlider
            label="punctuation pause"
            min={0}
            max={2}
            step={0.05}
            value={punct}
            onChange={(v) => setSettings({ ...settings, punctMult: v })}
            tabbable={wpmHover}
            display={punct.toFixed(2) + '×'}
            invert
          />
          <ChromeSlider
            label="word size"
            min={0.5}
            max={2}
            step={0.05}
            value={wordMult}
            onChange={(v) => setSettings({ ...settings, wordMult: v })}
            tabbable={wpmHover}
            display={wordMult.toFixed(2) + '×'}
          />
          <ChromeSlider
            label="peripheral size"
            min={0.5}
            max={2.5}
            step={0.05}
            value={periMult}
            onChange={(v) => setSettings({ ...settings, periMult: v })}
            tabbable={wpmHover}
            display={periMult.toFixed(2) + '×'}
          />
        </div>
      </div>

      <div className="chrome-tr">
        <Popover open={popOpen} onOpenChange={setPopOpen}>
          <PopoverTrigger asChild>
            <button className="gear" aria-label="Settings" type="button">
              <HamburgerIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8}>
            <SettingsPopover settings={settings} setSettings={setSettings} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
