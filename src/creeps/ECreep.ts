import { Worktype } from "../utils/Constants"

Creep.prototype.act = function () {
    if (!this.checkRenew()) {
        switch (this.memory.workType) {
            case (Worktype.HARVEST):
                this.actHarvest();
                break;
            case (Worktype.BUILD):
                this.actBuild();
                break;
            case (Worktype.REPAIR):
                this.actRepair();
                break;
            case (Worktype.CARRY):
                this.actCarry();
                break;
            case (Worktype.UPGRADE):
                this.actUpgrade();
                break;
        }
    }
}

Creep.prototype.checkRenew = function () {
    const spawn = this.room.turnCache.structure.spawns[0];
    if (this.ticksToLive as number < 200 && !spawn.renewQueue.includes(this.id)) {
        spawn.renewQueue.push(this.id);
    }
    if (spawn.renewQueue.length > 0 && spawn.renewQueue[0] === this.id) {
        if (this.moveByFlowField(this.room.turnCache.structure.spawns[0]) !== -1) {
            this.room.turnCache.structure.spawns[0].renewCreep(this);
        }
        if (this.ticksToLive as number + Math.floor(600 / this.body.length) > 1500) {
            spawn.renewQueue.shift();
            return false;
        }
        return true;
    } else {
        return false;
    }
}

Creep.prototype.actHarvest = function () {
    const mySource = Game.getObjectById(this.memory.workplace) as Source
    mySource.memory.status.assignedHarvester++

    let target = Game.getObjectById(this.memory.currentTarget) as Source | StructureSpawn | StructureContainer | StructureExtension;

    if (this.moveByFlowField(target) !== -1) {
        if (this.memory.movingToWorkplace) {
            this.harvest(target as Source);
        } else {
            target = target as StructureSpawn | StructureContainer | StructureExtension
            if (this.transfer(target, RESOURCE_ENERGY) === 0) {
                (Game.getObjectById(this.memory.workplace) as Source).updateStatistics(Math.min((target as StructureSpawn).energyCapacity - (target as StructureSpawn).energy, this.carry[RESOURCE_ENERGY]));
            }
            if (this.ticksToLive as number + Math.floor(600 / this.body.length) < 1500 && !(target as StructureSpawn).spawning) {
                (target as StructureSpawn).renewCreep(this);
            }
        }

        const carrySum = _.sum(this.carry)
        if (this.memory.movingToWorkplace && this.carryCapacity === carrySum) {
            this.memory.movingToWorkplace = false
            this.memory.currentTarget = this.getDropoff(RESOURCE_ENERGY);
        } else if (!this.memory.movingToWorkplace && 0 === _.sum(this.carry)) {
            this.memory.movingToWorkplace = true;
            this.memory.currentTarget = this.memory.workplace;
        }
    }
}

Creep.prototype.getDropoff = function (type) {
    const site = this.room.turnCache.structure.energyDropoff[0];
    return site.id;
}

Creep.prototype.getStorage = function (type) {
    const site = this.room.turnCache.structure.energyDropoff[0];
    return site.id;
}

Creep.prototype.moveByFlowField = function (target: Source | StructureSpawn | StructureContainer | StructureExtension) {
    const flowQueue = target.pos.getFlowFieldList(target.memory.navigation.flowFieldQueue, target.memory.navigation.flowField, this.pos);
    if (flowQueue[0].dist !== 1) {
        let lastEntryCost = 0;
        let sameCostField = [] as FlowFieldEntry[];
        for (const queueEntry of flowQueue) {
            let next = this.pos.getNeighbour(queueEntry.dir);
            if (queueEntry.cost === lastEntryCost) {
                if (next !== undefined && next.isFreeToWalk() && this.room.turnCache.creepMoveTargets[next.x][next.y] === 0) {
                    sameCostField.push(queueEntry)
                }
            } else {
                if (sameCostField.length > 0) {
                    break;
                } else {
                    sameCostField = [] as FlowFieldEntry[];
                    if (next !== undefined && next.isFreeToWalk() && this.room.turnCache.creepMoveTargets[next.x][next.y] === 0) {
                        sameCostField.push(queueEntry)
                    }
                }
            }
            lastEntryCost = queueEntry.cost;
        }
        if (sameCostField.length !== 0) {
            const idx = Math.floor(Math.random() * sameCostField.length);
            const next = this.pos.getNeighbour(sameCostField[idx].dir) as RoomPosition;
            const moveStatus = this.move(sameCostField[idx].dir);
            if (moveStatus === 0) {
                this.room.turnCache.creepMoveTargets[next.x][next.y]++;
            }
            return -1
        } else {
            return -1
        }

    }
    return 0
}
