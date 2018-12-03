import { AActor } from "utils/AClasses";
import { EconomyController } from "controller/economy/EconomyController";
import { DetermineProjectTask } from "./RoomTasks";

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
    tasks: {
        configurable: true,
        get() {
            return this.memory.tasks;
        },
        set(value) {
            this.memory.tasks = value;
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
    for (const source of this.find(FIND_SOURCES)) {
        source.init()
    }
}

Room.prototype.initController = function () {
    const ecoControl = new EconomyController(this);
    ecoControl.init();
}

Room.prototype.init = function () {
    this.tasks = [];
    this.memory.project = {
        name: 'Init',
        waitfor: {
            spawn: false,
            build: false,
        }
    }
    this.initSources();
    this.initController();

    this.initiated = true;
}

Room.prototype.preTask = function () {
    this.setTurnCache();

    let isProjectRunning = false;
    for (const waitElement in this.project.waitfor) {
        if (this.project.waitfor[waitElement]) {
            isProjectRunning = true;
            break;
        }
    }
    if (!isProjectRunning) {
        this.tasks.push(new DetermineProjectTask());
    }
}

Room.prototype.postTask = () => {
    return
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
            spawns: this.find(FIND_MY_SPAWNS) as StructureSpawn[]
        }
    };
}

Room.prototype.act = AActor.prototype.act

Room.prototype.determineNextProject = function () {
    const ecoControl = new EconomyController(this);
    ecoControl.getProject();
}
