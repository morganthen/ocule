import { smoothstep } from './smoothstep'

export interface Token {
  word: string
  paraBreak: boolean
  punctStrength: number
  pauseWeight: number
}

// Split text into tokens. Empty lines produce a special paragraph-break marker.
// Each token carries `punctStrength` (0 / 0.6 soft / 1.0 hard / 1.2 paragraph)
// and `pauseWeight` — a smoothed curve peaking at punctuated tokens, eased over
// a window of neighbors. dwellMs reads pauseWeight, not the token's own last char.
export function tokenize(text: string): Token[] {
  if (!text) return []
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const tokens: Token[] = []
  let prevBlank = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (!prevBlank && tokens.length > 0) {
        tokens[tokens.length - 1].paraBreak = true
      }
      prevBlank = true
      continue
    }
    prevBlank = false
    const words = line.split(/\s+/)
    for (const w of words) {
      if (w) {
        tokens.push({
          word: w,
          paraBreak: false,
          punctStrength: 0,
          pauseWeight: 0,
        })
      }
    }
  }
  for (const t of tokens) {
    const last = t.word[t.word.length - 1]
    if (last === '.' || last === '!' || last === '?') t.punctStrength = 1.0
    else if (last === ',' || last === ';' || last === ':') t.punctStrength = 0.6
    else t.punctStrength = 0
    if (t.paraBreak) t.punctStrength = Math.max(t.punctStrength, 1.2)
  }
  // Only a lead-in ramp: reader eases down into a punctuation, then snaps
  // back to peak WPM on the very next token. No ramp-up window.
  const IN = 2
  const N = tokens.length
  for (let i = 0; i < N; i++) tokens[i].pauseWeight = 0
  for (let i = 0; i < N; i++) {
    const s = tokens[i].punctStrength
    if (s <= 0) continue
    if (s > tokens[i].pauseWeight) tokens[i].pauseWeight = s
    for (let k = 1; k <= IN; k++) {
      const j = i - k
      if (j < 0) break
      const t = 1 - (k - 0.5) / IN
      const w = s * smoothstep(Math.max(0, t))
      if (w > tokens[j].pauseWeight) tokens[j].pauseWeight = w
    }
  }
  return tokens
}
