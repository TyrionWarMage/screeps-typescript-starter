import { TargetedRoadBuildProject } from "projects/PlanSpace";

export class ConstructionController {
    private room: Room;
    private withoutCreepsAndTerrainCostMatrix: CostMatrix;

    constructor(room: Room) {
        this.room = room;
        this.withoutCreepsAndTerrainCostMatrix = new PathFinder.CostMatrix;
        this.room.find(FIND_STRUCTURES).forEach((struct) => {
            if ((struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my || !struct.isPublic)
                && struct.structureType !== STRUCTURE_ROAD) {
                this.withoutCreepsAndTerrainCostMatrix.set(struct.pos.x, struct.pos.y, 0xff);
            }
        });
    }

    public init() {
        return
    }

    public createSourceRoadProjects() {
        const projects = []
        for (const src of this.room.turnCache.environment.sources) {
            if (!src.memory.status.hasRoad) {
                projects.push(this.createTargetedRoadProject(this.room.turnCache.structure.spawns[0].pos, src));
            }
        }
        return projects;
    }

    public createTargetedRoadProject(from: RoomPosition, to: Source | StructureContainer | StructureController | StructureExtension) {
        let path = this.planRoad(from, to.pos)
        const directNeighbours = to.pos.getNeighbours().filter((x) => {
            return (x.lookFor(LOOK_STRUCTURES).length === 0 && x.lookFor(LOOK_TERRAIN)[0] !== "wall")
        })
        path = path.concat(directNeighbours)
        path.forEach((x) => {
            this.room.visual.printBox(x.x, x.y)
        })
        const prj = new TargetedRoadBuildProject(to.id, path)
        return prj
    }

    public planRoad(from: RoomPosition, to: RoomPosition) {
        const pathfinder = PathFinder.search(from, { pos: to, range: 1 }, {
            roomCallback: (roomName) => {
                return this.withoutCreepsAndTerrainCostMatrix;
            }
        });
        const path = pathfinder.path.filter((pos) => {
            return pos.lookFor(LOOK_STRUCTURES).filter((struct) => struct.structureType === STRUCTURE_ROAD).length === 0;
        });
        return path
    }

}
