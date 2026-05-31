"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    FROGLING_SPRITE_SHEETS,
    FroglingAnimationName,
    getFrogDisplayScale,
} from "./swampHopSprites";

interface SpriteSheetAnimationProps {
    animation: FroglingAnimationName;
    play?: boolean;
    restartKey?: string | number;
    className?: string;
    alt?: string;
}

const SpriteSheetAnimation: React.FC<SpriteSheetAnimationProps> = ({
    animation,
    play = true,
    restartKey,
    className,
    alt = "Frogling",
}) => {
    const sheet = FROGLING_SPRITE_SHEETS[animation];
    const [frameIndex, setFrameIndex] = useState(0);

    const displayScale = useMemo(
        () => getFrogDisplayScale(sheet.frameHeight),
        [sheet.frameHeight]
    );

    useEffect(() => {
        if (!play || sheet.frameCount <= 1) {
            return undefined;
        }

        const intervalMs = Math.max(
            16,
            Math.floor(1000 / Math.max(1, sheet.fps))
        );

        const intervalId = window.setInterval(() => {
            setFrameIndex((previous) => {
                const next = previous + 1;
                if (next >= sheet.frameCount) {
                    return sheet.loop ? 0 : previous;
                }
                return next;
            });
        }, intervalMs);

        return () => window.clearInterval(intervalId);
    }, [play, sheet.frameCount, sheet.fps, sheet.loop, animation, restartKey]);

    const offsetX = frameIndex * sheet.frameWidth * displayScale;
    const offsetY = sheet.rowY * displayScale;
    const displayWidth = sheet.frameWidth * displayScale;
    const displayHeight = sheet.frameHeight * displayScale;

    return (
        <div
            className={className}
            role="img"
            aria-label={alt}
            style={{
                width: displayWidth,
                height: displayHeight,
                backgroundImage: `url(${sheet.src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: `-${offsetX}px -${offsetY}px`,
                backgroundSize: `${sheet.sheetWidth * displayScale}px ${sheet.sheetHeight * displayScale}px`,
            }}
        />
    );
};

export default SpriteSheetAnimation;
