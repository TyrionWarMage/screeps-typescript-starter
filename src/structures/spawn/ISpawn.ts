interface StructureSpawn {
    initiated: boolean;
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
    initiated: boolean;
    spawnQueue: CreepBuildStep[];
    renewQueue: String[];
    navigation: NavigationMemory;
}

