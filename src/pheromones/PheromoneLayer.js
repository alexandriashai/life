// Pheromone layer for chemical signals

export class PheromoneLayer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Use Uint8Array for memory efficiency (0-255)
        this.data = new Uint8Array(width * height);
    }

    getValue(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 0;
        }
        return this.data[y * this.width + x];
    }

    setValue(x, y, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        this.data[y * this.width + x] = Math.max(0, Math.min(255, value));
    }

    emit(x, y, amount, radius) {
        // Emit pheromone at position with given radius
        const radiusSq = radius * radius;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        const current = this.getValue(nx, ny);
                        const emission = distSq === 0 ? amount : Math.ceil(amount / 2);
                        this.setValue(nx, ny, Math.min(255, current + emission));
                    }
                }
            }
        }
    }

    decay(amount = 1) {
        // Decay all pheromones by given amount
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i] > 0) {
                this.data[i] = Math.max(0, this.data[i] - amount);
            }
        }
    }

    clear() {
        this.data.fill(0);
    }

    // Get average pheromone level in radius
    getAverageInRadius(x, y, radius) {
        const radiusSq = radius * radius;
        let sum = 0;
        let count = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq) {
                    sum += this.getValue(x + dx, y + dy);
                    count++;
                }
            }
        }

        return count > 0 ? sum / (count * 255.0) : 0;
    }

    // Get directional pheromone gradient
    getDirectionalSignal(x, y, dirX, dirY, radius) {
        const radiusSq = radius * radius;
        let sum = 0;
        let count = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq && distSq > 0) {
                    // Dot product with direction
                    const dot = dx * dirX + dy * dirY;
                    if (dot > 0) {
                        const value = this.getValue(x + dx, y + dy);
                        // Weight by 1/distance²
                        const weight = 1.0 / distSq;
                        sum += value * weight;
                        count += weight;
                    }
                }
            }
        }

        return count > 0 ? sum / (count * 255.0) : 0;
    }
}
