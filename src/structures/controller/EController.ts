Object.defineProperties(StructureController.prototype, {
    memory: {
        configurable: true,
        get() {
            return Memory.controller[this.id];
        },
        set(value) {
            Memory.controller[this.id] = value;
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

StructureController.prototype.init = function () {
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
            assignedUpgrader: 0,
            maxUpgrader: 0,
            hasRoad: false,
            nextContainer: undefined,
        },
    }
}

