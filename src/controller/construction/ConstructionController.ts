export class ConstructionController {
    private room: Room;
    private withoutCreepsCostMatrix: CostMatrix;

    constructor(room: Room) {
        this.room = room;
        this.withoutCreepsCostMatrix = new PathFinder.CostMatrix;
        this.room.find(FIND_STRUCTURES).forEach((struct) => {
            if ((struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my || !struct.isPublic)
                && struct.structureType !== STRUCTURE_ROAD) {
                this.withoutCreepsCostMatrix.set(struct.pos.x, struct.pos.y, 0xff);
            }
        });
    }

    public init() {
        return
    }

    public createRoadProject(from: RoomPosition, to: RoomPosition, worker: UnitConfig) {
        const path = PathFinder.search(from, to, {
            roomCallback: (roomName) => {
                return this.withoutCreepsCostMatrix;
            }
        });
        path.path.filter((pos) => {
            return pos.lookFor(LOOK_STRUCTURES).filter((struct) => struct.structureType === STRUCTURE_ROAD).length === 0;
        });
    }

}
