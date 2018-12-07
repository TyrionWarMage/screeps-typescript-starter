interface CreepMemory {
    workType: number,
    workplace: string;
    currentTarget: string,
    movingToWorkplace: boolean,
}

interface Creep {
    act(): void;
    actHarvest(): void;

    moveByFlowField(target: Source | StructureSpawn): number;
    getDropoff(): string;
}
