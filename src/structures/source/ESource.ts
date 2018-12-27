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
        }
    }
}

Source.prototype.computeMaxHarvesters = function (config: UnitConfig) {
    const maxByThroughput = this.energyCapacity / config.throughput;
    const maxBySlots = this.memory.navigation.freeNeighbours * ((config.travelTime + config.workTime) / config.workTime);
    this.memory.status.maxHarvester = Math.floor(Math.min(maxBySlots, maxByThroughput));
    // this.memory.status.maxHarvester = Math.floor((Math.min(maxBySlots, maxByThroughput) - this.memory.navigation.freeNeighbours) * Constants.CROWDING_FACTOR + this.memory.navigation.freeNeighbours);
}
