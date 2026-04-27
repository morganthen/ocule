# Ambient audio — design notes

For when "audio" stops being "coming soon" and gets actually built. The
hook (`src/hooks/useAmbientAudio.ts`) already has the right shape; what
needs to change is the playback layer underneath.

## The gap problem

Setting `<audio loop>` on an MP3 produces an audible gap at the loop
seam. The cause isn't the audio file or the loop logic — it's the MP3
format itself. Encoders add silent padding at the start and end of every
file (encoder delay + LAME tail padding). HTML's audio loop respects
those bytes faithfully, which means it plays the silence at every wrap.

Web Audio API doesn't have this problem. `AudioContext.decodeAudioData()`
returns raw PCM samples and skips the encoder padding entirely. Played
through `AudioBufferSourceNode` with `loop = true`, the loop is
sample-accurate.

So the fix is at the playback layer, not the file layer. Format mostly
doesn't matter — MP3 played through Web Audio loops cleanly.

## Per-track decision: procedural or file-based

The four tracks in `Settings['audioTrack']` (`'noise' | 'rain' |
'binaural' | 'forest'`) split cleanly into "can be generated" and "needs
a recording."

### Generate procedurally — no file ships

- **Noise**: `AudioBufferSourceNode` with random PCM samples. ~30 lines
  of Web Audio. White, pink, and brown noise are all minor variants
  (apply a low-pass filter for pink, double-integrate for brown). Zero
  KB shipped, perfect loop because there's no loop — it's a continuous
  source.
- **Binaural**: two `OscillatorNode`s at slightly different frequencies
  (e.g. 200 Hz left ear, 210 Hz right ear) panned hard L / R via a
  `StereoPannerNode`. ~20 lines. Perfect loop, customizable beat
  frequency.

### File-based — needs real recordings

- **Rain**: nature ambience with too much spectral richness to convincingly
  synthesize. Real recording.
- **Forest**: same — birdsong, rustling, distant wind. Real recording.

## Recording specs (for rain and forest)

- **Length**: 60–90 seconds. 30 is too short; the listener starts
  recognizing the loop. 60–90 has enough variation per cycle that the
  loop is unrecognizable without intentional listening.
- **Bitrate**: 128 kbps MP3. Ambient audio doesn't need higher; you'd
  spend the bytes on aliasing artifacts the listener can't hear anyway.
- **Mono vs stereo**: mono halves the file size. Rain and forest lose
  almost nothing in mono (the stereo image is incidental, not artistic).
  If subtle stereo width matters, encode at 96 kbps stereo — same total
  bytes as 192 kbps mono.
- **Format**: MP3 is fine because we're decoding through Web Audio
  anyway. Opus in `.webm` saves another ~30% but adds a code path for
  Safari < 14.1 — not worth the complexity in 2026.
- **Loop point**: pick a 60-second clip whose start and end have similar
  amplitude and spectral content. Web Audio's gapless loop handles the
  seam at the sample level, but *content* discontinuity (e.g., a
  thunderclap right at the seam) is still audible. Sample packs sold as
  "loop-ready" or "seamless" handle this.

Aim for ~1 MB per file. Total ~2 MB for both rain and forest.

## Loading strategy

- **Lazy**: don't fetch the audio files on page mount. Only fetch when
  the user toggles audio on. The four tracks together could be 2–4 MB,
  which is rude to ship for a feature most users never enable.
- **Cache**: serve from `/public/audio/*.mp3` with `Cache-Control:
  public, max-age=31536000, immutable`. Vercel handles this for `/public`
  files automatically when filenames are content-fingerprinted; for V1,
  unfingerprinted is fine — reads `rain.mp3` once, caches forever, only
  rebuild-busts when the file changes (rare).
- **Cross-track fade**: when the user changes track, ramp the current
  source's `GainNode` to 0 over ~400 ms while ramping the new source up
  from 0. The current `useAmbientAudio` hook already has a `FADE_MS = 400`
  constant — keep that pattern, just operate on `GainNode.gain` instead
  of `audio.volume`.

