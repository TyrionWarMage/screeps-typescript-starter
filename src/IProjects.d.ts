interface PlanStateInterface {
    sources: { [id: string]: SourceMemory };
    throughput: number;
    elapsedTime: number;
    unitConfigurations: AllUnitConfigurations;

    getValue(): number;

    copy(): PlanStateInterface;
}

interface PlanAction {
    isApplicable(state: PlanStateInterface): boolean;
    update(state: PlanStateInterface): PlanStateInterface;
    steps: MultiStepProject;
    name: string;
}

interface Project {
    name: string;
}

interface MultiStepProject extends Project {
    constructionSteps: MultiStepProject[];
    spawnSteps: CreepBuildStep[];
}

interface CreepBuildStep extends Project {
    creepType: number;
    cost: number;
}

interface HarvesterCreepBuildStep extends CreepBuildStep, Project {
    source: string;
}
