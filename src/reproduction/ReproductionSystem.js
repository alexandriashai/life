// Reproduction System - creates new generation from survivors

import { Genome } from '../genome/Genome.js';
import { Creature } from '../core/Creature.js';
import { random } from '../utils/Random.js';

export class ReproductionSystem {
    constructor(config) {
        this.config = config;
    }

    // Create new generation from survivors
    reproduce(survivors, targetPopulation) {
        const newCreatures = [];

        if (survivors.length === 0) {
            // Extinction - create random population
            for (let i = 0; i < targetPopulation; i++) {
                const genome = Genome.random(this.config.get('genome.geneCount'));
                const creature = new Creature(genome, 0, 0, this.config);
                newCreatures.push(creature);
            }
            return newCreatures;
        }

        // Reproduce from survivors
        const mutationRate = this.config.get('genome.mutationRate');

        for (let i = 0; i < targetPopulation; i++) {
            // Select parent(s)
            const parent1 = random.choice(survivors);
            let genome;

            // Sexual reproduction (crossover)
            if (survivors.length > 1 && random.next() < 0.5) {
                const parent2 = random.choice(survivors);
                genome = Genome.crossover(parent1.genome, parent2.genome);
            } else {
                // Asexual reproduction (clone)
                genome = parent1.genome.clone();
            }

            // Mutate
            genome.mutate(mutationRate);

            // Create offspring
            const creature = new Creature(genome, 0, 0, this.config);
            newCreatures.push(creature);
        }

        return newCreatures;
    }

    // Calculate generation statistics
    calculateStatistics(creatures, survivors) {
        const stats = {
            population: creatures.length,
            survivors: survivors.length,
            survivalRate: creatures.length > 0 ? survivors.length / creatures.length : 0,
            avgGenomeLength: 0,
            avgNeurons: 0,
            avgConnections: 0,
        };

        if (creatures.length > 0) {
            let totalGenomeLength = 0;
            let totalNeurons = 0;
            let totalConnections = 0;

            for (const creature of creatures) {
                totalGenomeLength += creature.genome.length();
                totalNeurons += creature.brain.getNeuronCount();
                totalConnections += creature.brain.getConnectionCount();
            }

            stats.avgGenomeLength = totalGenomeLength / creatures.length;
            stats.avgNeurons = totalNeurons / creatures.length;
            stats.avgConnections = totalConnections / creatures.length;
        }

        return stats;
    }
}
