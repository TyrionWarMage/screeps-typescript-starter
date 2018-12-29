interface ExtensionStatusMemory {
    hasRoad: boolean
}
interface ExtensionMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: ExtensionStatusMemory
}

interface StructureExtension {
    initiated: boolean;
    memory: ExtensionMemory;
    init(): void;
}

