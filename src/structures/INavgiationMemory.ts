interface FlowFieldEntry {
    cost: number;
    dist: number;
    dir: DirectionConstant;
}
interface NavigationMemory {
    flowField: FlowFieldEntry[][][];
    flowFieldQueue: RoomPosition[][];
    freeNeighbours: number;
}
