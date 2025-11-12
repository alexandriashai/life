// Action System - implements all 16 actions from biosim4

export class ActionSystem {
    constructor(config) {
        this.config = config;
    }

    // Execute actions based on neural network outputs
    execute(actionValues, creature, world) {
        // Actions 0-15 from biosim4

        // Movement accumulation
        let moveX = 0;
        let moveY = 0;

        // 0: MOVE_X - accumulate X movement
        moveX += Math.tanh(actionValues[0]);

        // 1: MOVE_Y - accumulate Y movement
        moveY += Math.tanh(actionValues[1]);

        // 2: MOVE_FORWARD - continue last direction
        if (actionValues[2] > 0.5) {
            moveX += creature.lastMoveDir.x * Math.tanh(actionValues[2]);
            moveY += creature.lastMoveDir.y * Math.tanh(actionValues[2]);
        }

        // 3: MOVE_RL - left-right component (perpendicular)
        const perpX = -creature.lastMoveDir.y;
        const perpY = creature.lastMoveDir.x;
        moveX += perpX * Math.tanh(actionValues[3]);
        moveY += perpY * Math.tanh(actionValues[3]);

        // 4: MOVE_RANDOM - random movement
        if (actionValues[4] > 0.5 && Math.random() < 0.1) {
            moveX += (Math.random() - 0.5) * 2;
            moveY += (Math.random() - 0.5) * 2;
        }

        // 5: SET_OSCILLATOR_PERIOD
        if (Math.abs(actionValues[5]) > 0.5) {
            const level = Math.tanh(actionValues[5]);
            creature.oscPeriod = Math.floor(1 + (1.5 + Math.exp(7.0 * level)));
            creature.oscPeriod = Math.max(2, Math.min(2048, creature.oscPeriod));
        }

        // 6: SET_LONGPROBE_DIST
        if (Math.abs(actionValues[6]) > 0.5) {
            const level = Math.tanh(actionValues[6]);
            creature.longProbeDist = Math.floor(1 + level * 32);
            creature.longProbeDist = Math.max(1, Math.min(32, creature.longProbeDist));
        }

        // 7: SET_RESPONSIVENESS
        if (Math.abs(actionValues[7]) > 0.5) {
            creature.responsiveness = Math.abs(Math.tanh(actionValues[7]));
        }

        // 8: EMIT_SIGNAL0 - emit pheromone
        if (actionValues[8] > 0.5 && Math.random() < creature.responsiveness) {
            world.pheromoneLayer.emit(
                creature.x, creature.y,
                this.config.get('pheromones.emissionAmount'),
                this.config.get('pheromones.emissionRadius')
            );
        }

        // 9: MOVE_EAST
        moveX += Math.tanh(actionValues[9]);

        // 10: MOVE_WEST
        moveX -= Math.tanh(actionValues[10]);

        // 11: MOVE_NORTH
        moveY += Math.tanh(actionValues[11]);

        // 12: MOVE_SOUTH
        moveY -= Math.tanh(actionValues[12]);

        // 13: MOVE_LEFT - relative to last direction
        moveX += perpX * Math.tanh(actionValues[13]);
        moveY += perpY * Math.tanh(actionValues[13]);

        // 14: MOVE_RIGHT - relative to last direction
        moveX -= perpX * Math.tanh(actionValues[14]);
        moveY -= perpY * Math.tanh(actionValues[14]);

        // 15: MOVE_REVERSE - reverse last direction
        if (actionValues[15] > 0.5) {
            moveX -= creature.lastMoveDir.x * Math.tanh(actionValues[15]);
            moveY -= creature.lastMoveDir.y * Math.tanh(actionValues[15]);
        }

        // Apply responsiveness
        moveX *= creature.responsiveness;
        moveY *= creature.responsiveness;

        // Determine actual movement (probabilistic)
        let finalMoveX = 0;
        let finalMoveY = 0;

        if (Math.abs(moveX) > 0.5) {
            finalMoveX = moveX > 0 ? 1 : -1;
        }

        if (Math.abs(moveY) > 0.5) {
            finalMoveY = moveY > 0 ? 1 : -1;
        }

        // Apply movement if valid
        if (finalMoveX !== 0 || finalMoveY !== 0) {
            this.tryMove(creature, finalMoveX, finalMoveY, world);
        }
    }

    tryMove(creature, dx, dy, world) {
        const newX = creature.x + dx;
        const newY = creature.y + dy;

        // Check if target cell is valid and empty
        if (world.isInBounds(newX, newY) &&
            !world.isBarrier(newX, newY) &&
            !world.getCreatureAt(newX, newY)) {

            // Remove from old position
            world.removeCreature(creature);

            // Update position
            creature.x = newX;
            creature.y = newY;

            // Update last move direction
            creature.lastMoveDir = { x: dx, y: dy };

            // Place at new position
            world.placeCreature(creature);
        }
    }
}
