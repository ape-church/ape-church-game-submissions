"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Game } from "@/lib/games";
import MinefieldGrid from "./MinefieldGrid";
import {
    MinefieldState,
    STEP_MULTIPLIERS,
    TOTAL_STEPS,
} from "./minefieldLogic";

interface MyGameWindowProps {
    game: Game;
    minefieldState: MinefieldState;
    onTileClick: (row: number, col: number) => void;
}

const MyGameWindow: React.FC<MyGameWindowProps> = ({
    game,
    minefieldState,
    onTileClick,
}) => {
    const { grid, currentCol, isAlive, isAnimating, selectedPath, currentMultiplier } = minefieldState;
    const stepsDone = Math.max(0, currentCol);
    const nextMultiplier = stepsDone < TOTAL_STEPS ? STEP_MULTIPLIERS[stepsDone] : null;
    const maxMultiplier = STEP_MULTIPLIERS[TOTAL_STEPS - 1];

    return (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-white">
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
                <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[520px]">
                    <div className="flex items-center justify-between w-full px-2">
                        <div className="text-left">
                            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-cyan-300/50">
                                Step {stepsDone}/{TOTAL_STEPS}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentMultiplier > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40"
                                >
                                    <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                                        {currentMultiplier}x
                                    </span>
                                </motion.div>
                            )}

                            {nextMultiplier && isAlive && (
                                <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                    <span className="text-[10px] sm:text-xs font-mono text-white/40">
                                        Next: {nextMultiplier}x
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] sm:text-[10px] font-mono text-white/30">
                                Max {maxMultiplier}x
                            </p>
                        </div>
                    </div>

                    <div className="w-full px-1">
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                animate={{
                                    width: `${(stepsDone / TOTAL_STEPS) * 100}%`,
                                    backgroundColor: isAlive ? "#10b981" : "#ef4444",
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <MinefieldGrid
                        grid={grid}
                        currentCol={currentCol}
                        isAlive={isAlive}
                        isAnimating={isAnimating}
                        selectedPath={selectedPath}
                        onTileClick={onTileClick}
                    />

                    <AnimatePresence>
                        {stepsDone === 0 && isAlive && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-cyan-300/50"
                            >
                                Pick a tile in the highlighted column
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MyGameWindow;
