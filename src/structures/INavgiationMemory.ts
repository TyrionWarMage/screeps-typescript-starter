interface FlowFieldEntry {
    cost: number;
    dist: number;
    dir: number|undefined;
}
interface NavigationMemory {
    flowField: FlowFieldEntry[][][];
    freeNeighbours: number;
}