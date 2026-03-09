"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Howl, Howler } from "howler";

import GameWindow from "@/components/shared/GameWindow";
import { paiGow } from "./paiGowConfig";
import PaiGowTable, { type PaiGowTableHandle, type PaiGowTableStatus } from "./PaiGowTable";

// Pai Gow runs inside the platform GameWindow so results + lifecycle controls
// behave consistently on the submissions preview site.
export default function PaiGowTemplateShell() {
  const tableRef = useRef<PaiGowTableHandle | null>(null);
  const gameWrapRef = useRef<HTMLDivElement | null>(null);
  const sidebarHostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<PaiGowTableStatus | null>(null);
  const [gameId, setGameId] = useState<bigint>(() => BigInt(Date.now()));

  // Audio: Pai Gow custom music + win/lose stingers.
  const [muteMusic, setMuteMusic] = useState(false);
  const [muteSfx, setMuteSfx] = useState(false);
  const [audioArmed, setAudioArmed] = useState(false); // set true on first user gesture

  const bgMusicRef = useRef<Howl | null>(null);
  const winSfxRef = useRef<Howl | null>(null);
  const loseSfxRef = useRef<Howl | null>(null);

  const armAudio = useCallback(() => {
    // Mobile browsers require a user gesture to unlock audio.
    setAudioArmed(true);

    try {
      // Howler may not have ctx in some environments; guard it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = (Howler as any).ctx as AudioContext | undefined;
      ctx?.resume?.();
    } catch {
      // ignore
    }

    const bg = bgMusicRef.current;
    if (bg && !muteMusic) {
      // Start immediately on gesture (unlocks playback reliably on iOS/in-app browsers)
      if (!bg.playing()) bg.play();
    }
  }, [muteMusic]);

  const onStatusChange = useCallback((s: PaiGowTableStatus) => {
    setStatus(s);
  }, []);

  const audioPaths = useMemo(
    () => ({
      bg: "/submissions/pai-gow/audio/PaiGow-Instrumental.mp3",
      win: "/submissions/pai-gow/audio/Win.mp3",
      lose: "/submissions/pai-gow/audio/Loose.mp3",
    }),
    [],
  );

  // Init audio objects once.
  useEffect(() => {
    const bg = new Howl({ src: [audioPaths.bg], loop: true, volume: 0.45, preload: true });
    const win = new Howl({ src: [audioPaths.win], volume: 0.85, preload: true });
    const lose = new Howl({ src: [audioPaths.lose, "/submissions/pai-gow/audio/Loose.wav"], volume: 0.85, preload: true });

    bgMusicRef.current = bg;
    winSfxRef.current = win;
    loseSfxRef.current = lose;

    return () => {
      bg.unload();
      win.unload();
      lose.unload();
      bgMusicRef.current = null;
      winSfxRef.current = null;
      loseSfxRef.current = null;
    };
  }, [audioPaths.bg, audioPaths.win, audioPaths.lose]);

  // Apply mute states.
  useEffect(() => {
    bgMusicRef.current?.mute(muteMusic);
  }, [muteMusic]);

  // Start/stop background music based on user gesture + mute.
  useEffect(() => {
    const bg = bgMusicRef.current;
    if (!bg) return;

    if (!audioArmed || muteMusic) {
      // Don't force-stop if unarmed; but pausing keeps it clean.
      if (bg.playing()) bg.pause();
      return;
    }

    if (!bg.playing()) bg.play();
  }, [audioArmed, muteMusic]);

  const onReset = useCallback(() => {
    tableRef.current?.reset();
    setGameId(BigInt(Date.now()));
  }, []);

  const onPlayAgain = useCallback(() => {
    tableRef.current?.playAgain();
    setGameId(BigInt(Date.now()));
  }, []);

  const onRewatch = useCallback(() => {
    tableRef.current?.rewatch();
    setGameId(BigInt(Date.now()));
  }, []);

  const betAmount = status?.betAmount ?? 0;
  const payout = status?.payout ?? 0;

  const showResults = !!status?.isGameFinished;
  const breakdown = status?.breakdown;

  // Play win/lose stinger once when results appear.
  const prevShowResultsRef = useRef(false);
  useEffect(() => {
    const prev = prevShowResultsRef.current;
    prevShowResultsRef.current = showResults;

    if (!showResults || prev) return;
    if (!audioArmed || muteSfx) return;

    // Determine outcome by net vs wager.
    if (payout > betAmount) {
      winSfxRef.current?.play();
    } else if (payout < betAmount) {
      loseSfxRef.current?.play();
    }
    // Push/tie -> no stinger.
  }, [showResults, payout, betAmount, audioArmed, muteSfx]);

  // Mobile: avoid nested scrolling by letting the page be the only vertical scroller.
  // We keep GameWindow at natural height on mobile (no forced inner scrolling).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const apply = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 640);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const format = (n: number | undefined) => (Number.isFinite(n as number) ? String(n) : "0");

  // Desktop: match the right sidebar panel height to the left GameWindow height.
  // (Flex/grid stretching uses the tallest child; our sidebar content can be taller than GameWindow,
  // so we pin the sidebar host height to the GameWindow and let the bets panel scroll internally.)
  useEffect(() => {
    const gameEl = gameWrapRef.current;
    const sideEl = sidebarHostRef.current;
    if (!gameEl || !sideEl) return;

    const apply = () => {
      // Only do this on desktop layouts.
      if (window.innerWidth < 1024) {
        sideEl.style.height = "";
        return;
      }
      const h = gameEl.getBoundingClientRect().height;
      if (h > 0) sideEl.style.height = `${Math.round(h)}px`;
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(gameEl);
    window.addEventListener("resize", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <div className="pgShell">
      {/* Match the platform template: GameWindow on the left, setup/bets panel on the right (desktop). */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-8 lg:gap-10">
        <div ref={gameWrapRef} className="flex-1 min-w-0">
          <GameWindow
            game={paiGow}
            isLoading={!!status?.isLoading}
            isGameFinished={showResults}
betAmount={betAmount}
            payout={payout}
            inReplayMode={false}
            isUserOriginalPlayer={true}
            showPNL={false}
            onReset={onReset}
            onPlayAgain={onPlayAgain}
            onRewatch={onRewatch}
            currentGameId={gameId}
            disableBuiltInSong={true}
            onMusicMutedChange={setMuteMusic}
            onSfxMutedChange={setMuteSfx}
            resultModalDelayMs={900}
          >
            {/* GameWindow renders a background image; mount Pai Gow UI as an overlay on top of it. */}
            <div
              className="pgMobileScroller"
              style={
                isMobile
                  ? ({ position: "relative", zIndex: 10, overflow: "visible", paddingBottom: 44 } as React.CSSProperties)
                  : ({ position: "absolute", inset: 0, zIndex: 10, overflow: "hidden", paddingBottom: 44 } as React.CSSProperties)
              }
            >
              <PaiGowTable
                ref={tableRef}
                onStatusChange={onStatusChange}
                desktopSidebarHostId="pgSidebarHost"
                muteSfx={muteSfx}
                onUserGesture={armAudio}
              />
            </div>

            {/* Results modal is handled by GameWindow (template animation). */}
          </GameWindow>
        </div>

        {/* Setup/Bets panel (right). Desktop gets portal content; mobile ignores this and uses the in-table layout. */}
        <div
          ref={sidebarHostRef}
          id="pgSidebarHost"
          className="w-full lg:w-[380px] rounded-[12px] border-[2.25px] sm:border-[3.75px] lg:border-[4.68px] border-[#2A3640] overflow-hidden"
        />
      </div>
    </div>
  );
}
