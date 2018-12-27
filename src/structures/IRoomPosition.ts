interface RoomPosition {
    computeFlowField(flowFieldQueue: RoomPosition[][], flowField: FlowFieldEntry[][][], target: RoomPosition, maxDistToTarget?: number): void;
    getFlowFieldList(flowFieldQueue: RoomPosition[][], flowField: FlowFieldEntry[][][], target: RoomPosition): FlowFieldEntry[];
    isWalkable(): boolean;
    isFreeToWalk(): boolean;
    getNeighbour(dir: number): RoomPosition | undefined;
    getNeighbours(): RoomPosition[];
    getPathCost(): number;
    getWalkableNeighbours(): RoomPosition[];
}
