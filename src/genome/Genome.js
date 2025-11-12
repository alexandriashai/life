// Genome represents a complete genome (collection of genes)

import { Gene } from './Gene.js';
import { random } from '../utils/Random.js';

export class Genome {
    constructor(genes = []) {
        this.genes = genes;
    }

    static random(geneCount) {
        const genes = [];
        for (let i = 0; i < geneCount; i++) {
            genes.push(Gene.random());
        }
        return new Genome(genes);
    }

    clone() {
        return new Genome(this.genes.map(g => g.clone()));
    }

    mutate(mutationRate) {
        for (const gene of this.genes) {
            gene.mutate(mutationRate);
        }
    }

    // Calculate similarity using Hamming distance
    getSimilarity(other) {
        const len = Math.min(this.genes.length, other.genes.length);
        let differences = Math.abs(this.genes.length - other.genes.length);

        for (let i = 0; i < len; i++) {
            const a = this.genes[i].toBinary();
            const b = other.genes[i].toBinary();
            const xor = a ^ b;

            // Count different bits
            let count = 0;
            for (let bit = 0; bit < 32; bit++) {
                if (xor & (1 << bit)) count++;
            }
            differences += count;
        }

        const maxDifferences = Math.max(this.genes.length, other.genes.length) * 32;
        return 1 - (differences / maxDifferences);
    }

    // Sexual reproduction: combine two genomes
    static crossover(parent1, parent2) {
        const avgLength = Math.floor((parent1.genes.length + parent2.genes.length) / 2);
        const genes = [];

        // Random crossover point
        const crossoverPoint = random.nextInt(0, avgLength);

        for (let i = 0; i < avgLength; i++) {
            let gene;
            if (i < crossoverPoint) {
                gene = i < parent1.genes.length ? parent1.genes[i].clone() : Gene.random();
            } else {
                gene = i < parent2.genes.length ? parent2.genes[i].clone() : Gene.random();
            }
            genes.push(gene);
        }

        return new Genome(genes);
    }

    length() {
        return this.genes.length;
    }

    toHexString() {
        return this.genes.map(g => g.toHex()).join(' ');
    }

    // Generate color based on genome
    makeGeneticColor() {
        if (this.genes.length === 0) {
            return '#888888';
        }

        // 8-bit color encoding based on genome properties
        let bits = 0;

        // Bit 0: genome length parity
        bits |= (this.genes.length & 1) << 0;

        // Bits 1-2: first gene source type and sink type
        if (this.genes.length > 0) {
            bits |= this.genes[0].sourceType << 1;
            bits |= this.genes[0].sinkType << 2;
        }

        // Bits 3-4: last gene source type and sink type
        if (this.genes.length > 1) {
            const last = this.genes[this.genes.length - 1];
            bits |= last.sourceType << 3;
            bits |= last.sinkType << 4;
        }

        // Bits 5-7: from middle genes
        if (this.genes.length > 2) {
            const mid = this.genes[Math.floor(this.genes.length / 2)];
            bits |= (mid.sourceNum & 0x7) << 5;
        }

        // Map to RGB, keeping colors distinguishable
        let r = (bits & 0x07) * 32;
        let g = ((bits >> 3) & 0x07) * 32;
        let b = ((bits >> 6) & 0x03) * 64;

        // Ensure minimum brightness
        const brightness = r + g + b;
        if (brightness < 128) {
            const factor = 128 / brightness;
            r = Math.min(255, r * factor);
            g = Math.min(255, g * factor);
            b = Math.min(255, b * factor);
        }

        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}
