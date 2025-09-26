export interface Tile {
    x: number;
    y: number;
}

export function calculateMovableTiles(
    startPosition: Tile,
    range: number,
): Tile[] {
    const tiles: Tile[] =[];
    const boardWidth = 12; // Assuming a fixed board width
    const boardHeight = 12; // Assuming a fixed board height

    for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
            // This is Manhattan distance calculation
            if (Math.abs(x) + Math.abs(y) <= range) {
                const newX = startPosition.x + x;
                const newY = startPosition.y + y;

                // Check if the tile is within board boundaries
                if (newX >= 0 && newX < boardWidth && newY >= 0 && newY < boardHeight) {
                    tiles.push({ x: newX, y: newY });
                }
            }
        }
    }
    return tiles;
}
