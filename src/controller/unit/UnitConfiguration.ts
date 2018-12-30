import { Constants } from "utils/Constants"
import { Finalize, Worktype } from "Enums";

function determineBodyCost(parts: BodyPartConstant[]) {
    let cost = 0;
    parts.forEach((ident) => {
        cost += BODYPART_COST[ident];
    });
    return cost;
}


export class UnitConfigurationController implements UnitConfigurationControllerInterface {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    private getEmptyConfig() {
        const config = {
            modules: [] as BodyPartConstant[],
            cost: 0,
            throughput: 0,
            throughputRoad: 0,
            throughputShort: 0,
            workTime: 0,
            travelTime: 0,
            version: 0
        }
        return config;
    }

    public init() {
        this.room.memory.unitConfiguration = { configurations: { perSource: {} }, lastEnergyValue: 0 };
        for (const source of this.room.find(FIND_SOURCES) as Source[]) {
            this.room.memory.unitConfiguration.configurations.perSource[source.id] = [this.getEmptyConfig()]
        }
        this.room.memory.unitConfiguration.configurations[Worktype.BUILD] = [this.getEmptyConfig()];
        this.room.memory.unitConfiguration.configurations[Worktype.CARRY] = [this.getEmptyConfig()];
    }

    public approximateWork(parts: BodyPartConstant[], workPerTick: number, travelDist: number, travelCost: number) {
        let carry = 0;
        let work = 0;
        let move = 0;
        parts.forEach((part) => {
            if (part === CARRY) { carry++; }
            else if (part === WORK) { work++; }
            else if (part === MOVE) { move++; }
        });
        const workTime = (carry * 50) / (work * workPerTick);
        const terrainFactor = travelCost / travelDist;
        const emptyTravelTime = travelDist * Math.ceil(terrainFactor * work / move);
        const fullTravelTime = travelDist * Math.ceil(terrainFactor * (work + carry) / move);
        const fullTime = workTime + emptyTravelTime + fullTravelTime;
        return [(carry * 50) / fullTime, workTime, (emptyTravelTime + fullTravelTime)];
    }

    private getWorkOptions(creepType: Worktype) {
        const workoptions = new Array<BodyPartConstant[]>();
        switch (creepType) {
            case (Worktype.HARVEST):
                workoptions.push([WORK, WORK, MOVE]);
                workoptions.push([WORK, CARRY, MOVE]);
                workoptions.push([CARRY, CARRY, MOVE]);
                workoptions.push([WORK, MOVE, MOVE]);
                workoptions.push([CARRY, MOVE, MOVE]);
                break;
            case (Worktype.BUILD):
                workoptions.push([WORK, WORK, MOVE]);
                workoptions.push([WORK, CARRY, MOVE]);
                workoptions.push([CARRY, CARRY, MOVE]);
                workoptions.push([WORK, MOVE, MOVE]);
                workoptions.push([CARRY, MOVE, MOVE]);
                break;
            case (Worktype.CARRY):
                workoptions.push([CARRY, CARRY, MOVE]);
                workoptions.push([CARRY, MOVE, MOVE]);
                break;
        }
        return workoptions;
    }

    public computeCarry(allConfigs: AllUnitConfigurations) {
        // ToDo
    }

    public computeBuilder(allConfigs: AllUnitConfigurations) {
        const newEntry = this.computeWorker(Worktype.BUILD, 1, this.room.energyCapacityAvailable, Constants.BUILDER_TRAVEL_DIST, Constants.BUILDER_TRAVEL_COST)
        newEntry.version = allConfigs[Worktype.BUILD][allConfigs[Worktype.BUILD].length - 1].version + 1;
        allConfigs[Worktype.BUILD].push(newEntry)
    }

