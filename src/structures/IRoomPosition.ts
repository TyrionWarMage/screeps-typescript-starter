interface RoomPosition {
    computeFlowField(flowFieldQueue: FlowFieldQueueEntry[], flowField: FlowFieldEntry[][][], target: RoomPosition, maxDistToTarget?: number): void;
    getFlowFieldList(flowFieldQueue: FlowFieldQueueEntry[], flowField: FlowFieldEntry[][][], target: RoomPosition): FlowFieldEntry[];
    isWalkable(): boolean;
    isFreeToWalk(): boolean;
    getNeighbour(dir: number): RoomPosition | undefined;
    getNeighbours(): RoomPosition[];
    getPathCost(): number;
    getWalkableNeighbours(): RoomPosition[];
}
