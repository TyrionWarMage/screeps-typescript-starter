interface SourceMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: {
        hasRoad: boolean;
        nextContainer: string | undefined;
        assignedHarvester: number;
        maxHarvester: number;
    }
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

