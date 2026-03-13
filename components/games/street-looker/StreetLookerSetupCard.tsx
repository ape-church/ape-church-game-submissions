"use client";

import React, { useState } from "react";
import BetAmountInput from "@/components/shared/BetAmountInput";
import { CustomSlider } from "@/components/shared/CustomSlider";
import {
  getPayoutForRound,
  getMultiplierForThreshold,
  getWinChanceForThreshold,
  MACHINE_THEME,
  PUNCH_MACHINE_LIMITS,
  ResolvedPunchRound,
  THRESHOLD_PRESETS,
} from "./streetLookerGameConfig";
import { Card } from "../ui/card";

interface MyGameSetupCardProps {
  currentView: 0 | 1 | 2;
  betAmount: number;
  threshold: number;
  payout: number | null;
  walletBalance: number;
  isLoading: boolean;
  lastRound: ResolvedPunchRound | null;
  onBetAmountChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onPlay: () => void;
  onReset: () => void;
  onPlayAgain: () => void;
  onRewatch: () => void;
}

const MyGameSetupCard: React.FC<MyGameSetupCardProps> = ({
  currentView,
  betAmount,
  threshold,
  payout,
  walletBalance,
  isLoading,
  lastRound,
  onBetAmountChange,
  onThresholdChange,
  onPlay,
  onReset,
  onPlayAgain,
  onRewatch,
}) => {
  const [usdMode, setUsdMode] = useState(false);
  const predictedMultiplier = getMultiplierForThreshold(threshold);
  const estimatedPayout = getPayoutForRound(betAmount, threshold);
  const winChance = getWinChanceForThreshold(threshold) * 100;

  return (
    <Card className="punch-machine-setup lg:h-full lg:flex-1">
      <BetAmountInput
        min={PUNCH_MACHINE_LIMITS.minBet}
        max={Math.min(PUNCH_MACHINE_LIMITS.maxBet, walletBalance)}
        step={1}
        value={betAmount}
        onChange={onBetAmountChange}
        balance={walletBalance}
        disabled={isLoading || currentView === 1}
        usdMode={usdMode}
        setUsdMode={setUsdMode}
        themeColorBackground={MACHINE_THEME.accent}
      />

      <CustomSlider
        label="Target Number"
        min={PUNCH_MACHINE_LIMITS.minThreshold}
        max={PUNCH_MACHINE_LIMITS.maxThreshold}
        step={1}
        value={threshold}
        onChange={onThresholdChange}
        presets={THRESHOLD_PRESETS}
        themeColor={MACHINE_THEME.accent}
        disabled={isLoading || currentView === 1}
      />

      <div className="hidden md:grid md:grid-cols-5 md:gap-2">
        {THRESHOLD_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onThresholdChange(preset)}
            disabled={isLoading || currentView === 1}
            className={`rounded-[8px] border px-2 py-2 text-xs font-semibold transition-colors ${
              threshold === preset
                ? "border-[#ff9f5a] bg-[#ef4f34] text-white"
                : "border-[#5d4339] bg-white/5 text-[#f6dec0] hover:bg-white/10"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="punch-machine-grid">
        <div className="punch-machine-stat">
          <span>Payout multiplier</span>
          <strong>{predictedMultiplier.toFixed(4)}x</strong>
        </div>
        <div className="punch-machine-stat">
          <span>Projected payout</span>
          <strong>{estimatedPayout.toFixed(3)} APE</strong>
        </div>
        <div className="punch-machine-stat">
          <span>Win chance</span>
          <strong>{winChance.toFixed(2)}%</strong>
        </div>
        <div className="punch-machine-stat">
          <span>Last payout</span>
          <strong>{payout == null ? "--" : `${payout.toFixed(3)} APE`}</strong>
        </div>
      </div>

      <button
        type="button"
        className="punch-machine-setup-action order-first lg:order-last lg:mt-auto"
        onClick={onPlay}
        disabled={isLoading || currentView === 1}
      >
        {isLoading ? "Reading Machine..." : "Start Punch"}
      </button>

      {/* {currentView !== 0 && (
        <div className="punch-machine-setup-secondary">
          <button type="button" className="punch-machine-ghost-button" onClick={onReset}>
            Reset
          </button>
          <button
            type="button"
            className="punch-machine-ghost-button"
            onClick={onPlayAgain}
            disabled={isLoading || currentView === 1}
          >
            Play Again
          </button>
          <button
            type="button"
            className="punch-machine-ghost-button"
            onClick={onRewatch}
            disabled={lastRound == null || isLoading}
          >
            Rewatch
          </button>
        </div>
      )} */}

      {/* <p className="punch-machine-note">
        Two scores are sampled from the same random word and the higher one is used.
        You win when that final score meets or beats your chosen target.
      </p> */}
    </Card>
  );
};

export default MyGameSetupCard;
