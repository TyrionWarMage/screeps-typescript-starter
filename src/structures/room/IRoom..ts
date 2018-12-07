interface Room {
    initiated: number;
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
            constructionSites: ConstructionSite[]
            energyDropoff: StructureSpawn[]
        }
        creepTargets: number[][];
    }
    project: MultiStepProject;

    initSources(): void;
    initController(): void;
    init(): void;
    act(): void;

    setTurnCache(): void;
    determineNextProject(): void;
    checkProject(): void;
}

interface RoomMemory {
    initiated: number;
    project: MultiStepProject;
}

