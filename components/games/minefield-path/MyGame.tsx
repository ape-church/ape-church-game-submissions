"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { randomBytes, Game } from "@/lib/games";
import GameWindow from "@/components/shared/GameWindow";
import MyGameWindow from "./MyGameWindow";
import MyGameSetupCard from "./MyGameSetupCard";
import { bytesToHex, Hex } from "viem";
import { toast } from "sonner";
import {
    MinefieldState,
    getInitialState,
    getMultiplierForStep,
    TOTAL_STEPS,
    GridTile,
} from "./minefieldLogic";

interface MyGameComponentProps {
    game: Game;
}

const MyGameComponent: React.FC<MyGameComponentProps> = ({ game }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const replayIdString = searchParams.get("id");
    const walletBalance = 25;

    const [currentView, setCurrentView] = React.useState<0 | 1 | 2>(0);
    const [betAmount, setBetAmount] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [payout, setPayout] = React.useState<number | null>(null);
    const [gameOver, setGameOver] = React.useState<boolean>(false);
    const shouldShowPNL: boolean = !!payout && payout > 0;
    const playAgainText = "Play Again";

    const [minefieldState, setMinefieldState] = useState<MinefieldState>(getInitialState());
    const replayGridRef = useRef<GridTile[][] | null>(null);
    const replayPathRef = useRef<{ row: number; col: number }[]>([]);

    const [currentGameId, setCurrentGameId] = useState<bigint>(
        replayIdString == null
            ? BigInt(bytesToHex(new Uint8Array(randomBytes(32))))
            : BigInt(replayIdString)
    );
    const [userRandomWord, setUserRandomWord] = useState<Hex>(
        bytesToHex(new Uint8Array(randomBytes(32)))
    );

    useEffect(() => {
        if (replayIdString !== null) {
            if (replayIdString.length > 2) {
                setIsLoading(true);
                setCurrentGameId(BigInt(replayIdString));
            }
        }
    }, [replayIdString]);

    const revealMinesInColumn = useCallback((grid: GridTile[][], col: number): GridTile[][] => {
        return grid.map((column, colIdx) => {
            if (colIdx !== col) return column;
            return column.map((tile) => ({
                ...tile,
                state: tile.isMine ? "revealed_mine" as const : tile.state,
            }));
        });
    }, []);

    const handleTileClick = useCallback((row: number, col: number) => {
        setMinefieldState((prev) => {
            if (!prev.isAlive || prev.isAnimating) return prev;
            if (col !== prev.currentCol + 1) return prev;

            const tile = prev.grid[col][row];
            if (tile.state !== "hidden") return prev;

            const newState = { ...prev, isAnimating: true };

            if (tile.isMine) {
                let newGrid = prev.grid.map((column, colIdx) =>
                    column.map((t) => {
                        if (colIdx === col && t.row === row) {
                            return { ...t, state: "exploded" as const };
                        }
                        return t;
                    })
                );
                newGrid = revealMinesInColumn(newGrid, col);

                return {
                    ...newState,
                    grid: newGrid,
                    isAlive: false,
                    selectedPath: [...prev.selectedPath, { row, col }],
                };
            }

            const stepNumber = col;
            const multiplier = getMultiplierForStep(stepNumber);

            let newGrid = prev.grid.map((column, colIdx) =>
                column.map((t) => {
                    if (colIdx === col && t.row === row) {
                        return { ...t, state: "safe" as const };
                    }
                    return t;
                })
            );
            newGrid = revealMinesInColumn(newGrid, col);

            return {
                ...newState,
                grid: newGrid,
                currentCol: col,
                currentMultiplier: multiplier,
                selectedPath: [...prev.selectedPath, { row, col }],
            };
        });
    }, [revealMinesInColumn]);

    useEffect(() => {
        if (!minefieldState.isAnimating) return;

        const timer = setTimeout(() => {
            setMinefieldState((prev) => {
                const updated = { ...prev, isAnimating: false };

                if (!prev.isAlive) {
                    setPayout(0);
                    replayGridRef.current = prev.grid;
                    replayPathRef.current = prev.selectedPath;
                    setTimeout(() => {
                        setCurrentView(2);
                        setGameOver(true);
                    }, 800);
                    return updated;
                }

                if (prev.currentCol >= TOTAL_STEPS) {
                    const finalPayout = betAmount * prev.currentMultiplier;
                    setPayout(finalPayout);
                    replayGridRef.current = prev.grid;
                    replayPathRef.current = prev.selectedPath;
                    setTimeout(() => {
                        setCurrentView(2);
                        setGameOver(true);
                    }, 800);
                    return updated;
                }

                return updated;
            });
        }, 600);

        return () => clearTimeout(timer);
    }, [minefieldState.isAnimating, betAmount]);

    const handleCashOut = useCallback(() => {
        if (!minefieldState.isAlive || minefieldState.currentCol === 0) return;

        const cashOutPayout = betAmount * minefieldState.currentMultiplier;
        setPayout(cashOutPayout);
        replayGridRef.current = minefieldState.grid;
        replayPathRef.current = minefieldState.selectedPath;

        setCurrentView(2);
        setGameOver(true);
    }, [minefieldState, betAmount]);

    const playGame = async (gameId?: bigint, randomWord?: Hex) => {
        setIsLoading(true);

        try {
            const receiptSuccess = true;

            if (receiptSuccess) {
                toast.success("Transaction complete!");
                setMinefieldState(getInitialState());
                replayGridRef.current = null;
                replayPathRef.current = [];

                setTimeout(() => {
                    setIsLoading(false);
                    setCurrentView(1);
                }, 1000);
            } else {
                toast.info("Something went wrong..");
                setIsLoading(false);
            }
        } catch (error) {
            if (
                (error instanceof Error &&
                    error.message.includes("Transaction not found")) ||
                (typeof error === "string" && error.includes("Transaction not found"))
            ) {
                return;
            }

            toast.error("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const handleReset = (isPlayingAgain: boolean = false) => {
        if (!isPlayingAgain) {
            const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
            const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));
            setCurrentGameId(newGameId);
            setUserRandomWord(newUserWord);
        }

        setCurrentView(0);
        setPayout(null);
        setGameOver(false);
        setMinefieldState(getInitialState());
        replayGridRef.current = null;
        replayPathRef.current = [];

        if (replayIdString !== null) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("id");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    };

    const handlePlayAgain = async () => {
        const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
        const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));

        setCurrentGameId(newGameId);
        setUserRandomWord(newUserWord);

        handleReset(true);

        await playGame(newGameId, newUserWord);
    };

    const handleRewatch = () => {
        setCurrentView(1);
        setPayout(null);
        setGameOver(false);

        if (replayGridRef.current) {
            const resetGrid = replayGridRef.current.map((column) =>
                column.map((tile) => ({
                    ...tile,
                    state: tile.col === 0 ? ("safe" as const) : ("hidden" as const),
                }))
            );
            setMinefieldState({
                grid: resetGrid,
                currentCol: 0,
                isAlive: true,
                currentMultiplier: 0,
                selectedPath: [],
                isAnimating: false,
            });

            const path = replayPathRef.current;
            if (path.length > 0) {
                path.forEach((step, idx) => {
                    setTimeout(() => {
                        handleTileClick(step.row, step.col);
                    }, (idx + 1) * 1200);
                });
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-10">
                <GameWindow
                    game={game}
                    currentGameId={currentGameId}
                    isLoading={isLoading}
                    isGameFinished={gameOver}
                    onPlayAgain={handlePlayAgain}
                    playAgainText={playAgainText}
                    onRewatch={handleRewatch}
                    onReset={() => handleReset(false)}
                    betAmount={betAmount}
                    payout={payout}
                    inReplayMode={replayIdString !== null}
                    isUserOriginalPlayer={true}
                    showPNL={shouldShowPNL}
                    isGamePaused={false}
                    resultModalDelayMs={1000}
                >
                    <MyGameWindow
                        game={game}
                        minefieldState={minefieldState}
                        onTileClick={handleTileClick}
                    />
                </GameWindow>

                <MyGameSetupCard
                    game={game}
                    onPlay={async () => await playGame()}
                    onCashOut={handleCashOut}
                    onRewatch={handleRewatch}
                    onReset={() => handleReset(false)}
                    onPlayAgain={async () => await handlePlayAgain()}
                    playAgainText={playAgainText}
                    currentView={currentView}
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    isLoading={isLoading}
                    payout={payout}
                    inReplayMode={replayIdString !== null}
                    currentMultiplier={minefieldState.currentMultiplier}
                    stepsDone={minefieldState.currentCol}
                    isAlive={minefieldState.isAlive}
                    account={undefined}
                    walletBalance={walletBalance}
                    playerAddress={undefined}
                    isGamePaused={false}
                    profile={undefined}
                    minBet={1}
                    maxBet={100}
                />
            </div>
        </div>
    );
};

export default MyGameComponent;
