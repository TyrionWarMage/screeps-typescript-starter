interface ControllerStatusMemory {
    hasRoad: boolean;
    nextContainer: string | undefined;
    assignedUpgrader: number;
    maxUpgrader: number;
}
interface ControllerMemory {
    navigation: NavigationMemory;
    initiated: boolean;
    status: ControllerStatusMemory
}

interface StructureController {
    initiated: boolean;
    memory: ControllerMemory;
    init(): void;
}

