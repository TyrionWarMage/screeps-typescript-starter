interface RoomTask extends Task {
    act(room: Room): void;
}

interface Room {
    initiated: boolean;
    tasks: RoomTask[];
    turnCache:
    {
        creeps:
        {
            my: Creep[],
            enemy: Creep[]
        },
        environment:
        {
            sources: Source[]
        },
        structure:
        {
            controller: StructureController,
            spawns: StructureSpawn[]
        }
    }
    project: Project;

    preTask(): void;
    postTask(): void;
    initSources(): void;
    initController(): void;
    init(): void;
    act(): void;

    setTurnCache(): void;
    determineNextProject(): void;
}

interface Project {
    name: string;
    waitfor: { [id: string]: boolean }
}

interface RoomMemory {
    initiated: boolean;
    tasks: RoomTask[];
    project: Project;
}

