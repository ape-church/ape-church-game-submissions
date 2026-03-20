"use client";

import React, { useState } from "react";
import { CircleHelp } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

interface StatTooltipProps {
  label: string;
  content: React.ReactNode;
}

const StatTooltip: React.FC<StatTooltipProps> = ({ label, content }) => (
  <div className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.08em] text-[rgba(255,218,184,0.58)]">
    <span className="leading-none">{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Explain ${label.toLowerCase()}`}
          className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[#ffcf8f]/60 transition-colors hover:text-[#ffdca9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9f5a]/70"
        >
          <CircleHelp className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[220px] rounded-[10px] border border-[#6a473a] bg-[#1e1518]/95 px-3 py-2 text-[11px] leading-relaxed text-[#fff1d6] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  </div>
);

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
  const estimatedJackpotMultiplier = predictedMultiplier + 2.5;
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
            className={`rounded-[8px] border px-2 py-2 text-xs font-semibold transition-colors ${threshold === preset
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
          <strong>{predictedMultiplier.toFixed(3)}x</strong>
        </div>
        <div className="punch-machine-stat">
          <StatTooltip
            label="Jackpot Multiplier"
            content={
              <>
                Hitting exactly <strong>999</strong> adds an extra <strong>2.5x</strong> to
                your payout. It happens roughly <strong>1 in 500</strong> rounds.
              </>
            }
          />
          <strong>{estimatedJackpotMultiplier.toFixed(3)}x</strong>
        </div>
        <div className="punch-machine-stat">
          <StatTooltip
            label="Win chance"
            content={
              <>
                Each round generates <strong>two</strong> random numbers and uses the{" "}
                <strong>higher</strong> result. Your win chance is based on that boosted final
                number, not a single roll.
              </>
            }
          />
          <strong>{winChance.toFixed(2)}%</strong>
        </div>
        <div className="punch-machine-stat">
          <span>Projected payout</span>
          <strong>{estimatedPayout.toFixed(2)} APE</strong>
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