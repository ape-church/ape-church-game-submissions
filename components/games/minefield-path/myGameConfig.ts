import { Game } from "@/lib/games";

export const myGame: Game = {
    title: "Minefield Path",
    description: "Navigate a 50-column minefield from left to right. Pick one tile per column — avoid the mines! Cash out anytime or push deeper for payouts up to 12x.",
    gameAddress: "0x1234567890123456789012345678901234567890",
    gameBackground: "/my-game/background.svg",
    card: "/my-game/card.png",
    banner: "/my-game/banner.png",
    themeColorBackground: "#0ea5e9",
    song: "/my-game/audio/song.mp3",
    payouts: {
        1: { 0: { 0: 0.5 } },
        25: { 0: { 0: 6 } },
        50: { 0: { 0: 12 } },
    },
};
