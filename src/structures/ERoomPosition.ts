import { Constants } from "utils/Constants";

function addSortedToFlowFieldQueue(list: FlowFieldQueueEntry[], item: FlowFieldQueueEntry) {
    let insertIdx = 0;
    while (list.length > insertIdx && list[insertIdx].cost + Constants.AStarWeight * list[insertIdx].heuristic < item.cost + Constants.AStarWeight * item.heuristic) {
        insertIdx++;
    }
    list.splice(insertIdx, 0, item)
}

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

RoomPosition.prototype.computeFlowField = function (flowFieldQueue, flowField, target, maxCostToTarget = 3) {
    let maxCost = Infinity;
    let currentCost = 0;
    let currentPos = this;
    if (flowFieldQueue.length === 0) {
        flowField[currentPos.x][currentPos.y].push({ dir: TOP, dist: 0, cost: 0 });
        flowFieldQueue.push({ pos: currentPos, cost: 0, heuristic: this.getRangeTo(target) });
    } else {
        for (const flowFieldQueueEntry of flowFieldQueue) {
            flowFieldQueueEntry.pos = new RoomPosition(flowFieldQueueEntry.pos.x, flowFieldQueueEntry.pos.y, flowFieldQueueEntry.pos.roomName)
            flowFieldQueueEntry.heuristic = this.getRangeTo(target);
        }
        flowFieldQueue.sort((n1, n2) => {
            if (n1.cost + Constants.AStarWeight * n1.heuristic > n2.cost + Constants.AStarWeight * n2.heuristic) {
                return 1
            } else if (n1.cost + Constants.AStarWeight * n1.heuristic < n2.cost + Constants.AStarWeight * n2.heuristic) {
                return -1
            } else {
                return 0
            }
        });
    }

    let callCounter = 0;
    let currentHeuristic = 0;
    while (currentCost + Constants.AStarWeight * currentHeuristic < maxCost) {
        callCounter++;
        const queueEntry = flowFieldQueue.shift() as FlowFieldQueueEntry
        currentPos = queueEntry.pos;
        currentCost = queueEntry.cost;
        currentHeuristic = queueEntry.heuristic
        if (flowField[currentPos.x][currentPos.y][0].cost === currentCost) {
            const neighbours = currentPos.getNeighbours();
            for (const neighbour of neighbours) {
                const pathCost = neighbour.getPathCost();
                if (neighbour.x === target.x && neighbour.y === target.y && neighbour.roomName === target.roomName) {
                    maxCost = currentCost + maxCostToTarget;
                }
                if (pathCost === Infinity) {
                    flowField[neighbour.x][neighbour.y].push({ dir: neighbour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist, cost: currentCost });
                } else {
                    let sortIndex = 0;
                    while (sortIndex < flowField[neighbour.x][neighbour.y].length && flowField[neighbour.x][neighbour.y][0].cost < currentCost + pathCost) {
                        sortIndex++
                    }
                    if (flowField[neighbour.x][neighbour.y].length === 0 || currentCost + pathCost < flowField[neighbour.x][neighbour.y][0].cost) {
                        Game.rooms[this.roomName].visual.writeText("" + (currentCost + pathCost), neighbour.x, neighbour.y)
                        addSortedToFlowFieldQueue(flowFieldQueue, { pos: neighbour, cost: currentCost + pathCost, heuristic: neighbour.getRangeTo(target) })
                    }
                    if (flowField[neighbour.x][neighbour.y].length === sortIndex) {
                        flowField[neighbour.x][neighbour.y].push({ dir: neighbour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist + 1, cost: currentCost + pathCost })
                    } else {
                        flowField[neighbour.x][neighbour.y].splice(sortIndex, 0, { dir: neighbour.getDirectionTo(currentPos), dist: flowField[currentPos.x][currentPos.y][0].dist + 1, cost: currentCost + pathCost })
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
