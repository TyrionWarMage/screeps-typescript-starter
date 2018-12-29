import { PlanState } from "projects/PlanSpace";

class Node {
    public state: PlanState;
    public actions: PlanAction[];
    public childs: Node[];

    public values: number[];

    constructor(state: PlanState, actions: PlanAction[]) {
        this.state = state;
        this.actions = actions.filter((x) => x.isApplicable(state));
        this.childs = new Array<Node>(this.actions.length);
        this.values = new Array<number>(this.actions.length);
    }
}

export class GreedyPlanner {

    private rootNode: Node;
    private actionSpace: PlanAction[];

    constructor(actionSpace: PlanAction[], initState: PlanState) {
        this.rootNode = new Node(initState, actionSpace);
        this.actionSpace = actionSpace
    }

    public getMaxIdx(node: Node) {
        for (let i = 0; i < node.values.length; i++) {
            node.values[i];
        }
        return node.values.argmax()
    }

    public evaluate(evalNode: Node, rootNode: Node) {
        return (evalNode.state.getValue() - rootNode.state.getValue()) / (evalNode.state.elapsedTime - rootNode.state.elapsedTime)
    }

    public computePlan(unitController: UnitConfigurationControllerInterface) {
        const start = Game.cpu.getUsed();
        for (let idx = 0; idx < this.rootNode.childs.length; idx++) {
            this.rootNode.childs[idx] = new Node(this.rootNode.actions[idx].update(this.rootNode.state.copy(), unitController), this.actionSpace);
            this.rootNode.values[idx] = this.evaluate(this.rootNode, this.rootNode);
        }
        const bestIdx = this.getMaxIdx(this.rootNode)
        console.log("CPU Usage: " + (Game.cpu.getUsed() - start).toFixed(3) + " Best plan evaluated with " + this.rootNode.values[bestIdx].toFixed(4) + " taking " + this.rootNode.childs[bestIdx].state.elapsedTime)
        return this.rootNode.actions[bestIdx].steps;

    }
}
