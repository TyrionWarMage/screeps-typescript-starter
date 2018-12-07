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
    this.memory = {
        navigation:
        {
            flowField: this.pos.computeFlowField(true),
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
    const maxByThroughput = Math.ceil(this.energyCapacity / config.throughput);
    const maxBySlots = this.memory.navigation.freeNeighbours * Math.ceil((config.travelTime + config.workTime) / config.workTime);
    this.memory.status.maxHarvester = Math.min(maxBySlots, maxByThroughput);
}
