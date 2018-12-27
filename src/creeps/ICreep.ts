interface CreepMemory {
    workType: number,
    workplace: string;
    currentTarget: string,
    movingToWorkplace: boolean,
}

interface Creep {
    act(): void;
    actHarvest(): void;
    checkRenew(): boolean;
    moveByFlowField(target: Source | StructureSpawn): number;
    getDropoff(): string;
}
