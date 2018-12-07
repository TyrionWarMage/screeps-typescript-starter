import { Worktype } from "../utils/Constants";

export class PlanState implements PlanStateInterface {
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
}

export class HarvesterBuildAction implements PlanAction {
    public steps: MultiStepProject;
    private sourceid: string;
    public name: string;
    public value: number;

    constructor(sourceid: string, value: number, creepCost: number) {
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
        this.value = value;
    }

    public isApplicable(state: PlanState): boolean {
        return state.sources[this.sourceid].status.maxHarvester > state.sources[this.sourceid].status.assignedHarvester;
    }

    public update(state: PlanState) {
        const newState = JSON.parse(JSON.stringify(state)) as PlanState;

        const unitConfig = state.unitConfigurations.perSource[this.sourceid].current;
        const duration = unitConfig.cost / state.throughput;

        newState.elapsedTime = + duration;
        newState.sources[this.sourceid].status.assignedHarvester = + 1;
        newState.throughput += unitConfig.throughput;

        return newState
    }


}
