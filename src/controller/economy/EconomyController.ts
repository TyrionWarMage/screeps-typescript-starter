import { UnitConfigurationController } from "../unit/UnitConfiguration";
import { ConstructionController } from "../construction/ConstructionController";
import { PlanState, HarvesterBuildAction } from "projects/PlanSpace";
import { GreedyPlanner } from "projects/Planner";

export class EconomyController {
    private room: Room;
    private unitConfig: UnitConfigurationController;
    public constructionController: ConstructionController;

    constructor(room: Room) {
        this.room = room;
        this.unitConfig = new UnitConfigurationController(room);
        this.constructionController = new ConstructionController(room);
    }

    public init() {
        this.unitConfig.init()
    }

    private getHarvesterPlanActions() {
        const planActions = [] as HarvesterBuildAction[];
        this.unitConfig.computeAllConfigurations();
        for (const source of this.room.turnCache.environment.sources) {
            const harvesterConfig = this.unitConfig.getHarvesterConfigurationForSource(source.id);
            source.computeMaxHarvesters(harvesterConfig.current);
            planActions.push(new HarvesterBuildAction(source.id, harvesterConfig.current.cost));
        }
        return planActions

    }

    public getProject() {
        let actionSpace = [] as PlanAction[];
        actionSpace = actionSpace.concat(this.getHarvesterPlanActions());

        const sources = {} as { [id: string]: SourceMemory };
        for (const source of this.room.turnCache.environment.sources) {
            sources[source.id] = source.memory;
        }
        const initState = new PlanState(sources, this.room.memory.unitConfiguration.configurations, 1, 0);
        const planner = new GreedyPlanner(actionSpace, initState)
        return planner.computePlan()
    }

}