    public computeHarvesterForSource(allConfigs: AllUnitConfigurations, sourceMemory: SourceMemory, sourcePos: RoomPosition, sourceid: string) {
        const spawn = this.room.turnCache.structure.spawns[0];
        const flowFieldEntry = sourcePos.getFlowFieldList(sourceMemory.navigation.flowFieldQueue, sourceMemory.navigation.flowField, spawn.pos)[0]
        const newEntry = this.computeWorker(Worktype.HARVEST, 2, this.room.energyCapacityAvailable, flowFieldEntry.dist, flowFieldEntry.cost)
        if (!newEntry.modules.equal(allConfigs.perSource[sourceid][allConfigs.perSource[sourceid].length - 1].modules)) {
            newEntry.version = allConfigs.perSource[sourceid][allConfigs.perSource[sourceid].length - 1].version + 1;
            allConfigs.perSource[sourceid].push(newEntry);
        }
    }

    public computeAllConfigurations(unitCfg: { configurations: AllUnitConfigurations, lastEnergyValue: number }) {
        if (this.room.memory.unitConfiguration.lastEnergyValue !== this.room.energyCapacityAvailable) {

            this.computeBuilder(unitCfg.configurations);
            for (const source of this.room.turnCache.environment.sources) {
                this.computeHarvesterForSource(unitCfg.configurations, source.memory, source.pos, source.id);
            }

            console.log(this.room + ':Recomputed unit configurations for ' + this.room.memory.unitConfiguration.lastEnergyValue + ' => ' + this.room.energyCapacityAvailable)
            unitCfg.lastEnergyValue = this.room.energyCapacityAvailable;
        }
    }

    public removeConfiguration(type: Worktype, version: number, sourceid?: string) {
        let configs;
        if (type === Worktype.HARVEST && sourceid !== undefined) {
            configs = this.room.memory.unitConfiguration.configurations.perSource[sourceid]
        } else {
            configs = this.room.memory.unitConfiguration.configurations[type]
        }
        for (let i = configs.length - 1; i >= 0; i--) {
            if (configs[i].version === version) {
                delete configs[i]
            }
        }
    }

    public computeWorker(creepType: Worktype, workPerTick: number, maxValue: number, travelDist: number, travelCost: number) {
        let work = [WORK, CARRY, MOVE] as BodyPartConstant[];
        let workCost = determineBodyCost(work);
        let lastAdd = 0;

        const workoptions = this.getWorkOptions(creepType);
        const workoptioncost = [];


        for (const option of workoptions) {
            workoptioncost.push(determineBodyCost(option));
        }

        let lastapproxWork = 0;
        let approxWork = 0;
        while (workCost < maxValue) {
            let maxWork = 0;
            let best = 0;
            let tmpWork = work;
            lastapproxWork = approxWork;
            for (let optionIdx = 0; optionIdx < workoptions.length; optionIdx++) {
                tmpWork = work.concat(workoptions[optionIdx]);
                approxWork = this.approximateWork(tmpWork, workPerTick, travelDist - 1, travelCost - 1)[0];
                if (approxWork > maxWork) {
                    best = optionIdx;
                    maxWork = approxWork;
                    lastAdd = workoptions[optionIdx].length;
                }
            }
            workCost += workoptioncost[best];
            work = work.concat(workoptions[best]);
            if (creepType === Worktype.HARVEST && lastapproxWork > 11) {
                break;
            }
        }

        work.splice(-1 * lastAdd, lastAdd);
        const approxCost = determineBodyCost(work);
        const approxWorkEntry = this.approximateWork(work, workPerTick, travelDist - 1, travelCost - 1);
        work.sort();

        const approxShortTravelWorkEntry = this.approximateWork(work, workPerTick, 4, travelCost / travelDist * 4 - 1);
        const approxRoadTravelEntry = this.approximateWork(work, workPerTick, travelDist - 1, travelDist * 0.5 - 0.5);

        return {
            modules: work,
            cost: approxCost,
            throughput: approxWorkEntry[0],
            throughputRoad: approxRoadTravelEntry[0],
            throughputShort: approxShortTravelWorkEntry[0],
            workTime: approxWorkEntry[1],
            travelTime: approxWorkEntry[2],
            version: 0
        }
    }
}
