// Renderer - visualizes the simulation

export class Renderer {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.config = config;

        // Performance tracking
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
        this.fps = 0;
    }

    render(world, creatures, stats) {
        const cellSize = this.config.get('rendering.cellSize');
        const showGrid = this.config.get('rendering.showGrid');
        const showPheromones = this.config.get('rendering.showPheromones');

        // Resize canvas if needed
        const canvasWidth = world.width * cellSize;
        const canvasHeight = world.height * cellSize;

        if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
        }

        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw pheromones
        if (showPheromones) {
            this.renderPheromones(world, cellSize);
        }

        // Draw grid
        if (showGrid) {
            this.renderGrid(world, cellSize);
        }

        // Draw barriers
        this.renderBarriers(world, cellSize);

        // Draw creatures
        this.renderCreatures(creatures, cellSize);

        // Draw selection zone (optional visualization)
        this.renderSelectionZone(world, cellSize);

        // Update FPS
        this.updateFPS();
    }

    renderPheromones(world, cellSize) {
        const opacity = this.config.get('rendering.pheromoneOpacity');

        for (let y = 0; y < world.height; y++) {
            for (let x = 0; x < world.width; x++) {
                const value = world.pheromoneLayer.getValue(x, y);
                if (value > 0) {
                    const intensity = value / 255;
                    this.ctx.fillStyle = `rgba(0, 255, 100, ${intensity * opacity})`;
                    this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    renderGrid(world, cellSize) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= world.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * cellSize, 0);
            this.ctx.lineTo(x * cellSize, world.height * cellSize);
            this.ctx.stroke();
        }

        for (let y = 0; y <= world.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * cellSize);
            this.ctx.lineTo(world.width * cellSize, y * cellSize);
            this.ctx.stroke();
        }
    }

    renderBarriers(world, cellSize) {
        this.ctx.fillStyle = '#666666';

        for (const barrier of world.barriers) {
            this.ctx.fillRect(
                barrier.x * cellSize,
                barrier.y * cellSize,
                cellSize,
                cellSize
            );
        }
    }

    renderCreatures(creatures, cellSize) {
        // Group creatures by color for batch rendering
        const creaturesByColor = new Map();

        for (const creature of creatures) {
            if (!creature.isAlive()) continue;

            const color = creature.getColor();
            if (!creaturesByColor.has(color)) {
                creaturesByColor.set(color, []);
            }
            creaturesByColor.get(color).push(creature);
        }

        // Render each color group
        for (const [color, group] of creaturesByColor) {
            this.ctx.fillStyle = color;

            for (const creature of group) {
                const x = creature.x * cellSize;
                const y = creature.y * cellSize;

                // Draw as circle or square
                if (cellSize >= 4) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x + cellSize / 2,
                        y + cellSize / 2,
                        cellSize / 2 - 1,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }

    renderSelectionZone(world, cellSize) {
        const challengeType = this.config.get('selection.challengeType');
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        this.ctx.lineWidth = 2;

        const sizeX = world.width;
        const sizeY = world.height;

        switch (challengeType) {
            case 0: // CIRCLE
                {
                    const centerX = (sizeX / 4) * cellSize;
                    const centerY = (sizeY / 4) * cellSize;
                    const radius = (sizeX / 4) * cellSize;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                break;

            case 1: // RIGHT_HALF
                this.ctx.strokeRect((sizeX / 2) * cellSize, 0, (sizeX / 2) * cellSize, sizeY * cellSize);
                break;

            case 6: // CENTER_UNWEIGHTED
                {
                    const centerX = (sizeX / 2) * cellSize;
                    const centerY = (sizeY / 2) * cellSize;
                    const radius = (sizeX / 3) * cellSize;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                break;

            // Add more visualization for other challenges as needed
        }
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();

        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }

    getFPS() {
        return this.fps;
    }

    // Render selected creature info on genome canvas
    renderGenomeVisualization(creature, canvas) {
        if (!creature) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw simple neural network diagram
        const genome = creature.genome;
        const brain = creature.brain;

        ctx.font = '12px monospace';
        ctx.fillStyle = '#333';

        let y = 20;
        ctx.fillText(`Genome: ${genome.length()} genes`, 10, y);
        y += 20;
        ctx.fillText(`Neurons: ${brain.getNeuronCount()}`, 10, y);
        y += 20;
        ctx.fillText(`Connections: ${brain.getConnectionCount()}`, 10, y);
        y += 30;

        // Draw simple connection diagram
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 1;

        const connections = brain.connections.slice(0, 10); // First 10 connections
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            const yPos = y + i * 15;

            ctx.fillStyle = '#666';
            ctx.fillText(`${conn.sourceType}[${conn.sourceId}] → ${conn.sinkType}[${conn.sinkId}]`, 10, yPos);

            // Weight bar
            const weight = conn.weight / 32768;
            const barWidth = Math.abs(weight) * 100;
            ctx.fillStyle = weight > 0 ? 'rgba(0, 200, 0, 0.5)' : 'rgba(200, 0, 0, 0.5)';
            ctx.fillRect(180, yPos - 10, barWidth, 10);
        }
    }
}
