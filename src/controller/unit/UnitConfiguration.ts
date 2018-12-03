import {Worktype, Tasktype} from "utils/Constants"
import {HarvesterCreepProject} from "../projects/IProjects"

function determineBodyCost(parts: BodyPartConstant[]) {
    let cost=0;
    parts.forEach((ident) => {
        cost+=BODYPART_COST[ident];
    });
    return cost;
}


export class UnitConfigurationController {
    private room:Room;

    constructor(room: Room) {
        this.room=room;
    }

    public init() {
        this.room.memory.unitConfiguration = {configurations: {perSource: {}}, lastEnergyValue: 0};
        for(const source of this.room.find(FIND_SOURCES) as Source[]) {
            this.room.memory.unitConfiguration.configurations.perSource[source.id] = {version: 0, 
                                                                current: 
                                                                    {modules: [] as BodyPartConstant[],
                                                                    cost: 0,
                                                                    throughput: 0,
                                                                    workTime: 0,
                                                                    travelTime: 0},
                                                                next: 
                                                                    {modules: [] as BodyPartConstant[],
                                                                    cost: 0,
                                                                    throughput: 0,
                                                                    workTime: 0,
                                                                    travelTime: 0},
                                                                shortTravel: 
                                                                    {modules: [] as BodyPartConstant[],
                                                                    cost: 0,
                                                                    throughput: 0,
                                                                    workTime: 0,
                                                                    travelTime: 0},
                                                                roadTravel: 
                                                                    {modules: [] as BodyPartConstant[],
                                                                    cost: 0,
                                                                    throughput: 0,
                                                                    workTime: 0,
                                                                    travelTime: 0}
                                                                }
        }
    }

    public approximateWork(parts: BodyPartConstant[], workPerTick: number, travelDist: number, travelCost: number) {
        let carry=0;
        let work=0;
        let move=0;
        parts.forEach((part) => {
            if(part===CARRY) {carry++;}
            else if(part===WORK) {work++;}
            else if(part===MOVE) {move++;}
        });
        const workTime = (carry*50)/(work*workPerTick);
        const terrainFactor = travelCost/travelDist;
        const emptyTravelTime = travelDist * Math.ceil(terrainFactor * work / move);
        const fullTravelTime = travelDist * Math.ceil(terrainFactor * (work+carry) / move);  
        const fullTime = workTime+emptyTravelTime+fullTravelTime;      
        return [(carry*50)/fullTime, workTime, (emptyTravelTime+fullTravelTime)];
    }

    private getWorkOptions(creepType: Worktype) {
        const workoptions= new Array<BodyPartConstant[]>();
        switch(creepType) {
            case(Worktype.HARVEST || Worktype.BUILD):
                workoptions.push([WORK,WORK,MOVE]);
                workoptions.push([WORK,CARRY,MOVE]);
                workoptions.push([CARRY,CARRY,MOVE]);
                workoptions.push([WORK,MOVE,MOVE]);
                workoptions.push([CARRY,MOVE,MOVE]);
                break;
            case(Worktype.CARRY):
                workoptions.push([CARRY,CARRY,MOVE]);
                workoptions.push([CARRY,MOVE,MOVE]);
                break;
        }
        return workoptions;
    }
    
    public getHarvesterProjects() {
        if(this.room.memory.unitConfiguration.lastEnergyValue!==this.room.energyCapacityAvailable) {
            this.computeAllConfigurations()
            console.log(this.room+':Recomputed unit configurations for '+this.room.memory.unitConfiguration.lastEnergyValue+' => '+this.room.energyCapacityAvailable)
            this.room.memory.unitConfiguration.lastEnergyValue = this.room.energyCapacityAvailable;
        }
        const projects = new Array<HarvesterCreepProject>();
        for(const source of this.room.turnCache.environment.sources) {
            const configEntry = this.room.memory.unitConfiguration.configurations.perSource[source.id];
            projects.push({expectedThroughputIncrease: configEntry.current.throughput,
                            cost: configEntry.current.cost,
                            source: source.id,
                            creepType: Worktype.HARVEST,
                            task: Tasktype.CREEP_BUILD,
                            name: "Build harvester for "+source.id})  
            projects.push({expectedThroughputIncrease: configEntry.next.throughput-configEntry.current.throughput,
                            cost: configEntry.next.cost,
                            source: source.id,
                            creepType: Worktype.HARVEST,
                            task: Tasktype.CREEP_UPGRADE,
                            name: "Upgrade harvester for "+source.id})    
            projects.push({expectedThroughputIncrease: configEntry.roadTravel.throughput-configEntry.current.throughput,
                            cost: configEntry.roadTravel.cost,
                            source: source.id,
                            creepType: Worktype.HARVEST,
                            task: Tasktype.CREEP_ROAD,
                            name: "Build roads for "+source.id})  
            projects.push({expectedThroughputIncrease: configEntry.shortTravel.throughput-configEntry.current.throughput,
                            cost: configEntry.shortTravel.cost,
                            source: source.id,
                            creepType: Worktype.HARVEST,
                            task: Tasktype.CREEP_SHORTTRAVEL,
                            name: "Build container and carrys for "+source.id})                              
        }
        return projects;
    }

