export class PlanState implements PlanStateInterface {
    public spawn: SpawnStatusMemory;
    public sources: { [id: string]: SourceStatusMemory };
    public throughput: number;
    public elapsedTime: number;
    public unitConfigurations: AllUnitConfigurations

    constructor(spawn: SpawnStatusMemory, sources: { [id: string]: SourceStatusMemory }, unitConfigurations: AllUnitConfigurations, throughput: number, elapsedTime: number) {
        this.spawn = spawn;
        this.sources = sources;
        this.throughput = throughput;
        this.elapsedTime = elapsedTime;
        this.unitConfigurations = unitConfigurations;
    }

    getValue(): number {
        return this.throughput
    }

    copy(): PlanState {
        return new PlanState(JSON.parse(JSON.stringify(this.spawn)), JSON.parse(JSON.stringify(this.sources)), JSON.parse(JSON.stringify(this.unitConfigurations)), this.throughput, this.elapsedTime)
    }
}

export class HarvesterBuildAction implements PlanAction {
    public steps: MultiStepProject;
    private sourceid: string;
    public name: string;

    constructor(sourceid: string, creepCost: number) {
        this.name = "Build harvester for " + sourceid;
        const step = {
            name: "Build harvester for " + sourceid,
            source: sourceid,
            creepType: Worktype.HARVEST,
            cost: creepCost
        };
        this.steps = {
            name: step.name,
            spawnSteps: [step],
            constructionSteps: [],
            finalize: Finalize.NO_FINALIZE,
            finalizeData: undefined
        };
        this.sourceid = sourceid;
    }

    public isApplicable(state: PlanState): boolean {
        return state.sources[this.sourceid].maxHarvester > state.sources[this.sourceid].assignedHarvester;
    }

    public update(state: PlanState, unitController: UnitConfigurationControllerInterface) {
        const unitConfig = state.unitConfigurations.perSource[this.sourceid][state.unitConfigurations.perSource[this.sourceid].length - 1];
        const duration = Math.floor(unitConfig.cost / state.throughput);

        state.elapsedTime += duration;
        state.sources[this.sourceid].assignedHarvester += 1;
        state.throughput += unitConfig.throughput;

        return state
    }
}

export class BuilderBuildAction implements PlanAction {
    public steps: MultiStepProject;
    public name: string;

    constructor(creepCost: number) {
        this.name = "Build builder";
        const step = {
            name: "Build builder",
            creepType: Worktype.BUILD,
            cost: creepCost
        };
        this.steps = {
            name: step.name,
            spawnSteps: [step],
            constructionSteps: [],
            finalize: Finalize.NO_FINALIZE,
            finalizeData: undefined
        };
    }

    public isApplicable(state: PlanState): boolean {
        return true;
    }

    public update(state: PlanState, unitController: UnitConfigurationControllerInterface) {
        const unitConfig = state.unitConfigurations[Worktype.BUILD][state.unitConfigurations[Worktype.BUILD].length - 1];
        const duration = Math.floor(unitConfig.cost / state.throughput);

        state.elapsedTime += duration;
        state.spawn.availableBuilder += 1;

        return state
    }
}

export class TargetedRoadBuildProject implements PlanAction {
    public steps: MultiStepProject;
    public name: string;
    private targetid: string;

    constructor(targetid: string, buildLocations: RoomPosition[]) {
        this.name = "Build road for " + targetid;
        const constructionSteps = buildLocations.map((x) => {
            const step = {
                name: "Build road at " + x,
                buildLocation: x,
                buildType: STRUCTURE_ROAD
            };
            return step;
        });
        this.steps = {
            name: "Build road for " + targetid,
            spawnSteps: [],
            constructionSteps: constructionSteps,
            finalize: Finalize.BUILD_TARGETED_ROAD,
            finalizeData: targetid
        };
        this.targetid = targetid;
    }


    public isApplicable(state: PlanStateInterface): boolean {
        return !state.sources[this.targetid].hasRoad && state.spawn.availableBuilder > 0;
    }

    public computeSteps() {

    }

    public update(state: PlanStateInterface, unitController: UnitConfigurationControllerInterface): PlanStateInterface {
        state.sources[this.targetid].hasRoad = true

        const unitConfig = state.unitConfigurations[Worktype.BUILD][0];
        state.throughput += (unitConfig.throughputRoad - unitConfig.throughput) * (Game.getObjectById(this.targetid) as Source).memory.status.assignedHarvester

        return state
    }
}
