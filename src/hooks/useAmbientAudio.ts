import { useEffect, useRef } from "react";
import type { AudioTrack } from "@/types";

interface Options {
  enabled: boolean;
  track: AudioTrack;
  volume: number;
}

const FADE_S = 0.4;
const VOL_TWEEN_S = 0.15;
const NOISE_BUFFER_S = 4;

// Paul Kellet's pink-noise filter — sounds warmer and less hissy than white.
function fillPinkNoise(buffer: AudioBuffer) {
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
}

interface ActiveSource {
  track: AudioTrack;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
}

function buildSource(
  ctx: AudioContext,
  track: AudioTrack,
  dest: AudioNode,
): ActiveSource | null {
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(dest);

  if (track === "noise") {
    const buf = ctx.createBuffer(
      2,
      ctx.sampleRate * NOISE_BUFFER_S,
      ctx.sampleRate,
    );
    fillPinkNoise(buf);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3000;
    src.connect(filter).connect(out);
    src.start();
    return { track, gain: out, sources: [src] };
  }

  if (track === "binaural") {
    const merger = ctx.createChannelMerger(2);
    const inner = ctx.createGain();
    inner.gain.value = 0.18;
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = "sine";
    oscR.type = "sine";
    oscL.frequency.value = 196;
    oscR.frequency.value = 206;
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(inner).connect(out);
    oscL.start();
    oscR.start();
    return { track, gain: out, sources: [oscL, oscR] };
  }

  out.disconnect();
  return null;
}

function fadeOutAndStop(ctx: AudioContext, src: ActiveSource) {
  const t = ctx.currentTime;
  src.gain.gain.cancelScheduledValues(t);
  src.gain.gain.setValueAtTime(src.gain.gain.value, t);
  src.gain.gain.linearRampToValueAtTime(0, t + FADE_S);
  window.setTimeout(
    () => {
      for (const n of src.sources) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
      try {
        src.gain.disconnect();
      } catch {
        /* ignore */
      }
    },
    FADE_S * 1000 + 50,
  );
}

export function useAmbientAudio({ enabled, track, volume }: Options) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const activeRef = useRef<ActiveSource | null>(null);

  useEffect(() => {
    const supported = track === "noise" || track === "binaural";

    if (!enabled || !supported) {
      const old = activeRef.current;
      if (old && ctxRef.current) {
        fadeOutAndStop(ctxRef.current, old);
        activeRef.current = null;
      }
      return;
    }

    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    const master = masterRef.current!;
    if (ctx.state === "suspended")
      ctx.resume().catch(() => {
        /* gesture pending */
      });

    if (activeRef.current && activeRef.current.track === track) return;

    const old = activeRef.current;
    if (old) fadeOutAndStop(ctx, old);

    const next = buildSource(ctx, track, master);
    if (!next) {
      activeRef.current = null;
      return;
    }
    const t = ctx.currentTime;
    next.gain.gain.setValueAtTime(0, t);
    next.gain.gain.linearRampToValueAtTime(1, t + FADE_S);
    activeRef.current = next;
    // volume is read on initial ctx creation only; subsequent changes are
    // handled by the dedicated volume effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, track]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(volume, t + VOL_TWEEN_S);
  }, [volume]);

  useEffect(() => {
    return () => {
      const old = activeRef.current;
      if (old) {
        for (const n of old.sources) {
          try {
            n.stop();
          } catch {
            /* ignore */
          }
        }
      }
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.close().catch(() => {
          /* ignore */
        });
        ctxRef.current = null;
      }
    };
  }, []);
}
