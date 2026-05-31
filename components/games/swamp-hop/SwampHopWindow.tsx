"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import { Game } from "@/lib/games";
import { FROG_ANCHOR_SLOT, VISIBLE_PAD_COUNT } from "./swampHopConfig";
import { HopResult, PAD_LABELS } from "./swampHopLogic";
import SpriteSheetAnimation from "./SpriteSheetAnimation";
import {
    FroglingAnimationName,
    PAD_IMAGE_SHORE,
    PAD_IMAGE_UNKNOWN,
    PAD_IMAGES,
} from "./swampHopSprites";

interface SwampHopWindowProps {
    game: Game;
    isHopping: boolean;
    currentHopIndex: number;
    maxHops: number;
    gameCompleted: boolean;
    hopHistory: (HopResult | null)[];
    lastHopResult: HopResult | null;
    betAmount: number;
    payoutAmount: number;
    currentBank: number;
    cashedOut: boolean;
}

function getPadImageSrc(
    globalIndex: number,
    padType: number | null,
    isFuture: boolean
): string {
    if (isFuture) {
        return PAD_IMAGE_UNKNOWN;
    }
    if (globalIndex === 0 && padType == null) {
        return PAD_IMAGE_SHORE;
    }
    if (padType != null && PAD_IMAGES[padType]) {
        return PAD_IMAGES[padType];
    }
    return PAD_IMAGE_UNKNOWN;
}

