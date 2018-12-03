interface SpawnTask extends Task {
    act(spawn: StructureSpawn): void;
}

interface StructureSpawn {
    initiated: boolean;
    tasks: SpawnTask[]; 
    preTask(): void;
    postTask(): void;  
    init(): void;
    initMemory(): void;
    act(): void; 
}

interface SpawnMemory {
    initiated: boolean;
    tasks: SpawnTask[];
    navigation: NavigationMemory;
    objects:
        {creeps:
            {[id:number]: string[]}
        structures:
            {[id: number]: string[]}
        }
}

