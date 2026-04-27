import { Switch } from '@/components/ui/switch'
import { ChromeSlider } from '@/components/ChromeSlider'
import type { AudioTrack, Settings } from '@/types'

interface SettingsPopoverProps {
  settings: Settings
  setSettings: (s: Settings) => void
}

export function SettingsPopover({ settings, setSettings }: SettingsPopoverProps) {
  const {
    peripheral,
    theme,
    fontSize,
    font,
    animate,
    easePunct = true,
    audioEnabled,
    audioTrack,
    audioVolume,
  } = settings

  const fontOpts: Array<{ key: Settings['font']; label: string; sample: string; badge?: string }> = [
    { key: 'mono', label: 'Monospace', sample: 'Aa' },
    { key: 'serif', label: 'Serif', sample: 'Aa' },
    { key: 'sans', label: 'Sans', sample: 'Aa' },
    { key: 'humanist', label: 'Humanist', sample: 'Aa' },
    { key: 'dyslexic', label: 'OpenDyslexic', sample: 'Aa', badge: 'dyslexia' },
  ]

  const audioOpts: Array<{ key: AudioTrack; label: string }> = [
    { key: 'noise', label: 'Noise' },
    { key: 'rain', label: 'Rain' },
    { key: 'binaural', label: 'Binaural' },
    { key: 'forest', label: 'Forest' },
  ]
  return (
    <div className="settings-pop" onClick={(e) => e.stopPropagation()}>
      <div className="settings-row">
        <label>Audio</label>
        <Switch
          checked={audioEnabled}
          onCheckedChange={(v) => setSettings({ ...settings, audioEnabled: v })}
          aria-label="Audio"
        />
      </div>
      <div className={'settings-row settings-col audio-block' + (audioEnabled ? '' : ' disabled')}>
        <div className="font-list">
          {audioOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              className={'font-opt' + (audioTrack === o.key ? ' on' : '')}
              onClick={() => setSettings({ ...settings, audioTrack: o.key })}
            >
              <span className="font-opt-label">{o.label}</span>
            </button>
          ))}
        </div>
        <ChromeSlider
          label="Volume"
          min={0}
          max={1}
          step={0.01}
          value={audioVolume}
          onChange={(v) => setSettings({ ...settings, audioVolume: v })}
          tabbable={audioEnabled}
          display={Math.round(audioVolume * 100) + '%'}
        />
      </div>
      {settings.mode === 'rsvp' && (
        <>
          <div className="settings-row">
            <label>Peripheral context</label>
            <Switch
              checked={peripheral}
              onCheckedChange={(v) => setSettings({ ...settings, peripheral: v })}
              aria-label="Peripheral context"
            />
          </div>
          <div className="settings-row">
            <label>Word animation</label>
            <Switch
              checked={!!animate}
              onCheckedChange={(v) => setSettings({ ...settings, animate: v })}
              aria-label="Word animation"
            />
          </div>
        </>
      )}
      <div className="settings-row">
        <label>Ease punctuation pauses</label>
        <Switch
          checked={!!easePunct}
          onCheckedChange={(v) => setSettings({ ...settings, easePunct: v })}
          aria-label="Ease punctuation pauses"
        />
      </div>
      <div className="settings-row">
        <label>Theme</label>
        <div className="seg">
          <button
            type="button"
            className={theme === 'dark' ? 'on' : ''}
            onClick={() => setSettings({ ...settings, theme: 'dark' })}
          >
            dark
          </button>
          <button
            type="button"
            className={theme === 'light' ? 'on' : ''}
            onClick={() => setSettings({ ...settings, theme: 'light' })}
          >
            light
          </button>
        </div>
      </div>
      <div className="settings-row settings-col">
        <label>Font</label>
        <div className="font-list">
          {fontOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              className={'font-opt font-opt-' + o.key + (font === o.key ? ' on' : '')}
              onClick={() => setSettings({ ...settings, font: o.key })}
            >
              <span className="font-opt-sample">{o.sample}</span>
              <span className="font-opt-label">{o.label}</span>
              {o.badge && <span className="font-opt-badge">{o.badge}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-row">
        <label>Font size</label>
        <div className="seg">
          <button
            type="button"
            className={fontSize === 'small' ? 'on' : ''}
            onClick={() => setSettings({ ...settings, fontSize: 'small' })}
          >
            sm
          </button>
          <button
            type="button"
            className={fontSize === 'medium' ? 'on' : ''}
            onClick={() => setSettings({ ...settings, fontSize: 'medium' })}
          >
            md
          </button>
          <button
            type="button"
            className={fontSize === 'large' ? 'on' : ''}
            onClick={() => setSettings({ ...settings, fontSize: 'large' })}
          >
            lg
          </button>
        </div>
      </div>
    </div>
  )
}
