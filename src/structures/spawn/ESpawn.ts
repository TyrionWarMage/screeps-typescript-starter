import { AActor } from "utils/AClasses";

Object.defineProperties(StructureSpawn.prototype, {
    initiated: {
        configurable: true,
        get() {
            return this.memory.initiated;
        },
        set(value) {
            this.memory.initiated = value;
        }        
    },
    role: {
        configurable: true,
        get() {
            return this.memory.role;
        },
        set(value) {
            this.memory.role = value;
        },
    },
    tasks: {
        configurable: true,
        get() {
            return this.memory.tasks;
        },
        set(value) {
            this.memory.tasks = value;
        }    
    }
});

StructureSpawn.prototype.initMemory = function() {
    this.memory.navigation = {flowField: this.pos.computeFlowField(),
                            freeNeighbours: this.pos.getWalkableNeighbours().length,
                            };
    this.memory.objects = {creeps: {},
                            structures: {}
                            };
    this.initiated = true;
}

StructureSpawn.prototype.init = function() {
    this.tasks = [];
    this.initMemory();
}

StructureSpawn.prototype.preTask = () => {
    return
}

StructureSpawn.prototype.postTask = () => {
    return
}

StructureSpawn.prototype.act = AActor.prototype.act