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

RoomPosition.prototype.computeFlowField = function (flowFieldQueue, flowField, target, maxCostToTarget = 1) {
    let maxCost = Infinity;
    let currentCost = 0;
    let currentPos = this;
    if (flowFieldQueue.length === 0) {
        flowField[currentPos.x][currentPos.y].push({ dir: TOP, dist: 0, cost: 0 });
        flowFieldQueue.push(Array<RoomPosition>());
        flowFieldQueue[0].push(currentPos);
    } else {
        for (const flowFieldQueueEntry of flowFieldQueue) {
            for (let i = 0; i < flowFieldQueueEntry.length; i++) {
                flowFieldQueueEntry[i] = new RoomPosition(flowFieldQueueEntry[i].x, flowFieldQueueEntry[i].y, flowFieldQueueEntry[i].roomName)
            }
        }
    }

    let callCounter = 0;

    while (currentCost < maxCost) {
        if (flowFieldQueue[currentCost * 2].length === 0) {
            currentCost += 0.5;
        } else {
            callCounter++;
            currentPos = flowFieldQueue[currentCost * 2].shift() as RoomPosition;
            if (flowField[currentPos.x][currentPos.y][0].cost === currentCost) {
                const neighours = currentPos.getNeighbours();
                for (const neighour of neighours) {
                    const pathCost = neighour.getPathCost();
                    if (neighour.x === target.x && neighour.y === target.y && neighour.roomName === target.roomName) {
                        maxCost = currentCost + maxCostToTarget;
                    }
                    if (pathCost === Infinity) {
                        flowField[neighour.x][neighour.y].push({ dir: neighour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist, cost: currentCost });
                    } else {
                        let sortIndex = 0;
                        while (sortIndex < flowField[neighour.x][neighour.y].length && flowField[neighour.x][neighour.y][0].cost < currentCost + pathCost) {
                            sortIndex++
                        }
                        if (flowField[neighour.x][neighour.y].length === 0 || currentCost + pathCost < flowField[neighour.x][neighour.y][0].cost) {
                            for (let i = flowFieldQueue.length; i < (currentCost + pathCost) * 2 + 1; i++) {
                                flowFieldQueue.push(Array<RoomPosition>());
                            }
                            Game.rooms[this.roomName].visual.writeText("" + (currentCost + pathCost), neighour.x, neighour.y)
                            flowFieldQueue[(currentCost + pathCost) * 2].push(neighour);
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

    console.log("Updated flowField for " + this + " with target " + target + " performing " + callCounter + " iterations")
}

RoomPosition.prototype.getFlowFieldList = function (flowFieldQueue, flowField, target) {
    if (flowField[target.x][target.y].length === 0) {
        this.computeFlowField(flowFieldQueue, flowField, target);
    }
    return flowField[target.x][target.y];
}
