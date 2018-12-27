import { Constants } from "utils/Constants";

Object.defineProperties(Source.prototype, {
    memory: {
        configurable: true,
        get() {
            return Memory.sources[this.id];
        },
        set(value) {
            Memory.sources[this.id] = value;
        }
    },
    initiated: {
        configurable: true,
        get() {
            return this.memory.initiated;
        },
        set(value) {
            this.memory.initated = value;
        }
    },
});

Source.prototype.init = function () {
    const flowFieldQueue = new Array();

    const flowField = new Array<FlowFieldEntry[][]>(50);
    for (let i = 0; i < 50; i++) {
        flowField[i] = new Array<FlowFieldEntry[]>(50);
        for (let j = 0; j < 50; j++) {
            flowField[i][j] = new Array<FlowFieldEntry>();
        }
    }

    this.memory = {
        navigation:
        {
            flowField: flowField,
            flowFieldQueue: flowFieldQueue,
            freeNeighbours: this.pos.getWalkableNeighbours().length
        },
        initiated: true,
        status: {
            hasRoad: false,
            nextContainer: undefined,
            assignedHarvester: 0,
            maxHarvester: 0
        },
        statistics: {
            times: [],
            amounts: [],
        }
    }
}

Source.prototype.computeMaxHarvesters = function (config: UnitConfig) {
    const maxByThroughput = this.energyCapacity / config.throughput;
    const maxBySlots = this.memory.navigation.freeNeighbours * ((config.travelTime + config.workTime) / config.workTime);
    this.memory.status.maxHarvester = Math.floor(Math.min(maxBySlots, maxByThroughput));
}

Source.prototype.updateStatistics = function (amount: number) {
    this.memory.statistics.amounts.push(amount);
    this.memory.statistics.times.push(Game.time);
    if (this.memory.statistics.amounts.length > Constants.MAX_STATISTICS_LENGTH) {
        this.memory.statistics.amounts.splice(0, 20);
        this.memory.statistics.times.splice(0, 20);
    }
}
