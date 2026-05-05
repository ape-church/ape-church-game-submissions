"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Game } from "@/lib/games";
import {
    clampCastsPerSession,
    fishingManualAdvanceEnabled,
    fishingPhaseDisplayLabel,
    type FishingPhase,
} from "./myGameConfig";

export interface MyGameUnderGameActionsProps {
    game: Game;
    currentView: 0 | 1 | 2;
    fishingPhase: FishingPhase;
    themeColorBackground: string;
    betAmount: number;
    walletBalance: number;
    castsPerSession: number;
    /** True when Cast line should stay disabled (stake &gt; wallet, etc.). */
    sessionPlayBlocked: boolean;
    onPlay: () => void;
    onAdvance: () => void;
    onPlayAgain: () => void;
    onRewatch: () => void;
    onReset: () => void;
    playAgainText?: string;
    /** Reel minigame HUD — rendered between phase status and primary actions. */
    reelSlot: React.ReactNode;
}

const MyGameUnderGameActions: React.FC<MyGameUnderGameActionsProps> = ({
    game,
    currentView,
    fishingPhase,
    themeColorBackground,
    betAmount,
    walletBalance,
    castsPerSession,
    sessionPlayBlocked,
    onPlay,
    onAdvance,
    onPlayAgain,
    onRewatch,
    onReset,
    playAgainText = "Play Again",
    reelSlot,
}) => {
    const advanceEnabled = fishingManualAdvanceEnabled(
        currentView,
        fishingPhase,
    );

    return (
        <div className="flex w-full min-w-0 flex-col gap-3 font-roboto">
            <div className="rounded-lg border border-[#2a3640]/80 bg-black/25 px-3 py-2.5 text-center shadow-inner backdrop-blur-[2px] min-[480px]:px-4 min-[480px]:py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#91989C] min-[480px]:text-xs">
                    Status
                </p>
                <p
                    className="mt-0.5 text-lg font-semibold leading-tight min-[480px]:text-xl"
                    style={{ color: themeColorBackground }}
                >
                    {fishingPhaseDisplayLabel(fishingPhase)}
                </p>
            </div>

            {reelSlot}

            {currentView === 0 && (
                <Button
                    type="button"
                    onClick={onPlay}
                    className="w-full"
                    style={{
                        backgroundColor: themeColorBackground,
                        borderColor: themeColorBackground,
                    }}
                    disabled={sessionPlayBlocked}
                    title={
                        betAmount * clampCastsPerSession(castsPerSession) >
                        walletBalance
                            ? `Need at least ${(betAmount * clampCastsPerSession(castsPerSession)).toLocaleString([], { maximumFractionDigits: 2 })} APE for this session`
                            : undefined
                    }
                >
                    Cast line
                    {castsPerSession > 1
                        ? ` (${clampCastsPerSession(castsPerSession)}×)`
                        : ""}
                </Button>
            )}

            {currentView === 1 && (
                <div className="flex flex-col items-center gap-2">
                    {game.advanceToNextStateAsset ? (
                        <button
                            type="button"
                            onClick={onAdvance}
                            disabled={!advanceEnabled}
                            className="w-full max-w-[220px] disabled:opacity-40 min-[480px]:max-w-[260px]"
                        >
                            <Image
                                src={game.advanceToNextStateAsset}
                                alt="Next phase"
                                width={196.5}
                                height={179.82}
                                className="mx-auto h-[88px] w-[96px] transition-transform duration-100 ease-out active:scale-97 min-[480px]:h-[100px] min-[480px]:w-[109px]"
                            />
                        </button>
                    ) : (
                        <Button
                            type="button"
                            onClick={onAdvance}
                            className="w-full max-w-md"
                            disabled={!advanceEnabled}
                        >
                            Next phase
                        </Button>
                    )}
                </div>
            )}

            {currentView === 2 && (
                <div className="flex w-full flex-col gap-2.5">
                    <Button
                        type="button"
                        className="w-full"
                        style={{
                            backgroundColor: themeColorBackground,
                            borderColor: themeColorBackground,
                        }}
                        onClick={onPlayAgain}
                    >
                        {playAgainText}
                    </Button>
                    <Button
                        type="button"
                        className="w-full"
                        variant="secondary"
                        onClick={onRewatch}
                    >
                        Rewatch
                    </Button>
                    <Button
                        type="button"
                        className="w-full"
                        variant="secondary"
                        onClick={onReset}
                    >
                        Change Bet
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MyGameUnderGameActions;
