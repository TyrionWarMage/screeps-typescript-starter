interface StructureSpawn {
    initiated: number;
    spawnQueue: CreepBuildStep[];
    renewQueue: String[];
    preTask(): void;
    postTask(): void;
    init(): void;
    initMemory(): void;
    act(): void;
    isAvailable(): boolean;
    processTask(buildTask: CreepBuildStep): void;
}

interface SpawnMemory {
    initiated: number;
    spawnQueue: CreepBuildStep[];
    renewQueue: String[];
    navigation: NavigationMemory;
}

