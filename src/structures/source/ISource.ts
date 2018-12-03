interface SourceMemory {
    navigation: NavigationMemory;
    initiated: boolean;
}

interface Source {
    initiated: boolean;
    memory: SourceMemory;
    init(): void;
}

