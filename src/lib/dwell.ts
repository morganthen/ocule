import type { Token } from './tokenize'

// Returns ms to hold a given token at a given wpm.
// - punctMult scales the peak extra dwell (0 = no punctuation pauses, 1 = spec default).
// - easePunct (true) reads the smoothed pauseWeight; false reads the sharp punctStrength.
export function dwellMs(
  token: Token,
  wpm: number,
  punctMult = 1,
  easePunct = true,
): number {
  const base = 60000 / Math.max(60, wpm)
  const w = token.word
  let mult = 1
  if (w.length > 8) mult *= 1.4
  const weight = easePunct ? token.pauseWeight || 0 : token.punctStrength || 0
  const maxExtra = 1.2 * punctMult
  mult *= 1 + weight * maxExtra
  let ms = base * mult
  if (token.paraBreak) ms += 350 * punctMult
  return ms
}
