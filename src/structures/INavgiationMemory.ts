interface FlowFieldEntry {
    cost: number;
    dist: number;
    dir: DirectionConstant;
}

interface FlowFieldQueueEntry {
    pos: RoomPosition;
    cost: number;
    heuristic: number;
}
interface NavigationMemory {
    flowField: FlowFieldEntry[][][];
    flowFieldQueue: FlowFieldQueueEntry[];
    freeNeighbours: number;
}
