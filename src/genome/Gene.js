// Gene represents a single neural connection encoded as 32 bits

import { random } from '../utils/Random.js';

export class Gene {
    constructor(sourceType = 0, sourceNum = 0, sinkType = 0, sinkNum = 0, weight = 0) {
        this.sourceType = sourceType; // 0 = sensor, 1 = neuron
        this.sourceNum = sourceNum;   // Which sensor or neuron
        this.sinkType = sinkType;     // 0 = neuron, 1 = action
        this.sinkNum = sinkNum;       // Which neuron or action
        this.weight = weight;         // Connection weight (-32768 to 32767)
    }

    static random() {
        return new Gene(
            random.nextInt(0, 2),
            random.nextInt(0, 256),
            random.nextInt(0, 2),
            random.nextInt(0, 256),
            random.nextInt(-32768, 32768)
        );
    }

    static fromBinary(value) {
        // Decode 32-bit value
        // Bit layout: [sourceType:1][sourceNum:7][sinkType:1][sinkNum:7][weight:16]
        const weight = (value & 0xFFFF) << 16 >> 16; // Sign extend
        const sinkNum = (value >> 16) & 0x7F;
        const sinkType = (value >> 23) & 0x1;
        const sourceNum = (value >> 24) & 0x7F;
        const sourceType = (value >> 31) & 0x1;

        return new Gene(sourceType, sourceNum, sinkType, sinkNum, weight);
    }

    toBinary() {
        // Encode as 32-bit value
        let value = 0;
        value |= (this.sourceType & 0x1) << 31;
        value |= (this.sourceNum & 0x7F) << 24;
        value |= (this.sinkType & 0x1) << 23;
        value |= (this.sinkNum & 0x7F) << 16;
        value |= (this.weight & 0xFFFF);
        return value >>> 0; // Unsigned
    }

    clone() {
        return new Gene(
            this.sourceType,
            this.sourceNum,
            this.sinkType,
            this.sinkNum,
            this.weight
        );
    }

    mutate(mutationRate) {
        // Bit-flip mutation
        const binary = this.toBinary();
        let mutated = binary;

        for (let bit = 0; bit < 32; bit++) {
            if (random.next() < mutationRate) {
                mutated ^= (1 << bit);
            }
        }

        const gene = Gene.fromBinary(mutated);
        this.sourceType = gene.sourceType;
        this.sourceNum = gene.sourceNum;
        this.sinkType = gene.sinkType;
        this.sinkNum = gene.sinkNum;
        this.weight = gene.weight;
    }

    toHex() {
        return '0x' + this.toBinary().toString(16).toUpperCase().padStart(8, '0');
    }
}
