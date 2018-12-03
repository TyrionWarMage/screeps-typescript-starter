Memory.sources = {}

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

Source.prototype.init = function() {
    this.memory = {navigation:
            {flowField: this.pos.computeFlowField(),
            freeNeighbours: this.pos.getWalkableNeighbours().length
            },
            initiated: true
        }
}
