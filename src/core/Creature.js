// Creature - individual organism

import { buildNeuralNetwork } from '../neural/NeuralNetwork.js';

export class Creature {
    constructor(genome, x, y, config) {
        this.genome = genome;
        this.x = x;
        this.y = y;
        this.birthX = x;
        this.birthY = y;

        this.age = 0;
        this.alive = true;

        // Neural network
        this.brain = buildNeuralNetwork(
            genome,
            config.get('genome.maxInternalNeurons')
        );

        // Behavioral parameters
        this.responsiveness = 0.5;
        this.oscPeriod = 35;
        this.longProbeDist = 16;

        // Last movement direction
        this.lastMoveDir = { x: 0, y: 0 };

        // For challenges
        this.hasVisitedBorder = false;

        // Cache color
        this.color = genome.makeGeneticColor();

        this.config = config;
    }

    update(sensorSystem, actionSystem, world) {
        if (!this.alive) return;

        // Age
        this.age++;

        // Sense environment
        const sensorValues = sensorSystem.sense(this, world);

        // Think (neural network forward pass)
        const actionValues = this.brain.evaluate(sensorValues);

        // Execute actions
        actionSystem.execute(actionValues, this, world);
    }

    kill() {
        this.alive = false;
    }

    isAlive() {
        return this.alive;
    }

    // Calculate distance traveled from birth
    getMigrationDistance() {
        const dx = this.x - this.birthX;
        const dy = this.y - this.birthY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getColor() {
        return this.color;
    }

    getInfo() {
        return {
            position: `(${this.x}, ${this.y})`,
            age: this.age,
            genomeLength: this.genome.length(),
            neurons: this.brain.getNeuronCount(),
            connections: this.brain.getConnectionCount(),
            responsiveness: this.responsiveness.toFixed(2),
            oscPeriod: this.oscPeriod,
            longProbeDist: this.longProbeDist,
        };
    }
}
