// World - 2D grid managing creatures and barriers

import { PheromoneLayer } from '../pheromones/PheromoneLayer.js';

export class World {
    constructor(width, height, config) {
        this.width = width;
        this.height = height;
        this.config = config;

        // Grid: null = empty, creature reference, or 'barrier'
        this.grid = Array(height).fill(null).map(() => Array(width).fill(null));

        // Pheromone layer
        this.pheromoneLayer = new PheromoneLayer(width, height);

        // Barriers
        this.barriers = [];
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isBarrier(x, y) {
        if (!this.isInBounds(x, y)) return true;
        return this.grid[y][x] === 'barrier';
    }

    getCreatureAt(x, y) {
        if (!this.isInBounds(x, y)) return null;
        const cell = this.grid[y][x];
        return (cell && cell !== 'barrier') ? cell : null;
    }

    placeCreature(creature) {
        if (this.isInBounds(creature.x, creature.y)) {
            this.grid[creature.y][creature.x] = creature;
        }
    }

    removeCreature(creature) {
        if (this.isInBounds(creature.x, creature.y)) {
            if (this.grid[creature.y][creature.x] === creature) {
                this.grid[creature.y][creature.x] = null;
            }
        }
    }

    placeBarrier(x, y) {
        if (this.isInBounds(x, y)) {
            this.grid[y][x] = 'barrier';
            this.barriers.push({ x, y });
        }
    }

    clearBarriers() {
        for (const barrier of this.barriers) {
            this.grid[barrier.y][barrier.x] = null;
        }
        this.barriers = [];
    }

    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== 'barrier') {
                    this.grid[y][x] = null;
                }
            }
        }
        this.pheromoneLayer.clear();
    }

    // Count creatures in radius
    countCreaturesInRadius(cx, cy, radius) {
        const radiusSq = radius * radius;
        let count = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (this.getCreatureAt(x, y)) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    // Get all neighbors within radius
    getNeighbors(cx, cy, radius) {
        const radiusSq = radius * radius;
        const neighbors = [];

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                if (dx === 0 && dy === 0) continue;

                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq) {
                    const x = cx + dx;
                    const y = cy + dy;
                    const creature = this.getCreatureAt(x, y);
                    if (creature) {
                        neighbors.push(creature);
                    }
                }
            }
        }

        return neighbors;
    }

    // Initialize barriers based on type
    initializeBarriers(barrierType) {
        this.clearBarriers();

        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        switch (barrierType) {
            case 0: // No barriers
                break;

            case 1: // Vertical bar at center
                for (let y = Math.floor(this.height / 4); y < Math.floor(3 * this.height / 4); y++) {
                    this.placeBarrier(centerX, y);
                    this.placeBarrier(centerX + 1, y);
                }
                break;

            case 2: // Random vertical bar
                const randomX = Math.floor(Math.random() * (this.width - 40)) + 20;
                for (let y = Math.floor(this.height / 4); y < Math.floor(3 * this.height / 4); y++) {
                    this.placeBarrier(randomX, y);
                    this.placeBarrier(randomX + 1, y);
                }
                break;

            case 3: // Five rectangular blocks
                const positions = [
                    [this.width * 0.2, this.height * 0.2],
                    [this.width * 0.8, this.height * 0.2],
                    [this.width * 0.5, this.height * 0.5],
                    [this.width * 0.2, this.height * 0.8],
                    [this.width * 0.8, this.height * 0.8],
                ];
                for (const [cx, cy] of positions) {
                    for (let dy = -3; dy <= 3; dy++) {
                        for (let dx = -3; dx <= 3; dx++) {
                            this.placeBarrier(Math.floor(cx + dx), Math.floor(cy + dy));
                        }
                    }
                }
                break;

            case 4: // Horizontal bar in lower-right
                const startX = Math.floor(this.width * 0.6);
                const barY = Math.floor(this.height * 0.7);
                for (let x = startX; x < this.width - 5; x++) {
                    this.placeBarrier(x, barY);
                    this.placeBarrier(x, barY + 1);
                }
                break;

            case 5: // One circular island (random position)
                const islandX = Math.floor(Math.random() * (this.width - 40)) + 20;
                const islandY = Math.floor(Math.random() * (this.height - 40)) + 20;
                const radius = 3;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        if (dx * dx + dy * dy <= radius * radius) {
                            this.placeBarrier(islandX + dx, islandY + dy);
                        }
                    }
                }
                break;

            case 6: // Five circular spots
                const spotRadius = 5;
                for (let i = 0; i < 5; i++) {
                    const spotY = Math.floor((i + 1) * this.height / 6);
                    const spotX = centerX;
                    for (let dy = -spotRadius; dy <= spotRadius; dy++) {
                        for (let dx = -spotRadius; dx <= spotRadius; dx++) {
                            if (dx * dx + dy * dy <= spotRadius * spotRadius) {
                                this.placeBarrier(spotX + dx, spotY + dy);
                            }
                        }
                    }
                }
                break;
        }
    }

    update() {
        // Update pheromones (decay)
        this.pheromoneLayer.decay(this.config.get('pheromones.decayRate'));
    }
}
