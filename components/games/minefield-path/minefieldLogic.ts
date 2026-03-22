export const GRID_ROWS = 5;
export const GRID_COLS = 51;
export const TOTAL_STEPS = GRID_COLS - 1;
export const MINES_PER_COLUMN = 2;

export type TileState = "hidden" | "safe" | "mine" | "exploded" | "revealed_mine";

export type GridTile = {
    row: number;
    col: number;
    isMine: boolean;
    state: TileState;
};

export type MinefieldState = {
    grid: GridTile[][];
    currentCol: number;
    isAlive: boolean;
    currentMultiplier: number;
    selectedPath: { row: number; col: number }[];
    isAnimating: boolean;
};

export function generateMultipliers(): number[] {
    const multipliers: number[] = [];
    for (let i = 0; i < TOTAL_STEPS; i++) {
        const raw = 0.5 + (i / (TOTAL_STEPS - 1)) * 11.5;
        multipliers.push(Math.round(raw * 100) / 100);
    }
    return multipliers;
}

export const STEP_MULTIPLIERS = generateMultipliers();

export function generateGrid(): GridTile[][] {
    const grid: GridTile[][] = [];
    const MAX_CONSECUTIVE_SAFE = 2;
    const consecutiveSafe = new Array(GRID_ROWS).fill(0);

    for (let col = 0; col < GRID_COLS; col++) {
        const column: GridTile[] = [];
        const mineRows = new Set<number>();

        if (col > 0) {
            const forcedMines: number[] = [];
            for (let r = 0; r < GRID_ROWS; r++) {
                if (consecutiveSafe[r] >= MAX_CONSECUTIVE_SAFE) {
                    forcedMines.push(r);
                }
            }

            for (const r of forcedMines) {
                mineRows.add(r);
            }

            if (mineRows.size < MINES_PER_COLUMN) {
                const available = [];
                for (let r = 0; r < GRID_ROWS; r++) {
                    if (!mineRows.has(r)) {
                        available.push(r);
                    }
                }

                while (mineRows.size < MINES_PER_COLUMN && available.length > 0) {
                    const idx = Math.floor(Math.random() * available.length);
                    mineRows.add(available[idx]);
                    available.splice(idx, 1);
                }
            }

            for (let r = 0; r < GRID_ROWS; r++) {
                if (mineRows.has(r)) {
                    consecutiveSafe[r] = 0;
                } else {
                    consecutiveSafe[r]++;
                }
            }
        }

        for (let row = 0; row < GRID_ROWS; row++) {
            column.push({
                row,
                col,
                isMine: mineRows.has(row),
                state: col === 0 ? "safe" : "hidden",
            });
        }
        grid.push(column);
    }

    return grid;
}

export function getInitialState(): MinefieldState {
    return {
        grid: generateGrid(),
        currentCol: 0,
        isAlive: true,
        currentMultiplier: 0,
        selectedPath: [],
        isAnimating: false,
    };
}

export function getMultiplierForStep(step: number): number {
    if (step < 1 || step > TOTAL_STEPS) return 0;
    return STEP_MULTIPLIERS[step - 1];
}
