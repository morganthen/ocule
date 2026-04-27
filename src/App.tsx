import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Chrome } from "@/components/Chrome";
import { OculeLogo } from "@/components/OculeLogo";
import { AboutModal } from "@/components/AboutModal";
import { PasteView } from "@/components/PasteView";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import { ReaderView } from "@/components/ReaderView";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { useAutoHide } from "@/hooks/useAutoHide";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRSVP } from "@/hooks/useRSVP";
import { tokenize } from "@/lib/tokenize";
import type { Session, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const SAMPLE_TEXT = `The library at night was a different place. When the stacks emptied and the reading lamps were the only islands of warmth, the books seemed to lean closer to you — an audience of old friends pretending not to listen.

Reading fast is not a trick of the eye but a discipline of the mind. The words will not wait for you; you must learn to meet them exactly where they land, one after another, as steadily as a second hand.

There is a point near the start of every word, not the first letter, not the middle, where the eye prefers to rest. Anchor yourself there and the sentence passes through you like a train through a station, each word arriving on time and leaving on time.

Some evenings, in a quiet room, a paragraph will find you. You do not find it. You had been preparing for it for years without knowing, and tonight, at 340 words per minute, it finally arrives.`;

function App() {
  const [settingsRaw, setSettingsRaw] = useLocalStorage<Partial<Settings>>(
    "rsvp.settings",
    {},
  );
  const settings: Settings = { ...DEFAULT_SETTINGS, ...settingsRaw };
  const setSettings = (s: Settings) => setSettingsRaw(s);

  const [session, setSession] = useLocalStorage<Session | null>(
    "rsvp.session",
    null,
  );

  const [view, setView] = useState<"paste" | "reader">("paste");
  const [text, setText] = useState("");
  const [flashBar, setFlashBar] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const wpm = settings.wpm;
  const setWpm = (v: number) => setSettings({ ...settings, wpm: v });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-font", settings.font);
  }, [settings.font]);
  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", settings.fontSize);
  }, [settings.fontSize]);

  useAmbientAudio({
    enabled: settings.audioEnabled,
    track: settings.audioTrack,
    volume: settings.audioVolume,
  });

  const tokens = useMemo(() => tokenize(text), [text]);

  const lastSavedIdx = useRef(-1);

  const handleIndexChange = useCallback(
    (i: number) => {
      if (Math.abs(i - lastSavedIdx.current) >= 5) {
        lastSavedIdx.current = i;
        if (text) setSession({ text, index: i, wpm, updatedAt: Date.now() });
      }
    },
    [text, wpm, setSession],
  );

  const { index, playing, play, pause, toggle, seek, nudge } = useRSVP({
    tokens,
    wpm,
    punctMult: settings.punctMult ?? 1,
    easePunct: settings.easePunct !== false,
    onIndexChange: handleIndexChange,
  });

  const onBack = useCallback(() => {
    setSession({ text, index, wpm, updatedAt: Date.now() });
    setView("paste");
    pause();
  }, [text, index, wpm, setSession, pause]);

  const jumpBy = useCallback(
    (delta: number) => {
      seek(index + delta);
      setFlashBar(true);
      setTimeout(() => setFlashBar(false), 450);
    },
    [seek, index],
  );

  const lastLeftRef = useRef(0);
  const lastRightRef = useRef(0);
  const scrubDirRef = useRef(0);
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (scrubDirRef.current !== 0) {
        if (now - last > 60) {
          nudge(scrubDirRef.current);
          last = now;
        }
        raf = requestAnimationFrame(tick);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (view !== "reader") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName || "";
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      // When the scrub-bar slider has focus, Radix handles arrow keys.
      // Let it own them so we don't advance twice.
      if (target?.getAttribute("role") === "slider") return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === "Escape") {
        onBack();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.repeat) {
          if (scrubDirRef.current !== -1) {
            scrubDirRef.current = -1;
            raf = requestAnimationFrame(tick);
          }
        } else if (playingRef.current) {
          const now = Date.now();
          if (now - lastLeftRef.current < 400) {
            seek(index - 10);
            play();
            setFlashBar(true);
            setTimeout(() => setFlashBar(false), 450);
            lastLeftRef.current = 0;
          } else {
            nudge(-1);
            lastLeftRef.current = now;
          }
        } else {
          nudge(-1);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) {
          if (scrubDirRef.current !== 1) {
            scrubDirRef.current = 1;
            raf = requestAnimationFrame(tick);
          }
        } else if (playingRef.current) {
          const now = Date.now();
          if (now - lastRightRef.current < 400) {
            seek(index + 10);
            play();
            setFlashBar(true);
            setTimeout(() => setFlashBar(false), 450);
            lastRightRef.current = 0;
          } else {
            nudge(1);
            lastRightRef.current = now;
          }
        } else {
          nudge(1);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSettings({ ...settings, wpm: Math.min(1200, settings.wpm + 25) });
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSettings({ ...settings, wpm: Math.max(100, settings.wpm - 25) });
        return;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        scrubDirRef.current = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    view,
    index,
    toggle,
    seek,
    nudge,
    play,
    pause,
    text,
    wpm,
    setSession,
    settings,
  ]);

  const [chromeVisible] = useAutoHide(2000, true);

  const onStart = useCallback(
    (t: string) => {
      setText(t);
      seek(0);
      setSession({ text: t, index: 0, wpm, updatedAt: Date.now() });
      setView("reader");
      setTimeout(() => play(), 300);
    },
    [seek, setSession, wpm, play],
  );

  const onResume = useCallback(() => {
    if (!session) return;
    setText(session.text);
    // Session's wpm (if present) takes precedence so the reader resumes at
    // whatever speed the user was last reading.
    if (session.wpm) setSettings({ ...settings, wpm: session.wpm });
    setView("reader");
    setTimeout(() => {
      seek(session.index || 0);
      play();
    }, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, seek, play]);

  const onClearResume = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const resumable = useMemo(() => {
    if (!session || !session.text) return null;
    const toks = tokenize(session.text);
    if (!toks.length) return null;
    const idx = Math.min(session.index || 0, toks.length - 1);
    const pct = Math.round((idx / Math.max(1, toks.length - 1)) * 100);
    return { nextWord: toks[idx].word, pct };
  }, [session]);

  return (
    <div className="app" data-view={view}>
      <Chrome
        visible={view === "paste" ? true : chromeVisible}
        wpm={wpm}
        setWpm={setWpm}
        settings={settings}
        setSettings={setSettings}
      />
      <OculeLogo
        visible={view === "paste" ? true : chromeVisible}
        onAboutClick={() => setAboutOpen(true)}
      />
      {view === "reader" && (
        <BackButton onBack={onBack} visible={chromeVisible} />
      )}
      {view === "reader" && (
        <PlayPauseButton
          playing={playing}
          onToggle={toggle}
          onRewind={() => jumpBy(-10)}
          onForward={() => jumpBy(10)}
          visible={true}
        />
      )}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {view === "paste" && (
        <PasteView
          onStart={onStart}
          resumable={resumable}
          onResume={onResume}
          onClearResume={onClearResume}
          initialText={session && session.text ? session.text : ""}
        />
      )}
      {view === "reader" && (
        <ReaderView
          tokens={tokens}
          index={index}
          playing={playing}
          wpm={wpm}
          peripheral={settings.peripheral}
          fontSize={settings.fontSize}
          animate={settings.animate}
          wordMult={settings.wordMult ?? 1}
          periMult={settings.periMult ?? 1}
          punctMult={settings.punctMult ?? 1}
          easePunct={settings.easePunct !== false}
          mode={settings.mode}
          onToggle={toggle}
          onNudge={nudge}
          onSeek={seek}
          flashBar={flashBar}
          chromeVisible={chromeVisible}
        />
      )}

      {view === "paste" && (
        <div className="sample-seed">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onStart(SAMPLE_TEXT);
            }}
          >
            or read a short sample
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
