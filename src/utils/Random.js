// Random number generator

export class Random {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.state = seed;
    }

    // Simple fast random number generator
    next() {
        // Linear congruential generator
        this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
        return this.state / 0xffffffff;
    }

    nextInt(min = 0, max = 1) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    nextFloat(min = 0, max = 1) {
        return this.next() * (max - min) + min;
    }

    nextBool() {
        return this.next() < 0.5;
    }

    choice(array) {
        return array[this.nextInt(0, array.length)];
    }
}

// Global random instance
export const random = new Random();