## Sources for the audio files

- **freesound.org** — Creative Commons. Filter by license (CC0 if you
  want zero attribution overhead, CC-BY if you're OK crediting in the
  About modal). Search "rain ambient loop", "forest ambience". Lots of
  long-form recordings; pick one ≥90 s and trim.
- **BBC Sound Effects Archive** (`sound-effects.bbcrewind.co.uk`) —
  free for personal/educational. Commercial use needs a license check.
- **Pixabay audio** — royalty-free, no attribution. Quality is mixed
  but adequate for ambient.
- **Pond5 / Splice / Soundsnap** — paid, higher quality, wider selection.

For Oculé, freesound.org with the CC0 filter is the simplest path. Drop
the chosen files into `/public/audio/rain.mp3` and `/public/audio/forest.mp3`.

## Implementation sketch

When the day comes, replace `useAmbientAudio` with a Web Audio version.
Same external interface (`{enabled, track, volume}`), so nothing in
`App.tsx` changes.

Rough flow inside the new hook:

1. **Lazy `AudioContext`**: create on first `enabled = true`. Browsers
   block AudioContext creation before user interaction, but a settings
   toggle counts as one — no autoplay-policy issues.
2. **Buffer cache**: a module-level `Map<TrackName, AudioBuffer>`. First
   time a track is selected, fetch the file, decode, store. Subsequent
   selections hit the cache.
3. **Source per play**: `AudioBufferSource` is single-use — once stopped,
   it can't restart. Create a fresh source from the cached buffer each
   time you start a new track.
4. **Procedural sources**: noise and binaural don't load anything;
   they construct an `AudioBuffer` (for noise) or `OscillatorNode`s (for
   binaural) on the fly. Same `GainNode` chain so the fade plumbing is
   uniform.
5. **Gain chain**: every source connects to a per-source `GainNode`,
   which connects to `audioContext.destination`. Volume control sets the
   gain; fades ramp the gain.
6. **Cleanup**: stop the source and disconnect the gain when the user
   switches tracks or disables audio. Don't `close()` the AudioContext —
   reuse it for the session.

Estimated effort: a focused half-day. The hook's boundary doesn't move,
so the rest of the app is unaffected.

## What to keep from the current hook

- The autoplay-blocked-on-load handling (the silent-catch on `play()`)
  is still relevant — `AudioContext.resume()` can be similarly blocked
  before user interaction. Keep the same "first interaction kicks it
  off" model.
- The fade-in/out timing (`FADE_MS = 400`) is good. Carry it across.
- The "settings.audioTrack === activeTrackRef.current ? skip" optimization
  prevents re-loading the same buffer when only the volume changes.
  Translate that to the new hook.

## What to ditch

- The HTML5 `Audio` element approach entirely.
- The `loop = true` on a media element. Use `AudioBufferSourceNode.loop`
  instead.

## When to actually build this

Audio is "coming soon" right now because the surface area is real but
not load-bearing. Reasonable triggers to ship it:

1. The reader feels too quiet during long sessions and you find yourself
   wanting it personally.
2. A user (real, not hypothetical) asks for it.
3. You want a feature to show off in a blog post / Show HN — ambient
   audio with clean loops is a nice "details matter" detail.

Until any of those, the four `<button disabled>` states in
`SettingsPopover.tsx` are doing their job.

## Note to future Claude

When the user says "let's add audio for real" — don't reach for Howler.js
or any audio library. The whole implementation is ~150 lines of Web
Audio. Stay native; the dependency tree is already lean and the hook
boundary makes the implementation self-contained.

When picking the noise color: brown noise (sometimes called "red noise")
is the most pleasant for ambient backgrounds — it has more low-frequency
energy and feels less harsh than white noise. Default to brown unless
the user requests otherwise.
