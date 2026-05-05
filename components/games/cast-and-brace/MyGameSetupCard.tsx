import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { Game } from "@/lib/games";
import BetAmountInput from "@/components/shared/BetAmountInput";
import CastsSlider from "./CastsSlider";
import {
    clampCastsPerSession,
    MY_GAME_MAX_CASTS_PER_SESSION,
    MY_GAME_MIN_CASTS_PER_SESSION,
    type FishPlatformResult,
    type FishingPhase,
} from "./myGameConfig";
import {
    formatChartMultiplier,
    resolveOutcomeFromPlatform,
} from "./config/outcomeResolve";

interface MyGameSetupCardProps {
    game: Game;
    onPlay: () => void;
    onAdvance: () => void;
    onRewatch: () => void;
    onReset: () => void;
    onPlayAgain: () => void;
    playAgainText?: string;
    currentView: 0 | 1 | 2;

    betAmount: number;
    setBetAmount: (amount: number) => void;
    castsPerSession: number;
    setCastsPerSession: (n: number) => void;
    /** Total stake for the last finished session (bet × casts); used for endgame ROI. */
    sessionTotalStakeApe: number | null;
    isLoading: boolean;
    payout: number | null;
    fishingPhase: FishingPhase;
    platformResult: FishPlatformResult | null;
    /** Bet locked when a round settled; used for catch stats on rewatch. */
    settledBetAmount: number | null;
    inReplayMode: boolean;

    walletBalance: number;
    minBet: number;
    maxBet: number;
}

const JACKPOT_INFO =
    "Best catch pays up to the jackpot multiplier on your bet (house rules).";

