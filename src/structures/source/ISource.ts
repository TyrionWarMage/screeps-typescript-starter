interface SourceStatusMemory {
    hasRoad: boolean;
    nextContainer: string | undefined;
    assignedHarvester: number;
    maxHarvester: number;

}
interface SourceMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: SourceStatusMemory
    statistics: {
        times: number[];
        amounts: number[];
    }
}

interface Source {
    initiated: boolean;
    memory: SourceMemory;
    init(): void;
    computeMaxHarvesters(config: UnitConfig): void;
    updateStatistics(amount: number): void;
}

