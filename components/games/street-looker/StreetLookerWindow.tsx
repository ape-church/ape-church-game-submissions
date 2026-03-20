"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import SpriteAnimation, {
  preloadSpriteFrames,
} from "@/components/shared/SpriteAnimation";
import {
  getMachineTierLabel,
  PUNCH_MACHINE_LIMITS,
  PunchPhase,
  ResolvedPunchRound,
  SCENE_FRAMES,
} from "./streetLookerGameConfig";

interface MyGameWindowProps {
  phase: PunchPhase;
  round: ResolvedPunchRound | null;
  isGameFinished: boolean;
}

interface RollingScoreTextProps {
  target: number;
  durationMs: number;
}

const ANIMATION_FPS = {
  cheerleaders: 14,
  boxerIdle: 14,
  boxerImpact: 20,
  boxerResolve: 16,
  machineImpact: 20,
  flash: 22,
  confetti: 16,
  explosion: 20,
} as const;

const boxerImpactHoldFrame =
  SCENE_FRAMES.boxerPunch[SCENE_FRAMES.boxerPunch.length - 1];
const machineResolvedFrame =
  SCENE_FRAMES.machineImpact[SCENE_FRAMES.machineImpact.length - 1];

const SCENE_TRANSITION_ASSETS = [
  ...SCENE_FRAMES.boxerPunch,
  ...SCENE_FRAMES.boxerWin,
  ...SCENE_FRAMES.boxerLoss,
  ...SCENE_FRAMES.machineImpact,
  ...SCENE_FRAMES.confetti,
  ...SCENE_FRAMES.explosion,
  SCENE_FRAMES.loseOverlay,
  ...SCENE_FRAMES.cheerleaders.celebration.flat(),
  ...SCENE_FRAMES.cheerleaders.disappointed.flat(),
] as const;

const formatPunchScore = (value: number): string =>
  String(Math.max(0, Math.min(999, Math.floor(value)))).padStart(3, "0");

const RollingScoreText: React.FC<RollingScoreTextProps> = ({
  target,
  durationMs,
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      return undefined;
    }

    const startTime = performance.now();
    const intervalId = window.setInterval(() => {
      const elapsedMs = performance.now() - startTime;
      const progress = Math.min(1, elapsedMs / durationMs);
      const nextValue = Math.floor(progress * target);

      setValue((previous) => (previous === nextValue ? previous : nextValue));

      if (progress >= 1) {
        window.clearInterval(intervalId);
      }
    }, 16);

    return () => window.clearInterval(intervalId);
  }, [durationMs, target]);

  return <>{formatPunchScore(value)}</>;
};

