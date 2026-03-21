import React from "react";
import Image from "next/image";
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
import { Info } from "lucide-react";
import { Game } from "@/lib/games";
import BetAmountInput from "@/components/shared/BetAmountInput";
import { CustomSlider } from "@/components/shared/CustomSlider";
import ChipSelection, { Chip } from "@/components/shared/ChipSelection";

interface MyGameSetupCardProps {
    game: Game;
    onPlay: () => void;
    onReveal: () => void;
    onRewatch: () => void;
    onReset: () => void;
    onPlayAgain: () => void;
    playAgainText?: string;
    currentView: 0 | 1 | 2;

    betAmount: number;
    setBetAmount: (amount: number) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    isLoading: boolean;
    payout: number | null;
    inReplayMode: boolean;

    account?: any;
    walletBalance: number;
    playerAddress?: string;
    isGamePaused?: boolean;
    profile?: any;
    minBet: number;
    maxBet: number;
}

const MyGameSetupCard: React.FC<MyGameSetupCardProps> = ({
    game,
    onPlay,
    onReveal,
    onRewatch,
    onReset,
    onPlayAgain,
    playAgainText = "Play Again",
    currentView,
    betAmount,
    setBetAmount,
    gridSize,
    setGridSize,
    isLoading,
    payout,
    inReplayMode,
    account = undefined,
    playerAddress = undefined,
    walletBalance,
    isGamePaused = false,
    profile = undefined,
    maxBet,
    minBet,
}) => {
    const themeColorBackground = game.themeColorBackground;
    // const themeColorText = game.themeColorText;

    const usdMode = false;

    // Demo chip data for this example game
    const chips: Chip[] = [
        { id: "1", value: 1, image: "/shared/chips/chip_1.png" },
        { id: "5", value: 5, image: "/shared/chips/chip_5.png" },
        { id: "10", value: 10, image: "/shared/chips/chip_10.png" },
        { id: "25", value: 25, image: "/shared/chips/chip_25.png" },
    ];

    const [selectedChipId, setSelectedChipId] = React.useState<string | null>(null);

    const getCurrentWalletAmount = (): number => {
        return walletBalance;
    };

    const getCurrentWalletAmountMinusReduction = (): number => {
        return walletBalance;
    };

    const getCurrentWalletAmountString = (): string => {
        return `${walletBalance.toFixed(2)} APE`;
    };


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
        return `${((betAmount || 0) * 100).toLocaleString([], {
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

    const canReplay = (): boolean => {
        if (!playerAddress) {
            return false;
        }
        if (!account) {
            return false;
        }
        if (inReplayMode) {
            return false;
        }
        return playerAddress.toLowerCase() === account.address.toLowerCase();
    };

    return (
        <Card className="lg:basis-1/3 p-6 flex flex-col">
            {currentView === 0 && (
                <>
                    <CardContent className="font-roboto">
                        {/* place your bet button - mobile */}
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

                        {/* bet amount */}
                        <div className="mt-5">
                            <BetAmountInput
                                min={0}
                                max={getCurrentWalletAmountMinusReduction()}
                                step={0.1}
                                value={betAmount}
                                onChange={setBetAmount}
                                balance={getCurrentWalletAmount()}
                                usdMode={usdMode}
                                setUsdMode={() => { }}
                                disabled={isLoading}
                                themeColorBackground={themeColorBackground}
                            />
                        </div>

                    </CardContent>

                    <div className="grow"></div>

                    <CardFooter className="mt-8 w-full flex flex-col font-roboto">
                        <div className="w-full flex flex-col items-center gap-2 font-medium text-xs text-[#91989C]">
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p>Max Payout (100x)</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info size={16} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Find 70+ gold nuggets in the 9x9 grid</p>
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

                    <div className="flex lg:flex-col justify-center items-center">
                        <div className="font-roboto flex flex-col items-center gap-3">
                            {game.advanceToNextStateAsset ? (
                                <button onClick={onReveal} className="w-full">
                                    <Image
                                        src={game.advanceToNextStateAsset}
                                        alt="Reveal Grid"
                                        width={196.5}
                                        height={179.82}
                                        className="transition-transform duration-100 ease-out active:scale-97 w-[109px] h-[100px] sm:w-[131px] sm:h-[120px] lg:w-[184px] lg:h-[168.35px]"
                                    />
                                </button>
                            ) : (
                                <Button
                                    onClick={onReveal}
                                    className="w-full"
                                    style={{
                                        backgroundColor: themeColorBackground,
                                        borderColor: themeColorBackground,
                                    }}
                                >
                                    Reveal Grid
                                </Button>
                            )}
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