    public computeAllConfigurations() {
        for(const source of this.room.turnCache.environment.sources) {
            const flowFieldEntry = source.memory.navigation.flowField[this.room.turnCache.structure.spawns[0].pos.x][this.room.turnCache.structure.spawns[0].pos.y][0]
            const newEntry = this.computeWorker(Worktype.HARVEST,2,this.room.energyCapacityAvailable,flowFieldEntry.dist,flowFieldEntry.cost)
            if(!newEntry.current.modules.equal(this.room.memory.unitConfiguration.configurations.perSource[source.id].current.modules)) {
                newEntry.version = this.room.memory.unitConfiguration.configurations.perSource[source.id].version+1
                this.room.memory.unitConfiguration.configurations.perSource[source.id] = newEntry;   
            }
        }
    }

    public computeWorker(creepType: Worktype, workPerTick: number,maxValue: number, travelDist: number,travelCost: number) {
        let work= [WORK,CARRY,MOVE] as BodyPartConstant[];
        let workCost = determineBodyCost(work);
        let lastAdd=0;

        const workoptions= this.getWorkOptions(creepType);
        const workoptioncost=[];


        for(const option of workoptions) {
            workoptioncost.push(determineBodyCost(option));
        }

        let lastapproxWork=0;
        let approxWork=0;
        while(workCost<maxValue) {
            let maxWork=0;
            let best=0;
            let tmpWork = work;
            lastapproxWork=approxWork;
            for(let optionIdx=0; optionIdx < workoptions.length; optionIdx++) {
                tmpWork = work.concat(workoptions[optionIdx]);
                approxWork=this.approximateWork(tmpWork,workPerTick,travelDist,travelCost)[0];
                if(approxWork>maxWork) {
                    best=optionIdx;
                    maxWork=approxWork;
                    lastAdd=workoptions[optionIdx].length;
                }
            }
            workCost+=workoptioncost[best];
            work=work.concat(workoptions[best]);
            if(creepType===Worktype.HARVEST && lastapproxWork>11) {
                break;
            }
        }

        const approxNextCost = determineBodyCost(work);
        const approxNextWorkEntry = this.approximateWork(work,workPerTick,travelDist,travelCost);
        const approxNextWorkModules = work.map(x => Object.assign({}, x));
        approxNextWorkModules.sort();

        work.splice(-1*lastAdd,lastAdd);
        const approxCost = determineBodyCost(work);
        const approxWorkEntry = this.approximateWork(work,workPerTick,travelDist,travelCost);
        work.sort();

        const approxShortTravelWorkEntry = this.approximateWork(work,workPerTick,5,travelCost/travelDist*5);
        const approxRoadTravelEntry = this.approximateWork(work,workPerTick,travelDist,travelDist*0.5);  

        return {version: 0, 
                                                            current: 
                                                                {modules: work,
                                                                cost: approxCost,
                                                                throughput: approxWorkEntry[0],
                                                                workTime: approxWorkEntry[1],
                                                                travelTime: approxWorkEntry[2]},
                                                            next: 
                                                                {modules: approxNextWorkModules,
                                                                cost: approxNextCost,
                                                                throughput: approxNextWorkEntry[0],
                                                                workTime: approxNextWorkEntry[1],
                                                                travelTime: approxNextWorkEntry[2]},
                                                            shortTravel: 
                                                                {modules: work,
                                                                cost: approxCost,
                                                                throughput: approxShortTravelWorkEntry[0],
                                                                workTime: approxShortTravelWorkEntry[1],
                                                                travelTime: approxShortTravelWorkEntry[2]},
                                                            roadTravel: 
                                                                {modules: work,
                                                                cost: approxCost,
                                                                throughput: approxRoadTravelEntry[0],
                                                                workTime: approxRoadTravelEntry[1],
                                                                travelTime: approxRoadTravelEntry[2]},                                                            
                                                        }
    }
}