const MyGameWindow: React.FC<MyGameWindowProps> = ({
  phase,
  round,
  isGameFinished,
}) => {
  const [lossExplosionGameId, setLossExplosionGameId] = useState<bigint | null>(null);
  const frontCheerleaderPositions = ["left", "center", "right"] as const;
  const backCheerleaderPositions = ["back-left", "back-right"] as const;
  const backCheerleaderVariants = [2, 0] as const;
  const isResultVisible = phase === "reveal" || phase === "resolve" || isGameFinished;
  const showLossExplosion =
    phase === "resolve" &&
    round != null &&
    !round.didWin &&
    lossExplosionGameId === round.gameId;
  const isCountingScore = phase === "reveal" && round != null;
  const finalScore = round == null ? null : formatPunchScore(round.roll);
  const displayScore =
    round == null || !isResultVisible
      ? "???"
      : isCountingScore
        ? null
        : finalScore;
  const machineDisplayScore =
    round == null
      ? "???"
      : isCountingScore
        ? null
        : isResultVisible
          ? finalScore
          : "";
  const cheerMode =
    phase === "resolve" || isGameFinished
      ? round?.didWin
        ? "celebration"
        : "disappointed"
      : "idle";

  const boxerFrames =
    phase === "impact"
      ? SCENE_FRAMES.boxerPunch
      : phase === "reveal"
        ? [boxerImpactHoldFrame]
      : phase === "resolve" || isGameFinished
        ? round?.didWin
          ? SCENE_FRAMES.boxerWin
          : SCENE_FRAMES.boxerLoss
        : SCENE_FRAMES.boxerIdle;
  const boxerShouldLoop =
    phase === "idle" || phase === "resolve" || isGameFinished;
  const machineFrames =
    phase === "impact"
      ? SCENE_FRAMES.machineImpact
      : isResultVisible
        ? [machineResolvedFrame]
        : [SCENE_FRAMES.machineStatic];

  const statusHeadline =
    phase === "loading"
      ? "Reading the machine"
      : phase === "impact"
        ? "Impact registered"
        : phase === "reveal"
          ? "Score locked in"
        : phase === "resolve" || isGameFinished
          ? round?.didWin
            ? "Threshold cleared"
            : "Threshold missed"
          : "Set your buy-in and call your shot";

  const statusBody =
    phase === "loading"
      ? "Cab lights strobe while the cabinet locks in your random score."
      : phase === "impact"
        ? "The glove swings, the bag snaps, and the crowd waits for the readout."
        : phase === "reveal"
          ? "The machine posts the score before the crowd reacts."
        : phase === "resolve" || isGameFinished
          ? round == null
            ? "No round loaded."
            : `${getMachineTierLabel(round.roll)}. ${round.didWin ? "Payout armed." : "No payout this time."}`
          : "Lower thresholds cash more often. Higher thresholds hit harder when they connect.";

  useEffect(() => {
    void preloadSpriteFrames(SCENE_TRANSITION_ASSETS);
  }, []);

  useEffect(() => {
    if (phase !== "resolve" || round == null || round.didWin) {
      setLossExplosionGameId(null);
      return undefined;
    }

    setLossExplosionGameId(null);

    const timeoutId = window.setTimeout(() => {
      setLossExplosionGameId(round.gameId);
    }, PUNCH_MACHINE_LIMITS.lossExplosionDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [phase, round?.didWin, round?.gameId]);

  return (
    <div className="punch-machine-shell">
      <div className="punch-machine-bg" />

      {/* <div className="punch-machine-score-counter">
        <strong>Power Score</strong>
        <span>
          {isCountingScore && round != null ? (
            <RollingScoreText
              key={`counter-${round.gameId.toString()}`}
              target={round.roll}
              durationMs={PUNCH_MACHINE_LIMITS.revealDurationMs}
            />
          ) : (
            displayScore
          )}
        </span>
      </div> */}

      <div className="punch-machine-cheerleaders" aria-hidden="true">
        {backCheerleaderPositions.map((cheerleaderPosition, index) => (
          <SpriteAnimation
            key={`back-${index}`}
            alt={`Back cheerleader ${index + 1}`}
            frames={SCENE_FRAMES.cheerleaders[cheerMode][backCheerleaderVariants[index]]}
            className={`punch-machine-layer punch-machine-cheerleader back ${cheerleaderPosition}`}
            fps={ANIMATION_FPS.cheerleaders}
            loop
            play
            preload
            holdWhileLoading
            restartKey={`${cheerMode}-${round?.gameId.toString() ?? "setup"}-back-${index}`}
          />
        ))}

        {SCENE_FRAMES.cheerleaders[cheerMode].map((frames, index) => {
          const cheerleaderPosition = frontCheerleaderPositions[index];
          return (
            <SpriteAnimation
              key={`front-${index}`}
              alt={`Cheerleader ${index + 1}`}
              frames={frames}
              className={`punch-machine-layer punch-machine-cheerleader front ${cheerleaderPosition}`}
              fps={ANIMATION_FPS.cheerleaders}
              loop
              play
              preload
              holdWhileLoading
              restartKey={`${cheerMode}-${round?.gameId.toString() ?? "setup"}-front-${index}`}
            />
          );
        })}
      </div>

      <SpriteAnimation
        alt="Boxer"
        frames={boxerFrames}
        className="punch-machine-layer punch-machine-boxer"
        fps={
          phase === "impact"
            ? ANIMATION_FPS.boxerImpact
            : phase === "resolve" || isGameFinished
              ? ANIMATION_FPS.boxerResolve
              : ANIMATION_FPS.boxerIdle
        }
        loop={boxerShouldLoop}
        play
        preload
        holdWhileLoading
        restartKey={`${phase}-${round?.gameId.toString() ?? "setup"}-boxer`}
      />

      <div className="punch-machine-machine" aria-hidden="true">
        <SpriteAnimation
          alt="Punching arcade machine"
          frames={machineFrames}
          className="punch-machine-machine-frame"
          fps={ANIMATION_FPS.machineImpact}
          loop={false}
          play
          preload
          holdWhileLoading
          restartKey={`${phase}-${round?.gameId.toString() ?? "setup"}-machine`}
        />

        <div className="punch-machine-scoreboard">
          <div className="punch-machine-scoreboard-value">
            {isCountingScore && round != null ? (
              <RollingScoreText
                key={`machine-${round.gameId.toString()}`}
                target={round.roll}
                durationMs={PUNCH_MACHINE_LIMITS.revealDurationMs}
              />
            ) : (
              machineDisplayScore
            )}
          </div>
        </div>
      </div>

      {phase === "loading" && (
        <SpriteAnimation
          alt="Camera flash effect"
          frames={SCENE_FRAMES.flash}
          className="punch-machine-overlay"
          fps={ANIMATION_FPS.flash}
          loop
          play
          preload
          holdWhileLoading
          restartKey={`${round?.gameId.toString() ?? "setup"}-flash`}
        />
      )}

      {(phase === "resolve" || isGameFinished) && round?.didWin && (
        <SpriteAnimation
          alt="Confetti effect"
          frames={SCENE_FRAMES.confetti}
          className="punch-machine-overlay"
          fps={ANIMATION_FPS.confetti}
          loop
          play
          preload
          holdWhileLoading
          restartKey={`${round.gameId.toString()}-confetti`}
        />
      )}

      {showLossExplosion && round != null && !round.didWin && (
        <SpriteAnimation
          alt="Explosion effect"
          frames={SCENE_FRAMES.explosion}
          className="punch-machine-overlay punch-machine-explosion"
          fps={ANIMATION_FPS.explosion}
          loop
          play
          preload
          holdWhileLoading
          restartKey={`${round.gameId.toString()}-explosion`}
        />
      )}

      {(phase === "resolve" || isGameFinished) && round != null && !round.didWin && (
        <img
          src={SCENE_FRAMES.loseOverlay}
          alt="Loss overlay"
          className="punch-machine-overlay punch-machine-filter"
          draggable={false}
        />
      )}

      {/* <div className="punch-machine-status">
        <strong>{statusHeadline}</strong>
        <span>{statusBody}</span>
      </div> */}
    </div>
  );
};

export default MyGameWindow;
