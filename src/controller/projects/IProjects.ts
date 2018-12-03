import { Worktype } from "utils/Constants"

export interface Project {
    name: string;
    cost: number;
}

export interface EconomyProject extends Project {
    expectedThroughputIncrease: number;
}

export interface MultiStepEconomyProject extends EconomyProject {
    constructionSteps: EconomyProject[];
    spawnSteps: EconomyProject[];
}

export interface CreepBuildStep extends Project {
    creepType: Worktype;
}

export interface HarvesterCreepBuildStep extends CreepBuildStep, EconomyProject {
    source: string;
}
