// Sensor System - implements all 21 sensors from biosim4

export class SensorSystem {
    constructor(config) {
        this.config = config;
    }

    // Compute all sensor values for a creature
    sense(creature, world) {
        const sensors = new Float32Array(21);

        const sizeX = world.width;
        const sizeY = world.height;
        const x = creature.x;
        const y = creature.y;

        // 0: LOC_X - X position (0.0-1.0)
        sensors[0] = x / (sizeX - 1);

        // 1: LOC_Y - Y position (0.0-1.0)
        sensors[1] = y / (sizeY - 1);

        // 2: BOUNDARY_DIST_X - Distance to nearest X boundary
        sensors[2] = Math.min(x, sizeX - 1 - x) / (sizeX / 2);

        // 3: BOUNDARY_DIST - Distance to any edge
        const distX = Math.min(x, sizeX - 1 - x);
        const distY = Math.min(y, sizeY - 1 - y);
        const minDist = Math.min(distX, distY);
        const maxPossible = Math.min(sizeX, sizeY) / 2;
        sensors[3] = minDist / maxPossible;

        // 4: BOUNDARY_DIST_Y - Distance to nearest Y boundary
        sensors[4] = Math.min(y, sizeY - 1 - y) / (sizeY / 2);

        // 5: GENETIC_SIM_FWD - Genetic similarity with forward neighbor
        sensors[5] = this.getGeneticSimilarityFwd(creature, world);

        // 6: LAST_MOVE_DIR_X - Last movement X direction
        sensors[6] = (creature.lastMoveDir.x + 1) / 2.0; // Map -1,0,1 to 0,0.5,1

        // 7: LAST_MOVE_DIR_Y - Last movement Y direction
        sensors[7] = (creature.lastMoveDir.y + 1) / 2.0;

        // 8: LONGPROBE_POP_FWD - Population ahead (long distance)
        sensors[8] = this.getLongProbePopulation(creature, world);

        // 9: LONGPROBE_BAR_FWD - Barrier ahead (long distance)
        sensors[9] = this.getLongProbeBarrier(creature, world);

        // 10: POPULATION - Local population density
        sensors[10] = this.getPopulationDensity(creature, world);

        // 11: POPULATION_FWD - Population in forward direction
        sensors[11] = this.getPopulationFwd(creature, world);

        // 12: POPULATION_LR - Population left/right
        sensors[12] = this.getPopulationLR(creature, world);

        // 13: OSC1 - Oscillator
        sensors[13] = this.getOscillator(creature);

        // 14: AGE - Normalized age
        sensors[14] = creature.age / this.config.get('simulation.stepsPerGeneration');

        // 15: BARRIER_FWD - Barrier in forward direction (short)
        sensors[15] = this.getBarrierFwd(creature, world);

        // 16: BARRIER_LR - Barrier left/right (short)
        sensors[16] = this.getBarrierLR(creature, world);

        // 17: RANDOM - Random value
        sensors[17] = Math.random();

        // 18: SIGNAL0 - Local pheromone level
        sensors[18] = world.pheromoneLayer.getAverageInRadius(
            x, y,
            this.config.get('pheromones.sensorRadius')
        );

        // 19: SIGNAL0_FWD - Pheromone in forward direction
        sensors[19] = this.getSignalFwd(creature, world);

        // 20: SIGNAL0_LR - Pheromone left/right
        sensors[20] = this.getSignalLR(creature, world);

        return sensors;
    }

    getGeneticSimilarityFwd(creature, world) {
        const dir = creature.lastMoveDir;
        const nx = creature.x + dir.x;
        const ny = creature.y + dir.y;

        if (world.isInBounds(nx, ny)) {
            const other = world.getCreatureAt(nx, ny);
            if (other && other !== creature) {
                return creature.genome.getSimilarity(other.genome);
            }
        }
        return 0;
    }

    getLongProbePopulation(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 0;

        const distance = creature.longProbeDist;
        let emptyCount = 0;

        for (let i = 1; i <= distance; i++) {
            const nx = creature.x + dir.x * i;
            const ny = creature.y + dir.y * i;

            if (!world.isInBounds(nx, ny)) break;
            if (world.isBarrier(nx, ny)) break;
            if (!world.getCreatureAt(nx, ny)) emptyCount++;
        }

        return emptyCount / distance;
    }

