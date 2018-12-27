import { Worktype } from "../utils/Constants"

Creep.prototype.act = function () {
    switch (this.memory.workType) {
        case (Worktype.HARVEST):
            this.actHarvest();
            break;
    }
}

Creep.prototype.actHarvest = function () {
    const mySource = Game.getObjectById(this.memory.workplace) as Source
    mySource.memory.status.assignedHarvester++
    const carrySum = _.sum(this.carry)
    if (this.memory.movingToWorkplace && this.carryCapacity === carrySum) {
        this.memory.movingToWorkplace = false
        this.memory.currentTarget = this.getDropoff();
    } else if (!this.memory.movingToWorkplace && 0 === _.sum(this.carry)) {
        this.memory.movingToWorkplace = true;
        this.memory.currentTarget = this.memory.workplace;
    }

    const target = Game.getObjectById(this.memory.currentTarget) as Source | StructureSpawn;

    if (this.moveByFlowField(target) !== -1) {
        if (this.memory.movingToWorkplace) {
            this.harvest(target as Source);
        } else {
            this.transfer(target as StructureSpawn, RESOURCE_ENERGY);
        }
    }

    // this.room.visual.fluid(RESOURCE_ENERGY, this.pos.x, this.pos.y, (carrySum / this.carryCapacity) / 2 + 0.5)
}

Creep.prototype.getDropoff = function () {
    const site = this.room.turnCache.structure.energyDropoff[0];
    return site.id;
}

Creep.prototype.moveByFlowField = function (target: StructureSpawn | Source) {
    const flowQueue = target.pos.getFlowFieldList(target.memory.navigation.flowFieldQueue, target.memory.navigation.flowField, this.pos);
    if (flowQueue[0].dist !== 1) {
        let lastEntryCost = 0;
        let sameCostField = [] as FlowFieldEntry[];
        for (const queueEntry of flowQueue) {
            let next = this.pos.getNeighbour(queueEntry.dir);
            if (queueEntry.cost === lastEntryCost) {
                if (next !== undefined && next.isFreeToWalk() && this.room.turnCache.creepTargets[next.x][next.y] === 0) {
                    sameCostField.push(queueEntry)
                }
            } else {
                if (sameCostField.length > 0) {
                    const idx = Math.floor(Math.random() * sameCostField.length);
                    next = this.pos.getNeighbour(sameCostField[idx].dir) as RoomPosition;
                    this.move(sameCostField[idx].dir);
                    this.room.turnCache.creepTargets[next.x][next.y]++;
                    if (target.memory.navigation.flowField[next.x][next.y][0].dist === 1) {
                        return 1
                    } else {
                        return -1
                    }
                } else {
                    sameCostField = [] as FlowFieldEntry[];
                    if (next !== undefined && next.isFreeToWalk() && this.room.turnCache.creepTargets[next.x][next.y] === 0) {
                        sameCostField.push(queueEntry)
                    }
                }
            }
            lastEntryCost = queueEntry.cost;
        }
    }
    return 0
}
