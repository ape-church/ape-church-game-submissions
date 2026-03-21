"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { randomBytes, Game } from "@/lib/games";
import GameWindow from "@/components/shared/GameWindow";
import MyGameWindow from "./MyGameWindow";
import MyGameSetupCard from "./MyGameSetupCard";
import { bytesToHex, Hex } from "viem";
import { toast } from "sonner";

interface MyGameComponentProps {
    game: Game;
}

const MyGameComponent: React.FC<MyGameComponentProps> = ({ game }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const replayIdString = searchParams.get("id");
    const walletBalance = 25;
    const [isGameOngoing, setIsGameOngoing] = React.useState<boolean>(false);
    const [currentView, setCurrentView] = React.useState<0 | 1 | 2>(0);

    const [betAmount, setBetAmount] = React.useState<number>(0);
    const [gridSize, setGridSize] = React.useState<number>(9);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [payout, setPayout] = React.useState<number | null>(null);
    const [gameOver, setGameOver] = React.useState<boolean>(false);
    const [gridValues, setGridValues] = React.useState<('hidden' | 'gold' | 'rock' | 'dynamite' | 'destroyed')[]>(Array(81).fill('hidden'));
    const [isRevealing, setIsRevealing] = React.useState<boolean>(false);
    const [revealedCount, setRevealedCount] = React.useState<number>(0);
    const shouldShowPNL: boolean = !!payout && payout > 0;
    const playAgainText = "Play Again";

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

    const calculateWinConditions = (grid: string[]) => {
        const goldCount = grid.filter(cell => cell === 'gold').length;

        if (goldCount >= 70) {
            return { type: 'massive-gold', multiplier: 100, goldCount };
        } else if (goldCount >= 60) {
            return { type: 'huge-gold', multiplier: 50, goldCount };
        } else if (goldCount >= 50) {
            return { type: 'big-gold', multiplier: 25, goldCount };
        } else if (goldCount >= 40) {
            return { type: 'great-gold', multiplier: 10, goldCount };
        } else if (goldCount >= 30) {
            return { type: 'good-gold', multiplier: 5, goldCount };
        } else if (goldCount >= 20) {
            return { type: 'decent-gold', multiplier: 2, goldCount };
        } else if (goldCount >= 10) {
            return { type: 'small-gold', multiplier: 1.2, goldCount };
        }

        return { type: 'none', multiplier: 0, goldCount: 0 };
    };

    const playGame = async (
        gameId?: bigint,
        randomWord?: Hex,
    ) => {
        setIsLoading(true);
        setIsGameOngoing(true);

        const gameIdToUse = gameId ?? currentGameId;
        const randomWordToUse = randomWord ?? userRandomWord;

        try {
            const receiptSuccess = true;

            if (receiptSuccess) {
                toast.success("Transaction complete!");
                setTimeout(() => {
                    setIsLoading(false);
                    setCurrentView(1);
                }, 1000);
            }
            else {
                console.error("Something went wrong..");
                toast.info("Something went wrong..");
                setIsLoading(false);
                setIsGameOngoing(false);
            }
        }
        catch (error) {
            if (
                (error instanceof Error &&
                    error.message.includes("Transaction not found")) ||
                (typeof error === "string" && error.includes("Transaction not found"))
            ) {
                console.warn("Ignoring a known timeout error.");
                return;
            }

            console.error("An unexpected error occurred:", error);
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
            setIsGameOngoing(false);
        }
    };

    const handleRevealGrid = () => {
        if (isRevealing) {
            return;
        }

        setIsRevealing(true);
        const totalCells = gridSize * gridSize;
        const newGrid: ('gold' | 'rock' | 'dynamite' | 'destroyed')[] = Array(totalCells).fill(0).map(() => {
            const rand = Math.random();
            if (rand > 0.75) return 'gold';
            if (rand > 0.55) return 'dynamite';
            return 'rock';
        });

        let revealed = 0;
        const revealInterval = setInterval(() => {
            if (revealed < totalCells) {
                setGridValues(prev => {
                    const updated = [...prev];
                    updated[revealed] = newGrid[revealed];
                    return updated;
                });
                revealed++;
                setRevealedCount(revealed);
            } else {
                clearInterval(revealInterval);
                setIsRevealing(false);

                const processedGrid = [...newGrid];
                for (let row = 0; row < gridSize; row++) {
                    const rowStart = row * gridSize;
                    const rowEnd = rowStart + gridSize;
                    const rowCells = processedGrid.slice(rowStart, rowEnd);

                    const hasDynamite = rowCells.includes('dynamite');
                    const goldCount = rowCells.filter(cell => cell === 'gold').length;

                    if (hasDynamite && goldCount >= 3) {
                        for (let col = 0; col < gridSize; col++) {
                            const idx = rowStart + col;
                            if (processedGrid[idx] === 'gold') {
                                processedGrid[idx] = 'destroyed';
                            }
                        }
                    }
                }

                setGridValues(processedGrid);

                const winResult = calculateWinConditions(processedGrid);
                const totalPayout = betAmount * winResult.multiplier;
                setPayout(totalPayout);

                setTimeout(() => {
                    setCurrentView(2);
                    setGameOver(true);
                    setIsGameOngoing(false);
                }, 1000);
            }
        }, 50);
    };

    const handleReset = (isPlayingAgain: boolean = false) => {
        if (isPlayingAgain === false) {
            const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
            const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));
            setCurrentGameId(newGameId);
            setUserRandomWord(newUserWord);
        }

        setIsRevealing(false);
        setCurrentView(0);
        setPayout(null);
        setGameOver(false);
        setIsGameOngoing(false);
        setGridValues(Array(gridSize * gridSize).fill('hidden'));
        setRevealedCount(0);

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
        setIsRevealing(false);
        setIsGameOngoing(false);
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
                    customHeightMobile="700px"
                >
                    <MyGameWindow
                        game={game}
                        gridValues={gridValues}
                        isRevealing={isRevealing}
                        gridSize={gridSize}
                    />
                </GameWindow>

                <MyGameSetupCard
                    game={game}
                    onPlay={async () => await playGame()}
                    onReveal={handleRevealGrid}
                    onRewatch={handleRewatch}
                    onReset={() => handleReset(false)}
                    onPlayAgain={async () => await handlePlayAgain()}
                    playAgainText={playAgainText}
                    currentView={currentView}
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    gridSize={gridSize}
                    setGridSize={setGridSize}
                    isLoading={isLoading}
                    payout={payout}
                    inReplayMode={replayIdString !== null}
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