    getLongProbeBarrier(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 1;

        const distance = creature.longProbeDist;

        for (let i = 1; i <= distance; i++) {
            const nx = creature.x + dir.x * i;
            const ny = creature.y + dir.y * i;

            if (!world.isInBounds(nx, ny)) return i / distance;
            if (world.isBarrier(nx, ny)) return i / distance;
        }

        return 1.0;
    }

    getPopulationDensity(creature, world) {
        const radius = this.config.get('sensors.populationSensorRadius');
        const radiusSq = radius * radius;
        let count = 0;
        let total = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq <= radiusSq) {
                    const nx = creature.x + dx;
                    const ny = creature.y + dy;
                    if (world.isInBounds(nx, ny)) {
                        total++;
                        if (world.getCreatureAt(nx, ny)) count++;
                    }
                }
            }
        }

        return total > 0 ? count / total : 0;
    }

    getPopulationFwd(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 0;

        const radius = this.config.get('sensors.populationSensorRadius');
        const radiusSq = radius * radius;
        let sum = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq > 0 && distSq <= radiusSq) {
                    // Project onto forward direction
                    const dot = dx * dir.x + dy * dir.y;
                    if (dot > 0) {
                        const nx = creature.x + dx;
                        const ny = creature.y + dy;
                        if (world.isInBounds(nx, ny) && world.getCreatureAt(nx, ny)) {
                            sum += 1.0 / distSq;
                        }
                    }
                }
            }
        }

        return Math.min(1.0, sum);
    }

    getPopulationLR(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 0;

        // Perpendicular direction (90° clockwise)
        const perpDir = { x: -dir.y, y: dir.x };

        const radius = this.config.get('sensors.populationSensorRadius');
        const radiusSq = radius * radius;
        let sum = 0;

        for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
            for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
                const distSq = dx * dx + dy * dy;
                if (distSq > 0 && distSq <= radiusSq) {
                    // Project onto perpendicular direction
                    const dot = dx * perpDir.x + dy * perpDir.y;
                    if (dot > 0) {
                        const nx = creature.x + dx;
                        const ny = creature.y + dy;
                        if (world.isInBounds(nx, ny) && world.getCreatureAt(nx, ny)) {
                            sum += 1.0 / distSq;
                        }
                    }
                }
            }
        }

        return Math.min(1.0, sum);
    }

    getOscillator(creature) {
        const phase = creature.age % creature.oscPeriod;
        const normalized = phase / creature.oscPeriod;
        return (-Math.cos(normalized * 2 * Math.PI) + 1) / 2;
    }

    getBarrierFwd(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 1;

        const distance = this.config.get('sensors.shortProbeBarrierDistance');

        for (let i = 1; i <= distance; i++) {
            const nx = creature.x + dir.x * i;
            const ny = creature.y + dir.y * i;

            if (!world.isInBounds(nx, ny)) return i / distance;
            if (world.isBarrier(nx, ny)) return i / distance;
        }

        return 1.0;
    }

    getBarrierLR(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 1;

        // Perpendicular direction
        const perpDir = { x: -dir.y, y: dir.x };
        const distance = this.config.get('sensors.shortProbeBarrierDistance');

        for (let i = 1; i <= distance; i++) {
            const nx = creature.x + perpDir.x * i;
            const ny = creature.y + perpDir.y * i;

            if (!world.isInBounds(nx, ny)) return i / distance;
            if (world.isBarrier(nx, ny)) return i / distance;
        }

        return 1.0;
    }

    getSignalFwd(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 0;

        return world.pheromoneLayer.getDirectionalSignal(
            creature.x, creature.y,
            dir.x, dir.y,
            this.config.get('pheromones.sensorRadius')
        );
    }

    getSignalLR(creature, world) {
        const dir = creature.lastMoveDir;
        if (dir.x === 0 && dir.y === 0) return 0;

        // Perpendicular direction
        const perpDir = { x: -dir.y, y: dir.x };

        return world.pheromoneLayer.getDirectionalSignal(
            creature.x, creature.y,
            perpDir.x, perpDir.y,
            this.config.get('pheromones.sensorRadius')
        );
    }
}
