// Configuration management for BioSim4

export const DEFAULT_CONFIG = {
    world: {
        width: 128,
        height: 128,
    },

    population: {
        initialSize: 300,
    },

    genome: {
        geneCount: 24,
        mutationRate: 0.001,
        maxInternalNeurons: 5,
        maxGenomeLength: 300,
    },

    simulation: {
        stepsPerGeneration: 300,
        maxGenerations: 100000,
    },

    selection: {
        challengeType: 6, // CENTER_UNWEIGHTED
    },

    barriers: {
        barrierType: 0, // NONE
    },

    pheromones: {
        enabled: true,
        decayRate: 1, // Subtract 1 per step
        emissionAmount: 2, // Amount emitted at center
        emissionRadius: 1.5, // Radius for emission
        sensorRadius: 2.0, // Radius for sensing
    },

    sensors: {
        populationSensorRadius: 2.5,
        longProbeDistance: 16,
        shortProbeBarrierDistance: 4,
    },

    rendering: {
        cellSize: 6,
        showGrid: false,
        showPheromones: true,
        pheromoneOpacity: 0.4,
        colorMode: 'genome',
    },
};

export class ConfigManager {
    constructor(defaultConfig = DEFAULT_CONFIG) {
        this.config = JSON.parse(JSON.stringify(defaultConfig));
        this.listeners = [];
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.config);
        target[lastKey] = value;
        this.notifyListeners(path, value);
    }

    onChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(path, value) {
        this.listeners.forEach(cb => cb(path, value));
    }

    getAll() {
        return this.config;
    }
}
