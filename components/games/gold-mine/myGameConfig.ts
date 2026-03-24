import { Game } from "@/lib/games";

export const myGame: Game = {
    title: "Gold Mine",
    description: "Dig to reveal hidden treasures in the 9x9 mine grid! Find gold nuggets to win, but watch out for dynamite - it destroys all gold in rows with 3+ gold pieces. Strike it rich with up to 100x multiplier!",
    gameAddress: "0x1234567890123456789012345678901234567890",
    gameBackground: "/submissions/gold-mine/background.svg",
    card: "/submissions/gold-mine/card.png",
    banner: "/submissions/gold-mine/banner.png",
    advanceToNextStateAsset: "/submissions/gold-mine/advance-button.svg",
    themeColorBackground: "#a16207",
    song: "/submissions/gold-mine/audio/song.mp3",
    payouts: {
        0: { 0: { 0: 0 } },
        10: { 0: { 0: 1.2 } },
        20: { 0: { 0: 2 } },
        30: { 0: { 0: 5 } },
        40: { 0: { 0: 10 } },
        50: { 0: { 0: 25 } },
        60: { 0: { 0: 50 } },
        70: { 0: { 0: 100 } },
    },
};