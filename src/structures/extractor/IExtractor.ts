interface ExtractorStatusMemory {
    hasRoad: boolean;
    nextContainer: string | undefined;
    assignedMiner: number;
    maxMiner: number;

}
interface ExtractorMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: ExtractorStatusMemory
}

interface StructureExtractor {
    initiated: boolean;
    memory: ExtractorMemory;
    init(): void;
}

