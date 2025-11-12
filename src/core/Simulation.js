// Main Simulation orchestrator

import { World } from './World.js';
import { Creature } from './Creature.js';
import { Genome } from '../genome/Genome.js';
import { SensorSystem } from '../sensors/SensorSystem.js';
import { ActionSystem } from '../actions/ActionSystem.js';
import { SelectionManager } from '../selection/SelectionManager.js';
import { ReproductionSystem } from '../reproduction/ReproductionSystem.js';

export class Simulation {
    constructor(config) {
        this.config = config;
        this.running = false;
        this.speed = 1.0;

        // Core components
        this.world = null;
        this.creatures = [];

        // Systems
        this.sensorSystem = new SensorSystem(config);
        this.actionSystem = new ActionSystem(config);
        this.selectionManager = new SelectionManager(config);
        this.reproductionSystem = new ReproductionSystem(config);

        // Generation tracking
        this.generationNumber = 0;
        this.stepNumber = 0;
        this.survivors = [];

        // Performance tracking
        this.lastUpdateTime = 0;
        this.ups = 0; // Updates per second
        this.updateCount = 0;
        this.lastUpsTime = performance.now();

        // Statistics
        this.stats = {
            population: 0,
            survivors: 0,
            generation: 0,
            step: 0,
            avgGenomeLength: 0,
        };

        this.init();
    }

    init() {
        const width = this.config.get('world.width');
        const height = this.config.get('world.height');

        // Create world
        this.world = new World(width, height, this.config);

        // Initialize barriers
        const barrierType = this.config.get('barriers.barrierType');
        this.world.initializeBarriers(barrierType);

        // Create initial population
        this.createInitialPopulation();

        // Reset counters
        this.generationNumber = 0;
        this.stepNumber = 0;
    }

    createInitialPopulation() {
        this.creatures = [];
        const populationSize = this.config.get('population.initialSize');
        const geneCount = this.config.get('genome.geneCount');

        for (let i = 0; i < populationSize; i++) {
            const genome = Genome.random(geneCount);
            const creature = new Creature(genome, 0, 0, this.config);
            this.creatures.push(creature);
            this.placeCreatureRandomly(creature);
        }

        this.updateStats();
    }

    placeCreatureRandomly(creature) {
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.world.width);
            const y = Math.floor(Math.random() * this.world.height);

            if (!this.world.isBarrier(x, y) && !this.world.getCreatureAt(x, y)) {
                creature.x = x;
                creature.y = y;
                creature.birthX = x;
                creature.birthY = y;
                this.world.placeCreature(creature);
                return;
            }

            attempts++;
        }

        // If can't find empty spot, place anyway
        const x = Math.floor(Math.random() * this.world.width);
        const y = Math.floor(Math.random() * this.world.height);
        if (!this.world.isBarrier(x, y)) {
            creature.x = x;
            creature.y = y;
            creature.birthX = x;
            creature.birthY = y;
            this.world.placeCreature(creature);
        }
    }

    start() {
        this.running = true;
        this.lastUpdateTime = performance.now();
    }

    pause() {
        this.running = false;
    }

    reset() {
        this.pause();
        this.init();
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    update() {
        if (!this.running) return;

        // Update all creatures
        for (const creature of this.creatures) {
            if (creature.isAlive()) {
                creature.update(this.sensorSystem, this.actionSystem, this.world);
            }
        }

        // Update world (pheromone decay)
        this.world.update();

        // Increment step
        this.stepNumber++;

        // Check for generation end
        const stepsPerGen = this.config.get('simulation.stepsPerGeneration');
        if (this.stepNumber >= stepsPerGen) {
            this.endGeneration();
        }

        // Update stats
        this.updateStats();

        // Track UPS
        this.updateCount++;
        const now = performance.now();
        if (now - this.lastUpsTime >= 1000) {
            this.ups = this.updateCount;
            this.updateCount = 0;
            this.lastUpsTime = now;
        }
    }

    endGeneration() {
        // Evaluate survivors
        this.survivors = this.selectionManager.evaluate(this.creatures, this.world);

        console.log(`Generation ${this.generationNumber}: ${this.survivors.length}/${this.creatures.length} survived`);

        // Calculate statistics
        const genStats = this.reproductionSystem.calculateStatistics(this.creatures, this.survivors);
        console.log('Generation stats:', genStats);

        // Reproduce
        const newCreatures = this.reproductionSystem.reproduce(
            this.survivors,
            this.config.get('population.initialSize')
        );

        // Start new generation
        this.startNewGeneration(newCreatures);
    }

    startNewGeneration(newCreatures) {
        // Clear world
        this.world.clear();

        // Update generation
        this.generationNumber++;
        this.stepNumber = 0;
        this.creatures = newCreatures;

        // Place new creatures
        for (const creature of this.creatures) {
            this.placeCreatureRandomly(creature);
        }

        this.updateStats();
    }

    updateStats() {
        const aliveCreatures = this.creatures.filter(c => c.isAlive());

        this.stats = {
            population: aliveCreatures.length,
            survivors: this.survivors.length,
            generation: this.generationNumber,
            step: this.stepNumber,
            avgGenomeLength: 0,
            ups: this.ups,
        };

        if (aliveCreatures.length > 0) {
            let totalLength = 0;
            for (const creature of aliveCreatures) {
                totalLength += creature.genome.length();
            }
            this.stats.avgGenomeLength = Math.round(totalLength / aliveCreatures.length);
        }
    }

    getStats() {
        return this.stats;
    }

    getCreatureAt(x, y) {
        return this.world.getCreatureAt(x, y);
    }

    // Step-by-step execution (for debugging)
    step() {
        if (this.running) return;
        this.update();
    }
}
