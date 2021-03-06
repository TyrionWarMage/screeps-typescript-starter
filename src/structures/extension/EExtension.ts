Object.defineProperties(StructureExtension.prototype, {
    memory: {
        configurable: true,
        get() {
            return Memory.extension[this.id];
        },
        set(value) {
            Memory.extension[this.id] = value;
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

StructureExtension.prototype.init = function () {
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
            freeNeighbours: this.pos.getWalkableNeighbours().length,
            isValid: false
        },
        initiated: true,
        status: {
            hasRoad: false
        },
    }
}

