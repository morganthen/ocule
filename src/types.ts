export type AudioTrack = 'noise' | 'rain' | 'binaural' | 'forest'

export type ReadMode = 'rsvp' | 'guided'

export interface Settings {
  theme: 'dark' | 'light'
  peripheral: boolean
  fontSize: 'small' | 'medium' | 'large'
  font: 'mono' | 'serif' | 'sans' | 'humanist' | 'dyslexic'
  animate: boolean
  easePunct: boolean
  wpm: number
  punctMult: number
  wordMult: number
  periMult: number
  audioEnabled: boolean
  audioTrack: AudioTrack
  audioVolume: number
  mode: ReadMode
}

export interface Session {
  text: string
  index: number
  wpm: number
  updatedAt: number
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  peripheral: true,
  fontSize: 'medium',
  font: 'mono',
  animate: true,
  easePunct: true,
  wpm: 300,
  punctMult: 1.1,
  wordMult: 0.8,
  periMult: 1.25,
  audioEnabled: false,
  audioTrack: 'rain',
  audioVolume: 0.4,
  mode: 'rsvp',
}
