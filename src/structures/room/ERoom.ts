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
    const sources = this.find(FIND_SOURCES)
    if (Game.cpu.bucket > 200 || Game.cpu.bucket === undefined) {
        sources[this.memory.initiated].init();
        this.memory.initiated++;
        if (this.memory.initiated === sources.length) {
            return true;
        }
    }
    return false;
}

Room.prototype.initController = function () {
    const ecoControl = new EconomyController(this);
    ecoControl.init();
}

Room.prototype.init = function () {
    if (this.initiated === undefined) {
        this.memory.project = {
            name: 'Init',
            constructionSteps: [],
            spawnSteps: []
        }
        Memory.sources = {}
        this.initiated = 0;
    } else if (this.initiated !== undefined) {
        if (this.initSources()) {
            this.initController();
            this.initiated = 100;
        }
    }
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
    const spawnSites = this.find(FIND_MY_SPAWNS) as StructureSpawn[];
    const sourceSites = this.find(FIND_SOURCES);

    const creepTargetsInit = new Array<number[]>();
    for (let i: number = 0; i < 50; i++) {
        creepTargetsInit[i] = [];
        for (let j: number = 0; j < 50; j++) {
            creepTargetsInit[i][j] = 0;
        }
    }

    this.turnCache = {
        creeps:
        {
            my: this.find(FIND_MY_CREEPS).sort((n1, n2) => {
                if (n1.memory.movingToWorkplace && !n2.memory.movingToWorkplace) {
                    return 1;
                } else if (!n1.memory.movingToWorkplace && n2.memory.movingToWorkplace) {
                    return -1
                } else {
                    return 0
                }
            })
            , enemy: this.find(FIND_HOSTILE_CREEPS)
        },
        environment:
            { sources: sourceSites },
        structure:
        {
            controller: this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTROLLER } })[0] as StructureController,
            spawns: spawnSites,
            constructionSites: this.find(FIND_MY_CONSTRUCTION_SITES),
            energyDropoff: spawnSites,
        },
        creepTargets: creepTargetsInit,
    };
}

Room.prototype.act = function () {
    if (this.controller && this.controller.my) {
        if (this.initiated === undefined || this.initiated < 100) {
            this.init()
        } else {
            this.setTurnCache();

            for (const source of this.turnCache.environment.sources) {
                source.memory.status.assignedHarvester = 0
            }
            for (const creep of this.turnCache.creeps.my) {
                creep.act();
            }

            this.checkProject();

            if ((Game.time) % 3 === 0) {
                this.printStatistics()
            }
        }
    }
}

Room.prototype.determineNextProject = function () {
    const ecoControl = new EconomyController(this);
    this.project = ecoControl.getProject();
    console.log(this + ":" + this.project.name)
    this.turnCache.structure.spawns[0].memory.spawnQueue = this.turnCache.structure.spawns[0].memory.spawnQueue.concat(this.project.spawnSteps)
}

Room.prototype.printStatistics = function () {
    let expectedTP = 1;
    let observedTP = 1;
    for (const source of this.turnCache.environment.sources) {
        if (source.memory.statistics.amounts.length > 1) {
            source.memory.statistics.amounts.sum = Array.prototype.sum
            observedTP += source.memory.statistics.amounts.sum() / (source.memory.statistics.times[source.memory.statistics.times.length - 1] - source.memory.statistics.times[0]);
        }
        expectedTP += source.memory.status.assignedHarvester * this.memory.unitConfiguration.configurations.perSource[source.id].current.throughput;
    }
    console.log(this + ":" + observedTP.toFixed(2) + "/" + expectedTP.toFixed(2) + " observed/expected energy throughput ");
}

