// Selection Manager - implements survival challenges

export class SelectionManager {
    constructor(config) {
        this.config = config;
    }

    // Evaluate creatures and return survivors
    evaluate(creatures, world) {
        const challengeType = this.config.get('selection.challengeType');
        const survivors = [];

        for (const creature of creatures) {
            if (!creature.isAlive()) continue;

            if (this.passesChallenge(creature, world, challengeType)) {
                survivors.push(creature);
            }
        }

        return survivors;
    }

    passesChallenge(creature, world, challengeType) {
        const sizeX = world.width;
        const sizeY = world.height;
        const x = creature.x;
        const y = creature.y;

        switch (challengeType) {
            case 0: // CIRCLE - within circular zone
                {
                    const centerX = sizeX / 4;
                    const centerY = sizeY / 4;
                    const radius = sizeX / 4;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    return (dx * dx + dy * dy) <= (radius * radius);
                }

            case 1: // RIGHT_HALF
                return x > sizeX / 2;

            case 2: // RIGHT_QUARTER
                return x > 3 * sizeX / 4;

            case 3: // LEFT_EIGHTH
                return x < sizeX / 8;

            case 4: // STRING (social) - 2-22 neighbors within radius 1.5
                {
                    const isBorder = x === 0 || x === sizeX - 1 || y === 0 || y === sizeY - 1;
                    if (isBorder) return false;

                    const neighbors = world.getNeighbors(x, y, 1.5);
                    const count = neighbors.length;
                    return count >= 2 && count <= 22;
                }

            case 5: // CENTER_WEIGHTED - within radius, distance-weighted
                {
                    const centerX = sizeX / 2;
                    const centerY = sizeY / 2;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxRadius = sizeX / 3;
                    return dist <= maxRadius;
                }

            case 6: // CENTER_UNWEIGHTED - within radius
                {
                    const centerX = sizeX / 2;
                    const centerY = sizeY / 2;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxRadius = sizeX / 3;
                    return dist <= maxRadius;
                }

            case 7: // CENTER_SPARSE - within radius AND 5-8 neighbors
                {
                    const centerX = sizeX / 2;
                    const centerY = sizeY / 2;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > sizeX / 4) return false;

                    const neighbors = world.getNeighbors(x, y, 1.5);
                    const count = neighbors.length;
                    return count >= 5 && count <= 8;
                }

            case 8: // CORNER - within sizeX/8 of any corner
                {
                    const cornerDist = sizeX / 8;
                    const nearTopLeft = x < cornerDist && y < cornerDist;
                    const nearTopRight = x >= sizeX - cornerDist && y < cornerDist;
                    const nearBottomLeft = x < cornerDist && y >= sizeY - cornerDist;
                    const nearBottomRight = x >= sizeX - cornerDist && y >= sizeY - cornerDist;
                    return nearTopLeft || nearTopRight || nearBottomLeft || nearBottomRight;
                }

            case 9: // CORNER_WEIGHTED - within sizeX/4 of any corner
                {
                    const cornerDist = sizeX / 4;
                    const distToTL = Math.sqrt(x * x + y * y);
                    const distToTR = Math.sqrt((sizeX - 1 - x) ** 2 + y * y);
                    const distToBL = Math.sqrt(x * x + (sizeY - 1 - y) ** 2);
                    const distToBR = Math.sqrt((sizeX - 1 - x) ** 2 + (sizeY - 1 - y) ** 2);

                    return distToTL <= cornerDist || distToTR <= cornerDist ||
                           distToBL <= cornerDist || distToBR <= cornerDist;
                }

            case 11: // AGAINST_ANY_WALL - touching boundary
                return x === 0 || x === sizeX - 1 || y === 0 || y === sizeY - 1;

            case 13: // MIGRATE_DISTANCE - scored by distance from birth
                {
                    const distance = creature.getMigrationDistance();
                    const threshold = Math.min(sizeX, sizeY) * 0.2;
                    return distance >= threshold;
                }

            case 14: // EAST_WEST_EIGHTHS
                return x < sizeX / 8 || x >= 7 * sizeX / 8;

            default:
                return true;
        }
    }
}