const SwampHopWindow: React.FC<SwampHopWindowProps> = ({
    isHopping,
    currentHopIndex,
    maxHops,
    gameCompleted,
    hopHistory,
    lastHopResult,
    betAmount,
    payoutAmount,
    currentBank,
    cashedOut,
}) => {
    const muteSfx = false;
    const sfxVolume = 0.5;

    const [winSFX] = useSound("/submissions/swamp-hop/sfx/win.mp3", {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true,
    });
    const [loseSFX] = useSound("/submissions/swamp-hop/sfx/lose.mp3", {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true,
    });
    const [hopSFX] = useSound("/submissions/swamp-hop/sfx/hop.mp3", {
        volume: sfxVolume * 0.6,
        soundEnabled: !muteSfx,
        interrupt: true,
    });

    const [showOutcome, setShowOutcome] = useState(false);
    const [frogAnimation, setFrogAnimation] =
        useState<FroglingAnimationName>("idle");

    const frogGlobalIndex = isHopping
        ? Math.min(currentHopIndex + 1, maxHops - 1)
        : Math.min(currentHopIndex, maxHops - 1);

    const visibleStart = Math.max(0, frogGlobalIndex - FROG_ANCHOR_SLOT);
    const frogVisibleIndex = frogGlobalIndex - visibleStart;

    const visiblePads = useMemo(() => {
        return Array.from({ length: VISIBLE_PAD_COUNT }, (_, i) => {
            const globalIndex = visibleStart + i;
            const historyHop = hopHistory[globalIndex] ?? null;
            const isCurrent = globalIndex === frogGlobalIndex;
            const isPast = globalIndex < currentHopIndex;
            const isFuture = globalIndex >= maxHops;

            return {
                globalIndex,
                padType: historyHop?.padType ?? null,
                isCurrent,
                isPast,
                isFuture,
            };
        });
    }, [visibleStart, frogGlobalIndex, currentHopIndex, hopHistory, maxHops]);

    useEffect(() => {
        if (!isHopping) {
            return;
        }
        hopSFX();
        queueMicrotask(() => setFrogAnimation("hop"));
    }, [isHopping, hopSFX]);

    useEffect(() => {
        if (lastHopResult == null || isHopping) {
            return;
        }

        queueMicrotask(() => {
            setShowOutcome(true);

            if (lastHopResult.isCroc) {
                setFrogAnimation("fall");
            } else if (lastHopResult.isShrine) {
                setFrogAnimation("celebrate");
            } else if (lastHopResult.padType === 0) {
                setFrogAnimation("slash");
            } else if (lastHopResult.padType === 2) {
                setFrogAnimation("wobble");
            } else {
                setFrogAnimation("idle");
            }
        });

        const timer = window.setTimeout(() => setShowOutcome(false), 1400);
        return () => window.clearTimeout(timer);
    }, [lastHopResult, isHopping]);

    useEffect(() => {
        if (!gameCompleted || betAmount <= 0) {
            return;
        }

        const multiplier = payoutAmount / betAmount;
        if (multiplier >= 1) {
            winSFX();
            if (!lastHopResult?.isCroc) {
                queueMicrotask(() => setFrogAnimation("celebrate"));
            }
        } else {
            loseSFX();
        }
    }, [gameCompleted, betAmount, payoutAmount, lastHopResult, winSFX, loseSFX]);

    useEffect(() => {
        if (isHopping || frogAnimation === "idle" || frogAnimation === "fall") {
            return undefined;
        }

        const timer = window.setTimeout(() => setFrogAnimation("idle"), 1100);
        return () => window.clearTimeout(timer);
    }, [frogAnimation, isHopping]);

    return (
        <div className="swamp-hop-viewport absolute inset-0 z-10 overflow-hidden text-white pointer-events-none">
            <div className="swamp-hop-playfield">
                <div className="swamp-hop-path">
                    <div
                        className="swamp-hop-pad-track"
                        data-window-start={visibleStart}
                    >
                        {visiblePads.map((pad, index) => {
                            const src = getPadImageSrc(
                                pad.globalIndex,
                                pad.padType,
                                pad.isFuture
                            );
                            const opacity = pad.isPast
                                ? 0.55
                                : pad.isFuture
                                  ? 0.4
                                  : 1;

                            const isFrogPad = index === frogVisibleIndex;

                            return (
                                <div
                                    key={`${pad.globalIndex}-${index}`}
                                    className="swamp-hop-pad"
                                    style={{ opacity }}
                                >
                                    {isFrogPad && (
                                        <motion.div
                                            className="swamp-hop-frog-on-pad"
                                            initial={false}
                                            animate={{
                                                x:
                                                    isHopping &&
                                                    frogVisibleIndex > 0 &&
                                                    frogGlobalIndex <=
                                                        FROG_ANCHOR_SLOT
                                                        ? ["-18%", "0%"]
                                                        : "0%",
                                            }}
                                            transition={{
                                                duration: isHopping ? 0.65 : 0.45,
                                                ease: [0.34, 1.08, 0.64, 1],
                                            }}
                                        >
                                            <motion.div
                                                animate={
                                                    isHopping
                                                        ? { y: [0, -28, 0] }
                                                        : frogAnimation === "fall"
                                                          ? {
                                                                y: [0, 20, 50],
                                                                opacity: [1, 1, 0.3],
                                                            }
                                                          : { y: 0, opacity: 1 }
                                                }
                                                transition={{
                                                    duration: isHopping ? 0.65 : 0.7,
                                                }}
                                            >
                                                <SpriteSheetAnimation
                                                    key={`${currentHopIndex}-${frogAnimation}-${isHopping}`}
                                                    animation={frogAnimation}
                                                    play={!gameCompleted}
                                                    alt="Frogling"
                                                />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                    <motion.div
                                        animate={
                                            pad.isCurrent &&
                                            frogAnimation === "wobble"
                                                ? { rotate: [-4, 4, -2, 0] }
                                                : { rotate: 0 }
                                        }
                                        transition={{ duration: 0.4 }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src}
                                            alt=""
                                            className={`swamp-hop-pad-img ${
                                                pad.isCurrent ? "current" : ""
                                            }`}
                                            draggable={false}
                                        />
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="swamp-hop-pad-labels">
                        {visiblePads.map((pad, index) => (
                            <div
                                key={`label-${pad.globalIndex}-${index}`}
                                className="swamp-hop-pad-label-slot"
                            >
                                <span className="swamp-hop-pad-label">
                                    {pad.isFuture
                                        ? "Ahead"
                                        : pad.padType != null
                                          ? PAD_LABELS[pad.padType]
                                          : pad.globalIndex === 0
                                            ? "Shore"
                                            : "Pad"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showOutcome && lastHopResult != null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="swamp-hop-outcome"
                    >
                        {lastHopResult.isCroc ? (
                            <>
                                <p className="text-[#ff7b7b] font-semibold">
                                    Croc snap!
                                </p>
                                <p className="text-[#ff9a9a] text-sm mt-1">
                                    Lost your bet
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-[#d4a017] font-semibold">
                                    {PAD_LABELS[lastHopResult.padType]}
                                </p>
                                {currentBank > betAmount && betAmount > 0 && (
                                    <p className="text-[#8fd98a] text-sm mt-1 font-semibold">
                                        +{(currentBank - betAmount).toFixed(2)}{" "}
                                        APE
                                    </p>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {cashedOut && (
                <div className="swamp-hop-outcome" style={{ bottom: "18%" }}>
                    <p className="text-[#8fd98a] font-semibold text-sm">
                        Cashed out!
                    </p>
                </div>
            )}
        </div>
    );
};

export default SwampHopWindow;
