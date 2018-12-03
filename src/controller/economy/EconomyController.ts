import { UnitConfigurationController } from "../unit/UnitConfiguration";

export class EconomyController {
    private room: Room;
    private unitConfig: UnitConfigurationController;

    constructor(room: Room) {
        this.room = room;
        this.unitConfig = new UnitConfigurationController(room);
    }

    public init() {
        this.unitConfig.init()
    }

    public getHarvesterProjects() {
        const harvesterProjects = this.unitConfig.getHarvesterProjects();
        return harvesterProjects;
    }
    public getProject() {
        this.getHarvesterProjects();
    }
}