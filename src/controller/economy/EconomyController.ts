import { UnitConfigurationController } from "../unit/UnitConfiguration";
import { ConstructionController } from "../construction/ConstructionController";
import { PlanState, HarvesterBuildAction } from "projects/PlanSpace";

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

    public getHarvesterPlanActions() {
        const planActions = [] as HarvesterBuildAction[];
        this.unitConfig.computeAllConfigurations();
        for (const source of this.room.turnCache.environment.sources) {
            const harvesterConfig = this.unitConfig.getHarvesterConfigurationForSource(source.id);
            source.computeMaxHarvesters(harvesterConfig.current);
            planActions.push(new HarvesterBuildAction(source.id, harvesterConfig.current.throughput, harvesterConfig.current.cost));
        }
        return planActions

    }

    public getProject() {
        let actionSpace = [] as PlanAction[];
        actionSpace = actionSpace.concat(this.getHarvesterPlanActions());
        return this.computePlan(actionSpace)
    }

    public computePlan(actionSpace: PlanAction[]) {
        const sources = {} as { [id: string]: SourceMemory };
        for (const source of this.room.turnCache.environment.sources) {
            sources[source.id] = source.memory;
        }
        const initState = new PlanState(sources, this.room.memory.unitConfiguration.configurations, 0, 0);
        actionSpace.filter((x) => x.isApplicable(initState));
        actionSpace.sort((n1, n2) => {
            if (n1.value > n2.value) {
                return -1
            } else if (n2.value > n1.value) {
                return 1
            } else {
                return 0
            }
        })
        return actionSpace[0].steps
    }
}
