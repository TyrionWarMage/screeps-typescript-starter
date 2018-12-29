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
            energyDropoff: (StructureSpawn | StructureExtension | StructureContainer)[]
            repairSites: Structure[]
        }
        status:
        {
            decayRate: number
        }
        creepMoveTargets: number[][];
    }
    project: MultiStepProject;

    initSources(): void;
    initController(): void;
    init(): void;
    act(): void;

    setTurnCache(): void;
    determineNextProject(): void;
    computeDecayRate(allRepairableStructures: (StructureContainer | StructureRoad | StructureRampart)[]): number;
    finalizeProject(): void;
    checkProject(): void;
    printStatistics(): void;
}

interface RoomMemory {
    initiated: number;
    project: MultiStepProject;
}

