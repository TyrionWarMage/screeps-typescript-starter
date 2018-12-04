import { EconomyController } from "controller/economy/EconomyController";

Object.defineProperties(Room.prototype, {
    initiated: {
        configurable: true,
        get() {
            return this.memory.initiated;
        },
        set(value) {
            this.memory.initiated = value;
        }
    },
    project: {
        configurable: true,
        get() {
            return this.memory.project;
        },
        set(value) {
            this.memory.project = value;
        }
    }
});

Room.prototype.initSources = function () {
    if (Memory.sources === undefined) {
        Memory.sources = {}
    }
    for (const source of this.find(FIND_SOURCES)) {
        source.init()
    }
}

Room.prototype.initController = function () {
    const ecoControl = new EconomyController(this);
    ecoControl.init();
}

Room.prototype.init = function () {
    this.memory.project = {
        name: 'Init',
        constructionSteps: [],
        spawnSteps: []
    }
    this.initSources();
    this.initController();

    this.initiated = true;
}

Room.prototype.checkProject = function () {
    let isProjectRunning = this.turnCache.structure.constructionSites.length > 0;
    if (!isProjectRunning) {
        for (const spawn of this.turnCache.structure.spawns) {
            if (!spawn.isAvailable()) {
                isProjectRunning = true;
                break;
            }
        }
    }
    if (!isProjectRunning) {
        this.determineNextProject();
    }
}

Room.prototype.setTurnCache = function () {
    this.turnCache = {
        creeps:
            { my: this.find(FIND_MY_CREEPS), enemy: this.find(FIND_HOSTILE_CREEPS) },
        environment:
            { sources: this.find(FIND_SOURCES) },
        structure:
        {
            controller: this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTROLLER } })[0] as StructureController,
            spawns: this.find(FIND_MY_SPAWNS) as StructureSpawn[],
            constructionSites: this.find(FIND_MY_CONSTRUCTION_SITES)
        }
    };
}

Room.prototype.act = function () {
    if (!this.initiated) {
        this.init()
    } else {
        this.setTurnCache();
        this.checkProject();
    }
}

Room.prototype.determineNextProject = function () {
    const ecoControl = new EconomyController(this);
    this.project = ecoControl.getProject();
    console.log(this + ":" + this.project.name)
    this.turnCache.structure.spawns[0].memory.spawnQueue = this.turnCache.structure.spawns[0].memory.spawnQueue.concat(this.project.spawnSteps)
}

