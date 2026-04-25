export function orpIndex(word: string): number {
  const n = word.length
  if (n <= 1) return 0
  if (n <= 5) return 1
  if (n <= 9) return 2
  if (n <= 13) return 3
  return 4
}

export function splitORP(word: string): { before: string; orp: string; after: string } {
  const i = orpIndex(word)
  return {
    before: word.slice(0, i),
    orp: word.slice(i, i + 1),
    after: word.slice(i + 1),
  }
}
