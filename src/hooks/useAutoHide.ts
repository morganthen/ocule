import { useEffect, useRef, useState } from 'react'

export function useAutoHide(idleMs = 2000, activeInitially = true) {
  const [visible, setVisible] = useState(activeInitially)
  const timerRef = useRef<number>(0)
  const pokeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const poke = () => {
      setVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setVisible(false), idleMs)
    }
    pokeRef.current = poke
    const onMove = () => poke()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchstart', onMove, { passive: true })
    poke()
    return () => {
      clearTimeout(timerRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onMove)
    }
  }, [idleMs])

  return [visible, () => pokeRef.current && pokeRef.current()] as const
}
