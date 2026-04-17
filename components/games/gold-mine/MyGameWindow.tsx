"use client";

import React from "react";
import useSound from 'use-sound';
import { Game } from "@/lib/games";
import { Pickaxe, Coins, Bomb, X } from "lucide-react";

interface MyGameWindowProps {
    game: Game;
    gridValues: ('hidden' | 'gold' | 'rock' | 'dynamite' | 'destroyed')[];
    isRevealing: boolean;
    gridSize: number;
}

const MyGameWindow: React.FC<MyGameWindowProps> = ({
    game,
    gridValues,
    isRevealing,
    gridSize,
}) => {
    const muteSfx = false;
    const sfxVolume = 0.5;

    const [winSFX] = useSound('/submissions/gold-mine/sfx/win.mp3', {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true
    });
    const [loseSFX] = useSound('/submissions/gold-mine/sfx/lose.mp3', {
        volume: sfxVolume,
        soundEnabled: !muteSfx,
        interrupt: true
    });

    return (
        <div className="absolute inset-0 z-0 flex flex-col items-center text-white overflow-y-auto">
            <div className="relative w-full flex-1 flex items-start justify-center p-4 sm:p-8 pt-8 sm:pt-12 pb-8 sm:pb-12">
                <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
                    <div className="text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-200 mb-2 drop-shadow-lg">
                            Gold Mine
                        </h2>
                        <p className="text-xs sm:text-sm text-amber-100/80">
                            Dig to reveal hidden treasures!
                        </p>
                    </div>

                    <div
                        className="grid gap-0.5 sm:gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                        }}
                    >
                        {gridValues.map((value, index) => {
                            const isRevealed = value !== 'hidden';
                            const isGold = value === 'gold';
                            const isDynamite = value === 'dynamite';
                            const isDestroyed = value === 'destroyed';

                            return (
                                <div
                                    key={index}
                                    className={`
                                        w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
                                        rounded flex items-center justify-center
                                        transition-all duration-300
                                        ${!isRevealed
                                            ? 'bg-gradient-to-br from-stone-700 to-stone-900 shadow-sm'
                                            : isGold
                                            ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-md shadow-yellow-500/30'
                                            : isDynamite
                                            ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-500/30'
                                            : isDestroyed
                                            ? 'bg-gradient-to-br from-red-900 to-black shadow-md'
                                            : 'bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm'
                                        }
                                        border
                                        ${!isRevealed
                                            ? 'border-stone-600'
                                            : isGold
                                            ? 'border-yellow-300'
                                            : isDynamite
                                            ? 'border-red-400'
                                            : isDestroyed
                                            ? 'border-red-800'
                                            : 'border-gray-700'
                                        }
                                    `}
                                >
                                    {!isRevealed ? (
                                        <div className="text-stone-400">
                                            <Pickaxe className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                        </div>
                                    ) : isGold ? (
                                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-200" />
                                    ) : isDynamite ? (
                                        <Bomb className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-100" />
                                    ) : isDestroyed ? (
                                        <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-400" />
                                    ) : (
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-gray-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center text-amber-100/70 text-xs sm:text-sm space-y-0.5 bg-black/30 p-3 rounded-lg">
                        <p className="text-red-300 font-semibold mb-1">Dynamite destroys 3+ gold in same row!</p>
                        <p>10+ gold = 1.2x</p>
                        <p>20+ gold = 2x</p>
                        <p>30+ gold = 5x</p>
                        <p>40+ gold = 10x</p>
                        <p>50+ gold = 25x</p>
                        <p>60+ gold = 50x</p>
                        <p>70+ gold = 100x</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyGameWindow;
