import { UnitConfigurationController } from "../unit/UnitConfiguration";
import { HarvesterCreepBuildStep, MultiStepEconomyProject, EconomyProject } from "../projects/IProjects";
import { Worktype } from "utils/Constants";
import { ConstructionController } from "../construction/ConstructionController";

export class EconomyController {
    private room: Room;
    private unitConfig: UnitConfigurationController;
    private constructionController: ConstructionController;

    constructor(room: Room) {
        this.room = room;
        this.unitConfig = new UnitConfigurationController(room);
        this.constructionController = new ConstructionController(room);
    }

    public init() {
        this.unitConfig.init()
    }

    public computeHarvesterBuildProjects(harvesterConfig: UnitConfig, source: Source) {
        const maxHarvesters = source.computeMaxHarvesters(harvesterConfig);
        const projects = [] as MultiStepEconomyProject[]
        for (let i = 0; i < maxHarvesters; i++) {
            const step = {
                name: "Build harvester for " + source.id,
                source: source.id,
                creepType: Worktype.HARVEST,
                cost: harvesterConfig.cost,
                expectedThroughputIncrease: harvesterConfig.throughput
            };
            projects.push({
                name: step.name,
                cost: step.cost,
                expectedThroughputIncrease: step.expectedThroughputIncrease,
                spawnSteps: [step] as EconomyProject[],
                constructionSteps: [] as EconomyProject[]
            });
        }
        return projects;
    }

    public getHarvesterProjects() {
        this.unitConfig.computeAllConfigurations();
        for (const source of this.room.turnCache.environment.sources) {
            const harvesterConfig = this.unitConfig.getHarvesterConfigurationForSource(source.id);
            this.computeHarvesterBuildProjects(harvesterConfig.current, source);
        }

    }
    public getProject() {
        this.getHarvesterProjects();
    }
}
