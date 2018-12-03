import {Worktype,Tasktype} from "utils/Constants"

export interface Project {
    name: string;
    cost: number;
}

export interface EconomyProject {
    expectedThroughputIncrease: number;
}

export interface CreepBuildProject extends Project {
    creepType: Worktype;
}

export interface HarvesterCreepProject extends CreepBuildProject, EconomyProject {
    source: string;
    task: Tasktype;
}
