RoomPosition.prototype.getNeighbour = function (dir: number) {
    let newPos;
    switch (dir) {
        case TOP: {
            newPos = new RoomPosition(this.x, this.y - 1, this.roomName);
            break;
        }
        case TOP_RIGHT: {
            newPos = new RoomPosition(this.x + 1, this.y - 1, this.roomName);
            break;
        }
        case RIGHT: {
            newPos = new RoomPosition(this.x + 1, this.y, this.roomName);
            break;
        }
        case BOTTOM_RIGHT: {
            newPos = new RoomPosition(this.x + 1, this.y + 1, this.roomName);
            break;
        }
        case BOTTOM: {
            newPos = new RoomPosition(this.x, this.y + 1, this.roomName);
            break;
        }
        case BOTTOM_LEFT: {
            newPos = new RoomPosition(this.x - 1, this.y + 1, this.roomName);
            break;
        }
        case LEFT: {
            newPos = new RoomPosition(this.x - 1, this.y, this.roomName);
            break;
        }
        case TOP_LEFT: {
            newPos = new RoomPosition(this.x - 1, this.y - 1, this.roomName);
            break;
        }
        default: {
            return undefined;
        }
    }
    if (newPos.x < 0 || newPos.x > 49 || newPos.y < 0 || newPos.y > 49) {
        return undefined
    } else {
        return newPos;
    }
}

RoomPosition.prototype.getNeighbours = function () {
    const neighours = new Array<RoomPosition>();
    for (let i = 1; i < 9; i++) {
        const neighour = this.getNeighbour(i);
        if (neighour !== undefined) {
            neighours.push(neighour);
        }
    }
    return neighours;
}

RoomPosition.prototype.isFreeToWalk = function () {
    const look = this.look();
    let valid = true;
    look.forEach((lookObject) => {
        if (valid) {
            if ((lookObject.type === LOOK_TERRAIN && lookObject.terrain === 'wall')
                || (lookObject.type === LOOK_STRUCTURES
                    && lookObject.structure !== undefined
                    && lookObject.structure.structureType !== STRUCTURE_ROAD
                    && lookObject.structure.structureType !== STRUCTURE_CONTAINER
                    && (lookObject.structure.structureType !== STRUCTURE_RAMPART
                        || lookObject.structure.structureType === STRUCTURE_RAMPART
                        && ((lookObject.structure as StructureRampart).my || (lookObject.structure as StructureRampart).isPublic)
                    )
                )
                || lookObject.type === LOOK_CREEPS) {
                valid = false;
            }
        }
    });
    return valid;
}

RoomPosition.prototype.getWalkableNeighbours = function () {
    return this.getNeighbours().filter((pos) => pos.isWalkable());
}

RoomPosition.prototype.isWalkable = function () {
    const look = this.look();
    let valid = true;
    look.forEach((lookObject) => {
        if (valid) {
            if ((lookObject.type === LOOK_TERRAIN && lookObject.terrain === 'wall')
                || (lookObject.type === LOOK_STRUCTURES
                    && lookObject.structure !== undefined
                    && lookObject.structure.structureType !== STRUCTURE_ROAD
                    && lookObject.structure.structureType !== STRUCTURE_CONTAINER
                    && (lookObject.structure.structureType !== STRUCTURE_RAMPART
                        || (lookObject.structure.structureType === STRUCTURE_RAMPART
                            && ((lookObject.structure as StructureRampart).my || (lookObject.structure as StructureRampart).isPublic)

                        )
                    )
                )
            ) {
                valid = false;
            }
        }
    });
    return valid;
}

RoomPosition.prototype.getPathCost = function () {
    const look = this.look();
    let cost = 1;
    look.forEach((lookObject) => {
        if (cost !== Infinity && cost !== 0.5) {
            if (lookObject.type === LOOK_TERRAIN && lookObject.terrain === "swamp") {
                cost = 5;
            } else if (lookObject.type === LOOK_TERRAIN && lookObject.terrain === "plain") {
                cost = 1;
            } else if (lookObject.type === LOOK_TERRAIN && lookObject.terrain === "wall") {
                cost = Infinity;
            }
            if (lookObject.type === LOOK_STRUCTURES && lookObject.structure !== undefined) {
                if (lookObject.structure.structureType === STRUCTURE_ROAD
                    || lookObject.structure.structureType === STRUCTURE_CONTAINER
                    || (lookObject.structure.structureType === STRUCTURE_RAMPART
                        && ((lookObject.structure as StructureRampart).my || (lookObject.structure as StructureRampart).isPublic)
                    )
                ) {
                    cost = 0.5;
                } else {
                    cost = Infinity;
                }
            }
        }
    });
    return cost;
}

RoomPosition.prototype.computeFlowField = function (neighbourIsZero = false, maxCost = 100) {
    const queue = new Array(maxCost);
    for (let i = 0; i < maxCost; i++) {
        queue[i] = new Array<RoomPosition>();
    }

    const flowField = new Array<FlowFieldEntry[][]>(50);
    for (let i = 0; i < 50; i++) {
        flowField[i] = new Array<FlowFieldEntry[]>(50);
        for (let j = 0; j < 50; j++) {
            flowField[i][j] = new Array<FlowFieldEntry>();
        }
    }

    let currentCost = 0;
    let currentPos = this;
    flowField[currentPos.x][currentPos.y].push({ dir: TOP, dist: 0, cost: 0 });
    queue[0].push(currentPos);

    while (currentCost < maxCost) {
        if (queue[currentCost].length === 0) {
            currentCost++;
        } else {
            currentPos = queue[currentCost].shift();
            if (flowField[currentPos.x][currentPos.y][0].cost === currentCost) {
                const neighours = currentPos.getNeighbours();
                for (const neighour of neighours) {
                    const pathCost = neighour.getPathCost() * 2; // For .5 cost
                    if (pathCost === Infinity) {
                        flowField[neighour.x][neighour.y].push({ dir: neighour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist, cost: currentCost });
                    } else {
                        if (currentCost + pathCost < maxCost) {
                            let sortIndex = 0;
                            while (sortIndex < flowField[neighour.x][neighour.y].length && flowField[neighour.x][neighour.y][0].cost < currentCost + pathCost) {
                                sortIndex++
                            }
                            if (flowField[neighour.x][neighour.y].length === 0 || currentCost + pathCost < flowField[neighour.x][neighour.y][0].cost) {
                                queue[currentCost + pathCost].push(neighour);
                            }
                            if (flowField[neighour.x][neighour.y].length === sortIndex) {
                                flowField[neighour.x][neighour.y].push({ dir: neighour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist + 1, cost: currentCost + pathCost })
                            } else {
                                flowField[neighour.x][neighour.y].splice(sortIndex, 0, { dir: neighour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist + 1, cost: currentCost + pathCost })
                            }
                        }
                    }
                }
            }
        }
    }

    // correction for integer cost
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            for (const entry of flowField[i][j]) {
                entry.cost /= 2
                if (neighbourIsZero) {
                    entry.dist = Math.max(0, entry.dist - 1);
                }
            }
        }
    }

    return flowField;
}
