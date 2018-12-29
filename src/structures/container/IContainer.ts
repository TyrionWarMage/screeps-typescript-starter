interface ContainerStatusMemory {
    assignedCarry: number;

}
interface ContainerMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: ContainerStatusMemory
}

interface StructureContainer {
    initiated: boolean;
    memory: ContainerMemory;
    init(): void;
}

