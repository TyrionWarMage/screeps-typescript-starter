interface RoomPosition {
    computeFlowField(neighbourIsZero?: boolean, maxCost?: number): FlowFieldEntry[][][];
    isWalkable(): boolean;
    isFreeToWalk(): boolean;
    getNeighbour(dir: number): RoomPosition | undefined;
    getNeighbours(): RoomPosition[];
    getPathCost(): number;
    getWalkableNeighbours(): RoomPosition[];
}
