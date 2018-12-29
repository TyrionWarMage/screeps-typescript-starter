interface PlanStateInterface {
    spawn: SpawnStatusMemory;
    sources: { [id: string]: SourceStatusMemory };
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
    constructionSteps: StructureConstructionStep[];
    spawnSteps: CreepBuildStep[];
    finalize: any;
    finalizeData: any;
}

interface CreepBuildStep extends Project {
    creepType: number;
    cost: number;
}

interface StructureConstructionStep extends Project {
    buildLocation: RoomPosition;
    buildType: STRUCTURE_ROAD | STRUCTURE_CONTAINER;
}

interface HarvesterCreepBuildStep extends CreepBuildStep, Project {
    source: string;
}
