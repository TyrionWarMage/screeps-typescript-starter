interface CreepMemory {
    workType: number,
    workplace: string;
    currentTarget: string,
    movingToWorkplace: boolean,
    version: number,
}

interface Creep {
    act(): void;
    actHarvest(): void;
    actRepair(): void;
    actBuild(): void;
    actCarry(): void;
    actUpgrade(): void;
    checkRenew(): boolean;
    moveByFlowField(target: Source | StructureSpawn | StructureContainer | StructureExtension): number;
    getDropoff(type: RESOURCE_ENERGY): string;
    getStorage(type: RESOURCE_ENERGY): string;
}
