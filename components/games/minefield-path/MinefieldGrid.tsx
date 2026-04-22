"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bomb, Shield, Footprints } from "lucide-react";
import {
    GridTile,
    GRID_ROWS,
    GRID_COLS,
    TileState,
    STEP_MULTIPLIERS,
} from "./minefieldLogic";

const VISIBLE_COLS = 5;

interface MinefieldGridProps {
    grid: GridTile[][];
    currentCol: number;
    isAlive: boolean;
    isAnimating: boolean;
    selectedPath: { row: number; col: number }[];
    onTileClick: (row: number, col: number) => void;
}

const getTileColors = (state: TileState, isClickable: boolean, isStartCol: boolean) => {
    switch (state) {
        case "safe":
            return isStartCol
                ? "bg-cyan-500/15 border-cyan-400/30"
                : "bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.2)]";
        case "mine":
        case "revealed_mine":
            return "bg-white/5 border-red-500/30";
        case "exploded":
            return "bg-red-500/25 border-red-400/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
        case "hidden":
        default:
            return isClickable
                ? "bg-white/[0.06] border-white/[0.15] hover:bg-cyan-500/15 hover:border-cyan-400/40 hover:shadow-[0_0_16px_rgba(14,165,233,0.2)] cursor-pointer"
                : "bg-white/[0.04] border-white/[0.08]";
    }
};

const TileIcon: React.FC<{ state: TileState; isStartCol: boolean }> = ({ state, isStartCol }) => {
    if (isStartCol) {
        return <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300/60" />;
    }
    switch (state) {
        case "safe":
            return (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </motion.div>
            );
        case "exploded":
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.4, 1] }}
                    transition={{ duration: 0.4, times: [0, 0.6, 1] }}
                >
                    <Bomb className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </motion.div>
            );
        case "mine":
        case "revealed_mine":
            return (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400/70" />
                </motion.div>
            );
        default:
            return null;
    }
};

const MinefieldGrid: React.FC<MinefieldGridProps> = ({
    grid,
    currentCol,
    isAlive,
    isAnimating,
    selectedPath,
    onTileClick,
}) => {
    const visibleRange = useMemo(() => {
        const nextCol = currentCol + 1;
        let startCol: number;

        if (nextCol <= VISIBLE_COLS - 1) {
            startCol = 0;
        } else {
            startCol = nextCol - (VISIBLE_COLS - 1);
        }

        startCol = Math.min(startCol, GRID_COLS - VISIBLE_COLS);
        startCol = Math.max(0, startCol);

        const endCol = Math.min(startCol + VISIBLE_COLS, GRID_COLS);
        return { startCol, endCol };
    }, [currentCol]);

    const isOnPath = (row: number, col: number) =>
        selectedPath.some((p) => p.row === row && p.col === col);

    return (
        <div className="w-full flex justify-center">
            <div className="grid gap-2 sm:gap-2.5 w-full" style={{ gridTemplateColumns: `repeat(${VISIBLE_COLS}, 1fr)`, maxWidth: "460px" }}>
                {Array.from({ length: VISIBLE_COLS }).map((_, i) => {
                    const colIdx = visibleRange.startCol + i;
                    if (colIdx >= GRID_COLS) return null;

                    const isNextCol = colIdx === currentCol + 1 && isAlive;
                    const mult = colIdx > 0 ? STEP_MULTIPLIERS[colIdx - 1] : null;
                    const isStartCol = colIdx === 0;

                    return (
                        <div key={colIdx} className="flex flex-col gap-1.5 sm:gap-2">
                            <div className="text-center h-5">
                                {isStartCol ? (
                                    <span className="text-[10px] sm:text-xs font-mono tracking-[0.15em] uppercase text-cyan-400/60 font-semibold">
                                        Start
                                    </span>
                                ) : (
                                    <span className={`text-[10px] sm:text-xs font-mono font-bold ${
                                        colIdx <= currentCol
                                            ? "text-emerald-400/70"
                                            : isNextCol
                                                ? "text-cyan-300/80"
                                                : "text-white/30"
                                    }`}>
                                        {mult !== null ? `${mult}x` : `Col ${colIdx}`}
                                    </span>
                                )}
                            </div>

                            {Array.from({ length: GRID_ROWS }).map((_, rowIdx) => {
                                const tile = grid[colIdx]?.[rowIdx];
                                if (!tile) return null;

                                const isClickable =
                                    colIdx === currentCol + 1 &&
                                    isAlive &&
                                    !isAnimating &&
                                    tile.state === "hidden";

                                const onPath = isOnPath(rowIdx, colIdx);

                                return (
                                    <motion.button
                                        key={`${colIdx}-${rowIdx}`}
                                        layout
                                        onClick={() => isClickable && onTileClick(rowIdx, colIdx)}
                                        disabled={!isClickable}
                                        className={`
                                            relative
                                            w-full aspect-[1/0.85]
                                            rounded-lg
                                            border
                                            flex items-center justify-center
                                            transition-all duration-200
                                            backdrop-blur-sm
                                            disabled:cursor-default
                                            ${getTileColors(tile.state, isClickable, isStartCol)}
                                            ${onPath && tile.state === "safe" && !isStartCol
                                                ? "ring-1 ring-emerald-400/30"
                                                : ""}
                                            ${isClickable ? "active:scale-95" : ""}
                                        `}
                                        whileHover={isClickable ? { scale: 1.06 } : undefined}
                                        whileTap={isClickable ? { scale: 0.94 } : undefined}
                                    >
                                        <AnimatePresence mode="wait">
                                            <TileIcon
                                                key={tile.state}
                                                state={tile.state}
                                                isStartCol={isStartCol}
                                            />
                                        </AnimatePresence>

                                        {isClickable && (
                                            <motion.div
                                                className="absolute inset-0 rounded-lg border border-cyan-400/0"
                                                animate={{
                                                    borderColor: [
                                                        "rgba(14,165,233,0)",
                                                        "rgba(14,165,233,0.3)",
                                                        "rgba(14,165,233,0)",
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MinefieldGrid;