const MyGameSetupCard: React.FC<MyGameSetupCardProps> = ({
    game,
    currentView,
    betAmount,
    setBetAmount,
    castsPerSession,
    setCastsPerSession,
    sessionTotalStakeApe,
    isLoading,
    payout,
    platformResult: _platformResult,
    settledBetAmount,
    inReplayMode,
    walletBalance,
    maxBet,
    minBet,
}) => {
    const wagerForCatchStats =
        settledBetAmount ?? betAmount;
    const stakeForEndgameRatio =
        sessionTotalStakeApe != null && sessionTotalStakeApe > 0
            ? sessionTotalStakeApe
            : wagerForCatchStats;

    const endgameMultiplier =
        currentView === 2 && payout !== null
            ? _platformResult?.payoutMultiplier != null &&
              Number.isFinite(_platformResult.payoutMultiplier)
                ? _platformResult.payoutMultiplier
                : stakeForEndgameRatio > 0
                  ? payout / stakeForEndgameRatio
                  : 0
            : null;
    const endgameOutcome =
        endgameMultiplier !== null
            ? resolveOutcomeFromPlatform(
                  endgameMultiplier,
                  _platformResult?.payoutIndex ?? 0,
              )
            : null;

    const themeColorBackground = game.themeColorBackground;
    const usdMode = false;

    const getCurrentWalletAmount = (): number => walletBalance;

    const getCurrentWalletAmountMinusReduction = (): number => walletBalance;

    const getCurrentWalletAmountString = (): string =>
        `${walletBalance.toFixed(2)} APE`;

    const lockedCasts = clampCastsPerSession(castsPerSession);
    const totalBetAmount = (betAmount || 0) * lockedCasts;

    const getBetAmountText = (): string =>
        `${(betAmount || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;

    const formatApe = (n: number): string =>
        `${(n || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;

    const getTotalPayoutText = (): string =>
        `${(payout || 0).toLocaleString([], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        })} APE`;

    const StatsBlock = (opts: { showWallet?: boolean }) => {
        const showGreen = (payout || 0) > (betAmount || 0);
        return (
            <div className="font-roboto flex flex-col gap-8">
                {inReplayMode && (
                    <p
                        className="mt-2 text-center text-3xl font-semibold sm:text-3xl"
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
                            Your bets are valued in{" "}
                            {usdMode ? "US Dollars" : "APE"}
                        </p>
                    </div>
                    <Switch checked={usdMode} onCheckedChange={() => {}} aria-readonly />
                </div>
                <div className="flex w-full flex-col items-center gap-2 text-xs font-medium text-[#91989C]">
                    <div className="flex w-full items-center justify-between gap-2">
                        <p>Bet</p>
                        <p className="text-right">{getBetAmountText()}</p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <p>Payout</p>
                        <p
                            className={`text-right ${showGreen ? "text-success" : ""}`}
                        >
                            {getTotalPayoutText()}
                        </p>
                    </div>
                    {opts.showWallet && (
                        <div className="flex w-full items-center justify-between gap-2">
                            <p>Wallet Balance</p>
                            <p className="text-right">
                                {getCurrentWalletAmountString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="flex h-full min-h-0 w-full flex-col p-4 sm:p-6">
            {currentView === 0 && (
                <>
                    <CardContent className="font-roboto">
                        <div className="mt-0">
                            <BetAmountInput
                                min={0}
                                max={Math.max(
                                    0,
                                    Math.min(
                                        getCurrentWalletAmountMinusReduction(),
                                        maxBet * lockedCasts,
                                    ),
                                )}
                                step={0.1}
                                value={totalBetAmount}
                                onChange={(total) => {
                                    if (lockedCasts < 1) {
                                        return;
                                    }
                                    if (!Number.isFinite(total) || total <= 0) {
                                        setBetAmount(0);
                                        return;
                                    }
                                    const per = total / lockedCasts;
                                    const rounded = Number(per.toFixed(5));
                                    setBetAmount(
                                        Math.min(
                                            maxBet,
                                            Math.max(minBet, rounded),
                                        ),
                                    );
                                }}
                                balance={getCurrentWalletAmount()}
                                usdMode={usdMode}
                                setUsdMode={() => {}}
                                disabled={isLoading}
                                themeColorBackground={themeColorBackground}
                            />
                            <p className="mt-2 text-center text-xs font-medium leading-snug text-[#91989C]">
                                {formatApe(betAmount || 0)} per cast ×{" "}
                                {lockedCasts}{" "}
                                {lockedCasts === 1 ? "cast" : "casts"}
                            </p>
                        </div>

                        <CastsSlider
                            min={MY_GAME_MIN_CASTS_PER_SESSION}
                            max={MY_GAME_MAX_CASTS_PER_SESSION}
                            value={lockedCasts}
                            onChange={(n) =>
                                setCastsPerSession(clampCastsPerSession(n))
                            }
                            disabled={isLoading}
                            themeColorBackground={themeColorBackground}
                            label="Casts per session"
                            hint={
                                <>
                                    Up to {MY_GAME_MAX_CASTS_PER_SESSION} casts
                                    in one run. Total stake{" "}
                                    {formatApe(totalBetAmount)}
                                </>
                            }
                        />
                    </CardContent>

                    <div className="grow" />

                    <CardFooter className="mt-6 flex w-full flex-col font-roboto">
                        <div className="flex w-full flex-col items-center gap-2 text-xs font-medium text-[#91989C]">
                            <div className="flex w-full items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Max payout note</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={16} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{JACKPOT_INFO}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-between gap-2">
                                <p>Max Bet</p>
                                <p className="text-right">
                                    {maxBet.toLocaleString([], {
                                        maximumFractionDigits: 0,
                                    })}{" "}
                                    APE
                                </p>
                            </div>
                        </div>
                    </CardFooter>
                </>
            )}

            {currentView === 1 && (
                <CardContent className="flex grow flex-col gap-4 py-6 font-roboto">
                    {StatsBlock({})}
                </CardContent>
            )}

            {currentView === 2 && (
                <CardContent className="flex min-h-0 grow flex-col gap-4 overflow-y-auto font-roboto sm:gap-8 lg:justify-between">
                    {StatsBlock({ showWallet: true })}

                    <div className="text-center">
                        <p className="text-base text-[#91989C] sm:text-lg">
                            Catch
                        </p>
                        <p
                            className="mt-1 text-pretty text-xl font-semibold sm:text-2xl"
                            style={{ color: themeColorBackground }}
                        >
                            {endgameOutcome !== null
                                ? endgameOutcome.displayName
                                : "—"}
                        </p>
                        {endgameOutcome !== null && (
                            <p className="mt-1 text-xs font-medium leading-snug text-[#91989C] sm:text-sm">
                                {endgameOutcome.tier} · {endgameOutcome.type}
                            </p>
                        )}
                        {endgameOutcome !== null && (
                            <p className="mt-2 font-nohemia text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                                {formatChartMultiplier(
                                    endgameOutcome.multiplier,
                                )}
                            </p>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default MyGameSetupCard;
