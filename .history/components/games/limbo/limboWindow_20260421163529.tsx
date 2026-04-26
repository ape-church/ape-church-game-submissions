"use client";

import React from "react";

interface RecentMultiplierResult {
    id: number;
    multiplier: number;
    isWin: boolean;
}

interface MyGameWindowProps {
    recentMultipliers: RecentMultiplierResult[];
    currentMultiplier: number;
    isRolling: boolean;
    isWin: boolean | null;
    targetMultiplier: number;
    winChance: number;
    onTargetMultiplierChange: (value: number) => void;
    onWinChanceChange: (value: number) => void;
}

const formatMultiplier = (value: number) => `${value.toFixed(2)}x`;
const HISTORY_CARD_SLOT_WIDTH = 92;

const MyGameWindow: React.FC<MyGameWindowProps> = ({
    recentMultipliers,
    currentMultiplier,
    isRolling,
    isWin,
    targetMultiplier,
    winChance,
    onTargetMultiplierChange,
    onWinChanceChange,
}) => {
    const [historyShiftOffset, setHistoryShiftOffset] = React.useState(0);
    const [isHistoryAnimating, setIsHistoryAnimating] = React.useState(false);

    const [targetInputValue, setTargetInputValue] = React.useState(String(targetMultiplier));
    const [winChanceInputValue, setWinChanceInputValue] = React.useState(String(winChance));

    // Sync display when parent commits a new value (e.g. after a round resolves)
    React.useEffect(() => {
        setTargetInputValue(String(targetMultiplier));
    }, [targetMultiplier]);
    React.useEffect(() => {
        setWinChanceInputValue(String(winChance));
    }, [winChance]);

    const latestHistoryId = recentMultipliers.length > 0 ? recentMultipliers[recentMultipliers.length - 1].id : -1;
    const previousLatestHistoryIdRef = React.useRef(latestHistoryId);
    const visibleHistory = recentMultipliers.slice(-12);

    React.useEffect(() => {
        if (latestHistoryId !== previousLatestHistoryIdRef.current) {
            previousLatestHistoryIdRef.current = latestHistoryId;
            setIsHistoryAnimating(false);
            setHistoryShiftOffset(HISTORY_CARD_SLOT_WIDTH);
            let frameId2 = 0;
            const frameId1 = requestAnimationFrame(() => {
                frameId2 = requestAnimationFrame(() => {
                    setIsHistoryAnimating(true);
                    setHistoryShiftOffset(0);
                });
            });
            return () => {
                cancelAnimationFrame(frameId1);
                if (frameId2) {
                    cancelAnimationFrame(frameId2);
                }
            };
        }
        previousLatestHistoryIdRef.current = latestHistoryId;
    }, [latestHistoryId]);

    return (
        <div className="limbo-root">
            <div className="limbo-history-strip-wrap">
                <div
                    className={`limbo-history-strip ${isHistoryAnimating ? "limbo-history-strip-animating" : ""}`}
                    style={{ transform: `translateX(${historyShiftOffset}px)` }}
                >
                {visibleHistory.map((entry) => (
                    <div
                        key={`limbo-history-${entry.id}`}
                        className={`limbo-history-pill ${entry.isWin ? "limbo-history-pill-win" : "limbo-history-pill-loss"}`}
                    >
                        {formatMultiplier(entry.multiplier)}
                    </div>
                ))}
                </div>
            </div>

            <div className="limbo-center-stage">
                <p
                    className={`limbo-main-multiplier ${
                        isRolling ? "limbo-main-multiplier-rolling" : isWin === true ? "limbo-main-multiplier-win" : "limbo-main-multiplier-loss"
                    }`}
                >
                    {formatMultiplier(currentMultiplier)}
                </p>
            </div>

            <div className="limbo-bottom-panel">
                <div className="limbo-input-card">
                    <label className="limbo-input-label">Target Multiplier</label>
                    <div className="limbo-input-wrap">
                        <input
                            type="number"
                            min={1.01}
                            step={0.01}
                            value={targetInputValue}
                            onChange={(event) => setTargetInputValue(event.target.value)}
                            onBlur={() => {
                                const parsed = Number(targetInputValue);
                                onTargetMultiplierChange(parsed || 1.01);
                            }}
                            className="limbo-input"
                        />
                        <span className="limbo-input-suffix">x</span>
                    </div>
                </div>

                <div className="limbo-input-card">
                    <label className="limbo-input-label">Win Chance</label>
                    <div className="limbo-input-wrap">
                        <input
                            type="number"
                            min={0.01}
                            max={98}
                            step={0.00000001}
                            value={winChanceInputValue}
                            onChange={(event) => setWinChanceInputValue(event.target.value)}
                            onBlur={() => {
                                const parsed = Number(winChanceInputValue);
                                onWinChanceChange(parsed || 0.01);
                            }}
                            className="limbo-input"
                        />
                        <span className="limbo-input-suffix">%</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MyGameWindow;
