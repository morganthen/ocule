import { useEffect, useRef } from 'react'
import type { AudioTrack } from '@/types'

interface Options {
  enabled: boolean
  track: AudioTrack
  volume: number
}

const FADE_MS = 400

// Browsers block Audio.play() before any user interaction. The first play()
// after a fresh load may reject — we swallow it. Audio will start successfully
// after the user's first click/keypress; this is normal browser behavior.
export function useAmbientAudio({ enabled, track, volume }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeTrackRef = useRef<AudioTrack | null>(null)
  const fadingRef = useRef(false)
  const volumeRef = useRef(volume)
  const fadeRafRef = useRef(0)

  useEffect(() => {
    volumeRef.current = volume
    if (!fadingRef.current && audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    cancelAnimationFrame(fadeRafRef.current)

    const old = audioRef.current
    const oldStartVol = old?.volume ?? 0

    const wantTrack = enabled ? track : null
    const sameTrack = old && activeTrackRef.current === wantTrack

    if (sameTrack) {
      // Already on this track — just fade volume (handled by volume effect)
      return
    }

    let next: HTMLAudioElement | null = null
    if (wantTrack) {
      next = new Audio(`/audio/${wantTrack}.mp3`)
      next.loop = true
      next.volume = 0
      next.play().catch(() => {
        // autoplay blocked or file missing — silent fail
      })
    }
    audioRef.current = next
    activeTrackRef.current = wantTrack

    fadingRef.current = true
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS)
      if (old) old.volume = oldStartVol * (1 - t)
      if (next) next.volume = volumeRef.current * t
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(tick)
      } else {
        if (old) {
          old.pause()
          old.src = ''
        }
        fadingRef.current = false
      }
    }
    fadeRafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(fadeRafRef.current)
    }
  }, [enabled, track])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(fadeRafRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])
}
