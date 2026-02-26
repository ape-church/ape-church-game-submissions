import React from 'react'

// Add one entry per approved game submission
// Key must match the game's folder name under components/games/
// and the gameName field in its metadata.json

import ExampleGameComponent from '@/components/games/example-game/ExampleGame'

const gameRegistry: Record<string, React.ComponentType> = {
    'example-game': ExampleGameComponent,
}

export { gameRegistry }
