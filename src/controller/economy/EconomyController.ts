import { UnitConfigurationController } from "../unit/UnitConfiguration";
import { ConstructionController } from "../construction/ConstructionController";
import { PlanState, HarvesterBuildAction } from "projects/PlanSpace";
import { GreedyPlanner } from "projects/Planner";
import { Worktype } from "Enums";

export class EconomyController {
    private room: Room;
    public unitConfig: UnitConfigurationController;
    public constructionController: ConstructionController;

    constructor(room: Room) {
        this.room = room;
        this.unitConfig = new UnitConfigurationController(room);
        this.constructionController = new ConstructionController(room);
    }

    public init() {
        this.unitConfig.init();
        this.unitConfig.computeAllConfigurations(this.room.memory.unitConfiguration);
        this.unitConfig.removeConfiguration(Worktype.BUILD, 0);
        this.unitConfig.removeConfiguration(Worktype.CARRY, 0);
        for (const source of this.room.turnCache.environment.sources) {
            this.unitConfig.removeConfiguration(Worktype.HARVEST, 0, source.id);
            const harvesterConfig = this.room.memory.unitConfiguration.configurations.perSource[source.id];
            source.computeMaxHarvesters(source.memory.status, harvesterConfig[harvesterConfig.length - 1]);
        }
    }

    private getHarvesterPlanActions() {
        const planActions = [] as HarvesterBuildAction[];
        for (const source of this.room.turnCache.environment.sources) {
            const harvesterConfig = this.room.memory.unitConfiguration.configurations.perSource[source.id];
            planActions.push(new HarvesterBuildAction(source.id, harvesterConfig[harvesterConfig.length - 1].cost));
        }
        return planActions
    }

    public getProject() {
        let actionSpace = [] as PlanAction[];
        actionSpace = actionSpace.concat(this.getHarvesterPlanActions());
        actionSpace = actionSpace.concat(this.constructionController.createSourceRoadProjects());

        const sources = {} as { [id: string]: SourceStatusMemory };
        let observedTP = 1;
        for (const source of this.room.turnCache.environment.sources) {
            sources[source.id] = source.memory.status;
            if (source.memory.statistics.amounts.length > 1) {
                source.memory.statistics.amounts.sum = Array.prototype.sum
                observedTP += source.memory.statistics.amounts.sum() / (source.memory.statistics.times[source.memory.statistics.times.length - 1] - source.memory.statistics.times[0]);
            }
        }
        const initState = new PlanState(this.room.turnCache.structure.spawns[0].memory.status, sources, this.room.memory.unitConfiguration.configurations, observedTP, 0);
        const planner = new GreedyPlanner(actionSpace, initState)
        return planner.computePlan(this.unitConfig)
    }

}
