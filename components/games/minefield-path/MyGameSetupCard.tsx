import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, LogOut } from "lucide-react";
import { Game } from "@/lib/games";
import BetAmountInput from "@/components/shared/BetAmountInput";
import { STEP_MULTIPLIERS, TOTAL_STEPS } from "./minefieldLogic";

interface MyGameSetupCardProps {
    game: Game;
    onPlay: () => void;
    onCashOut: () => void;
    onRewatch: () => void;
    onReset: () => void;
    onPlayAgain: () => void;
    playAgainText?: string;
    currentView: 0 | 1 | 2;

    betAmount: number;
    setBetAmount: (amount: number) => void;
    isLoading: boolean;
    payout: number | null;
    inReplayMode: boolean;
    currentMultiplier: number;
    stepsDone: number;
    isAlive: boolean;

    account?: unknown;
    walletBalance: number;
    playerAddress?: string;
    isGamePaused?: boolean;
    profile?: unknown;
    minBet: number;
    maxBet: number;
}

const MyGameSetupCard: React.FC<MyGameSetupCardProps> = ({
    game,
    onPlay,
    onCashOut,
    onRewatch,
    onReset,
    onPlayAgain,
    playAgainText = "Play Again",
    currentView,
    betAmount,
    setBetAmount,
    isLoading,
    payout,
    inReplayMode,
    currentMultiplier,
    stepsDone,
    isAlive,
    walletBalance,
    isGamePaused = false,
    maxBet,
}) => {
    const themeColorBackground = game.themeColorBackground;
    const usdMode = false;

    const getCurrentWalletAmount = (): number => walletBalance;
    const getCurrentWalletAmountMinusReduction = (): number => walletBalance;
    const getCurrentWalletAmountString = (): string => `${walletBalance.toFixed(2)} APE`;

    const getBetAmountText = (): string => {
        return `${(betAmount || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getTotalPayoutText = (): string => {
        return `${(payout || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getMaxPayoutString = (): string => {
        return `${((betAmount || 0) * STEP_MULTIPLIERS[TOTAL_STEPS - 1]).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const getCashOutText = (): string => {
        const amount = betAmount * currentMultiplier;
        return `${amount.toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;
    };

    const ShowInUsdAndStats = (invertOnDesktop: boolean) => {
        const showGreenText = (payout || 0) > (betAmount || 0);

        return (
            <div
                className={`${invertOnDesktop ? "flex-col-reverse lg:flex-col" : "flex-col"
                    } font-roboto flex gap-12 lg:gap-8`}
            >
                {inReplayMode && (
                    <p
                        className="mt-2 font-semibold text-3xl sm:text-3xl text-center"
                        style={{ color: themeColorBackground }}
                    >
                        Replay Mode
                    </p>
                )}

                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-foreground text-lg font-semibold">
                            Show Bets in USD
                        </p>
                        <p className="text-sm">
                            Your bets are valued in {usdMode ? "US Dollars" : "APE"}
                        </p>
                    </div>
                    <Switch
                        checked={usdMode}
                        onCheckedChange={() => {}}
                        aria-readonly
                    />
                </div>

                <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Bet Amount</p>
                        <p className="text-right">{getBetAmountText()}</p>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Current Multiplier</p>
                        <p className={`text-right ${currentMultiplier > 0 ? "text-emerald-400" : ""}`}>
                            {currentMultiplier > 0 ? `${currentMultiplier}x` : "—"}
                        </p>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Payout</p>
                        <p className={`text-right ${showGreenText ? "text-success" : ""}`}>
                            {getTotalPayoutText()}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const ShowInUsdAndStatsFinalView = (invertOnDesktop: boolean) => {
        const showGreenText = (payout || 0) > (betAmount || 0);

        return (
            <div
                className={`${invertOnDesktop ? "flex-col-reverse lg:flex-col" : "flex-col"
                    } font-roboto flex gap-12 lg:gap-8`}
            >
                {inReplayMode && (
                    <p
                        className="mt-2 font-semibold text-3xl sm:text-3xl text-center"
                        style={{ color: themeColorBackground }}
                    >
                        Replay Mode
                    </p>
                )}

                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-foreground text-lg font-semibold">
                            Show Bets in USD
                        </p>
                        <p className="text-sm">Your bets are valued in US Dollars</p>
                    </div>
                    <Switch
                        checked={usdMode}
                        onCheckedChange={() => {}}
                        aria-readonly
                    />
                </div>

                <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Bet Amount</p>
                        <p className="text-right">{getBetAmountText()}</p>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Total Payout</p>
                        <p className={`text-right ${showGreenText ? "text-success" : ""}`}>
                            {getTotalPayoutText()}
                        </p>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2">
                        <p>Wallet Balance</p>
                        <p className="text-right">{getCurrentWalletAmountString()}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="lg:basis-1/3 p-6 flex flex-col">
            {currentView === 0 && (
                <>
                    <CardContent className="font-roboto">
                        <Button
                            onClick={onPlay}
                            className="lg:hidden w-full"
                            style={{
                                backgroundColor: themeColorBackground,
                                borderColor: themeColorBackground,
                            }}
                            disabled={betAmount === null || betAmount <= 0 || isGamePaused}
                        >
                            Place Your Bet
                        </Button>

                        <div className="mt-5">
                            <BetAmountInput
                                min={0}
                                max={getCurrentWalletAmountMinusReduction()}
                                step={0.1}
                                value={betAmount}
                                onChange={setBetAmount}
                                balance={getCurrentWalletAmount()}
                                usdMode={usdMode}
                                setUsdMode={() => {}}
                                disabled={isLoading}
                                themeColorBackground={themeColorBackground}
                            />
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <p className="text-xs font-semibold text-[#91989C] uppercase tracking-wider">
                                Payout Range
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {[0, 12, 24, TOTAL_STEPS - 1].map((idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-white/[0.04] border border-white/[0.08]"
                                    >
                                        <span className="text-[10px] font-mono text-white/40">
                                            Step {idx + 1}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-cyan-400">
                                            {STEP_MULTIPLIERS[idx]}x
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-mono text-white/30 text-center">
                                {TOTAL_STEPS} steps total — multiplier scales from {STEP_MULTIPLIERS[0]}x to {STEP_MULTIPLIERS[TOTAL_STEPS - 1]}x
                            </p>
                        </div>
                    </CardContent>

                    <div className="grow"></div>

                    <CardFooter className="mt-8 w-full flex flex-col font-roboto">
                        <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Max Payout ({STEP_MULTIPLIERS[TOTAL_STEPS - 1]}x)</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={16} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Clear all {TOTAL_STEPS} columns to earn {STEP_MULTIPLIERS[TOTAL_STEPS - 1]}x your bet</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-right">{getMaxPayoutString()}</p>
                            </div>
                            <div className="w-full flex justify-between items-center gap-2">
                                <p>Max Bet Per Game</p>
                                <p className="text-right">
                                    {maxBet.toLocaleString([], { maximumFractionDigits: 0 })} APE
                                </p>
                            </div>
                            <div className="w-full flex justify-between items-center gap-2">
                                <p>Mines Per Column</p>
                                <p className="text-right">2</p>
                            </div>
                        </div>

                        <Button
                            onClick={onPlay}
                            className="hidden lg:flex mt-6 w-full"
                            style={{
                                backgroundColor: themeColorBackground,
                                borderColor: themeColorBackground,
                            }}
                            disabled={betAmount === null || betAmount <= 0 || isGamePaused}
                        >
                            Place Your Bet
                        </Button>
                    </CardFooter>
                </>
            )}
            {currentView === 1 && (
                <CardContent className="grow font-roboto flex flex-col-reverse lg:flex-col lg:justify-between gap-8">
                    {ShowInUsdAndStats(true)}

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full flex flex-col items-center gap-2">
                            {isAlive && stepsDone > 0 && stepsDone < TOTAL_STEPS && (
                                <>
                                    <p className="text-xs text-[#91989C] font-mono">
                                        Cash out now for {getCashOutText()}
                                    </p>
                                    <Button
                                        onClick={onCashOut}
                                        className="w-full gap-2"
                                        style={{
                                            backgroundColor: "#10b981",
                                            borderColor: "#10b981",
                                        }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Cash Out ({currentMultiplier}x)
                                    </Button>
                                </>
                            )}

                            {isAlive && stepsDone === 0 && (
                                <p className="text-sm text-cyan-300/60 font-mono text-center">
                                    Pick a tile in column 1 to begin
                                </p>
                            )}

                            {isAlive && stepsDone >= TOTAL_STEPS && (
                                <p className="text-sm text-emerald-400 font-mono text-center font-bold">
                                    You cleared the field!
                                </p>
                            )}
                        </div>

                        <div className="w-full">
                            <div className="flex justify-between items-center text-[10px] font-mono text-white/30 mb-1">
                                <span>Progress</span>
                                <span>{stepsDone}/{TOTAL_STEPS}</span>
                            </div>
                            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${(stepsDone / TOTAL_STEPS) * 100}%`,
                                        backgroundColor: isAlive ? "#10b981" : "#ef4444",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
            {currentView === 2 && (
                <CardContent className="grow font-roboto flex flex-col lg:justify-between gap-8">
                    <div className="lg:hidden">
                        <Button
                            className="w-full"
                            style={{
                                backgroundColor: themeColorBackground,
                                borderColor: themeColorBackground,
                            }}
                            onClick={onPlayAgain}
                            disabled={isGamePaused}
                        >
                            {playAgainText}
                        </Button>

                        <Button
                            className="w-full mt-3"
                            variant="secondary"
                            onClick={onReset}
                        >
                            Change Bet
                        </Button>
                    </div>

                    {ShowInUsdAndStatsFinalView(false)}

                    <CardFooter className="w-full hidden lg:block">
                        <div className="w-full flex flex-col gap-4">
                            <Button
                                className="w-full"
                                style={{
                                    backgroundColor: themeColorBackground,
                                    borderColor: themeColorBackground,
                                }}
                                onClick={onPlayAgain}
                                disabled={isGamePaused}
                            >
                                {playAgainText}
                            </Button>

                            <Button
                                className="w-full"
                                variant="secondary"
                                onClick={onReset}
                            >
                                Change Bet
                            </Button>
                        </div>
                    </CardFooter>
                </CardContent>
            )}
        </Card>
    );
};

export default MyGameSetupCard;
