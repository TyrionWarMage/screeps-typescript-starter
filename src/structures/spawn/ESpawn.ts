import { Worktype } from "../../utils/Constants"

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
    spawnQueue: {
        configurable: true,
        get() {
            return this.memory.spawnQueue;
        },
        set(value) {
            this.memory.spawnQueue = value;
        }
    },
    renewQueue: {
        configurable: true,
        get() {
            return this.memory.renewQueue;
        },
        set(value) {
            this.memory.renewQueue = value;
        }
    }
});

StructureSpawn.prototype.initMemory = function () {
    const flowFieldQueue = new Array();

    const flowField = new Array<FlowFieldEntry[][]>(50);
    for (let i = 0; i < 50; i++) {
        flowField[i] = new Array<FlowFieldEntry[]>(50);
        for (let j = 0; j < 50; j++) {
            flowField[i][j] = new Array<FlowFieldEntry>();
        }
    }

    this.memory.navigation = {
        flowField: flowField,
        flowFieldQueue: flowFieldQueue,
        freeNeighbours: this.pos.getWalkableNeighbours().length,
    };
    this.memory.spawnQueue = [];
    this.memory.renewQueue = [];

    for (const source of this.room.find(FIND_SOURCES) as Source[]) {
        this.pos.getFlowFieldList(this.memory.navigation.flowFieldQueue, this.memory.navigation.flowField, source.pos);
    }

    this.initiated = true;
}

const names1 = ["Jackson", "Aiden", "Liam", "Lucas", "Noah", "Mason", "Jayden", "Ethan", "Jacob", "Jack", "Caden", "Logan", "Benjamin", "Michael", "Caleb", "Ryan", "Alexander", "Elijah", "James", "William", "Oliver", "Connor", "Matthew", "Daniel", "Luke", "Brayden", "Jayce", "Henry", "Carter", "Dylan", "Gabriel", "Joshua", "Nicholas", "Isaac", "Owen", "Nathan", "Grayson", "Eli", "Landon", "Andrew", "Max", "Samuel", "Gavin", "Wyatt", "Christian", "Hunter", "Cameron", "Evan", "Charlie", "David", "Sebastian", "Joseph", "Dominic", "Anthony", "Colton", "John", "Tyler", "Zachary", "Thomas", "Julian", "Levi", "Adam", "Isaiah", "Alex", "Aaron", "Parker", "Cooper", "Miles", "Chase", "Muhammad", "Christopher", "Blake", "Austin", "Jordan", "Leo", "Jonathan", "Adrian", "Colin", "Hudson", "Ian", "Xavier", "Camden", "Tristan", "Carson", "Jason", "Nolan", "Riley", "Lincoln", "Brody", "Bentley", "Nathaniel", "Josiah", "Declan", "Jake", "Asher", "Jeremiah", "Cole", "Mateo", "Micah", "Elliot"]
const names2 = ["Sophia", "Emma", "Olivia", "Isabella", "Mia", "Ava", "Lily", "Zoe", "Emily", "Chloe", "Layla", "Madison", "Madelyn", "Abigail", "Aubrey", "Charlotte", "Amelia", "Ella", "Kaylee", "Avery", "Aaliyah", "Hailey", "Hannah", "Addison", "Riley", "Harper", "Aria", "Arianna", "Mackenzie", "Lila", "Evelyn", "Adalyn", "Grace", "Brooklyn", "Ellie", "Anna", "Kaitlyn", "Isabelle", "Sophie", "Scarlett", "Natalie", "Leah", "Sarah", "Nora", "Mila", "Elizabeth", "Lillian", "Kylie", "Audrey", "Lucy", "Maya", "Annabelle", "Makayla", "Gabriella", "Elena", "Victoria", "Claire", "Savannah", "Peyton", "Maria", "Alaina", "Kennedy", "Stella", "Liliana", "Allison", "Samantha", "Keira", "Alyssa", "Reagan", "Molly", "Alexandra", "Violet", "Charlie", "Julia", "Sadie", "Ruby", "Eva", "Alice", "Eliana", "Taylor", "Callie", "Penelope", "Camilla", "Bailey", "Kaelyn", "Alexis", "Kayla", "Katherine", "Sydney", "Lauren", "Jasmine", "London", "Bella", "Adeline", "Caroline", "Vivian", "Juliana", "Gianna", "Skyler", "Jordyn"]

function getRandomName(prefix: string) {
    let name;
    let isNameTaken;
    let tries = 0;
    do {
        const nameArray = Math.random() > .5 ? names1 : names2;
        name = nameArray[Math.floor(Math.random() * nameArray.length)];

        if (tries > 3) {
            name += nameArray[Math.floor(Math.random() * nameArray.length)];
        }

        tries++;
        isNameTaken = Game.creeps[name] !== undefined;
    } while (isNameTaken);

    return prefix + " " + name;
}

StructureSpawn.prototype.processTask = function (buildTask: CreepBuildStep) {
    if (buildTask.creepType === Worktype.HARVEST) {
        const modules = this.room.memory.unitConfiguration.configurations.perSource[(buildTask as HarvesterCreepBuildStep).source].current.modules;
        const name = getRandomName("Harvester")
        const src = (Game.getObjectById((buildTask as HarvesterCreepBuildStep).source) as Source);
        src.updateStatistics(0);
        console.log(this + ":Building harvester " + (src.memory.status.assignedHarvester + 1) + "/" + src.memory.status.maxHarvester + " for " + src);
        this.spawnCreep(modules, name, {
            memory: {
                workType: Worktype.HARVEST,
                currentTarget: (buildTask as HarvesterCreepBuildStep).source,
                movingToWorkplace: true,
                workplace: (buildTask as HarvesterCreepBuildStep).source
            }
        });
    }
}

StructureSpawn.prototype.init = function () {
    this.spawnQueue = []
    this.initMemory();
}

StructureSpawn.prototype.isAvailable = function () {
    return this.spawnQueue.length === 0 && !this.spawning
}

StructureSpawn.prototype.preTask = () => {
    return
}

StructureSpawn.prototype.postTask = () => {
    return
}

StructureSpawn.prototype.act = function () {
    if (!this.initiated) {
        this.init();
    }
    if (!this.spawning && this.spawnQueue.length > 0 && this.spawnQueue[0].cost < this.room.energyAvailable && this.renewQueue.length === 0) {
        this.processTask(this.spawnQueue.shift() as CreepBuildStep);
    }
}
