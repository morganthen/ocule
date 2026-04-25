import { useCallback, useEffect, useRef, useState } from "react";
import type { Token } from "@/lib/tokenize";
import { dwellMs } from "@/lib/dwell";

interface UseRSVPOptions {
  tokens: Token[];
  wpm: number;
  punctMult?: number;
  easePunct?: boolean;
  onIndexChange?: (i: number) => void;
  initialIndex?: number;
}

export function useRSVP({
  tokens,
  wpm,
  punctMult = 1,
  easePunct = true,
  onIndexChange,
  initialIndex = 0,
}: UseRSVPOptions) {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const indexRef = useRef(initialIndex);
  const playingRef = useRef(false);
  const wpmRef = useRef(wpm);
  const punctRef = useRef(punctMult);
  const easeRef = useRef(easePunct);
  const tokensRef = useRef(tokens);
  const nextAtRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);
  useEffect(() => {
    punctRef.current = punctMult;
  }, [punctMult]);
  useEffect(() => {
    easeRef.current = easePunct;
  }, [easePunct]);
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);
  useEffect(() => {
    indexRef.current = index;
    if (onIndexChange) onIndexChange(index);
  }, [index, onIndexChange]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tok = tokensRef.current[indexRef.current];
    if (!tok) {
      setPlaying(false);
      return;
    }
    nextAtRef.current =
      performance.now() +
      dwellMs(tok, wpmRef.current, punctRef.current, easeRef.current);
    const tick = (now: number) => {
      if (!playingRef.current) return;
      if (now >= nextAtRef.current) {
        const next = indexRef.current + 1;
        if (next >= tokensRef.current.length) {
          setPlaying(false);
          return;
        }
        setIndex(next);
        indexRef.current = next;
        const t = tokensRef.current[next];
        nextAtRef.current =
          now + dwellMs(t, wpmRef.current, punctRef.current, easeRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const seek = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(tokensRef.current.length - 1, n));
    setIndex(clamped);
    indexRef.current = clamped;
    if (playingRef.current) {
      const t = tokensRef.current[clamped];
      if (t) {
        nextAtRef.current =
          performance.now() +
          dwellMs(t, wpmRef.current, punctRef.current, easeRef.current);
      }
    }
  }, []);
  const nudge = useCallback(
    (delta: number) => seek(indexRef.current + delta),
    [seek],
  );

  return { index, playing, play, pause, toggle, seek, nudge };
}
