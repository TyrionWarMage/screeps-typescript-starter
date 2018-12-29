

interface StructureSpawn {
    initiated: number;
    spawnQueue: HarvesterCreepBuildStep[];
    renewQueue: String[];
    repairQueue: String[];
    preTask(): void;
    postTask(): void;
    init(): void;
    initMemory(): void;
    act(): void;
    isAvailable(): boolean;
    processTask(buildTask: CreepBuildStep): void;
}

interface SpawnStatusMemory {
    availableBuilder: number;
    availableCarry: number;
}
interface SpawnMemory {
    initiated: number;
    spawnQueue: CreepBuildStep[];
    renewQueue: String[];
    navigation: NavigationMemory;
    status: SpawnStatusMemory;
}

