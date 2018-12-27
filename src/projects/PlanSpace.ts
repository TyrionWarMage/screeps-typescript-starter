import { Worktype } from "../utils/Constants";

export class PlanState {
    public sources: { [id: string]: SourceMemory };
    public throughput: number;
    public elapsedTime: number;
    public unitConfigurations: AllUnitConfigurations

    constructor(sources: { [id: string]: SourceMemory }, unitConfigurations: AllUnitConfigurations, throughput: number, elapsedTime: number) {
        this.sources = sources;
        this.throughput = throughput;
        this.elapsedTime = elapsedTime;
        this.unitConfigurations = unitConfigurations;
    }

    getValue(): number {
        return this.throughput
    }

    copy(): PlanState {
        return new PlanState(JSON.parse(JSON.stringify(this.sources)), JSON.parse(JSON.stringify(this.unitConfigurations)), this.throughput, this.elapsedTime)
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
            constructionSteps: [] as MultiStepProject[]
        };
        this.sourceid = sourceid;
    }

    public isApplicable(state: PlanState): boolean {
        return state.sources[this.sourceid].status.maxHarvester > state.sources[this.sourceid].status.assignedHarvester;
    }

    public update(state: PlanState) {
        const unitConfig = state.unitConfigurations.perSource[this.sourceid].current;
        const duration = Math.floor(unitConfig.cost / state.throughput);

        state.elapsedTime += duration;
        state.sources[this.sourceid].status.assignedHarvester += 1;
        state.throughput += unitConfig.throughput;

        return state
    }
}
