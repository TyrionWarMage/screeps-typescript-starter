import { PlanState } from "projects/PlanSpace";

class Node {
    private state: PlanState;
    private rootNode: PlanState;
    private actions: PlanAction[];
    private actionSpace: PlanAction[];
    private childs: Node[];

    private values: number[];

    constructor(state: PlanState, actions: PlanAction[], root: PlanState) {
        this.state = state;
        this.actionSpace = actions;
        this.rootNode = root;
        this.actions = actions.filter((x) => x.isApplicable(state));
        this.childs = new Array<Node>(this.actions.length);
        this.values = new Array<number>(this.actions.length);
    }

    public getState() {
        return this.state;
    }
    public getChildAt(idx: number) {
        if (this.childs[idx] === undefined) {
            this.childs[idx] = new Node(this.actions[idx].update(this.state.copy()), this.actionSpace, this.rootNode);
        }
        return this.childs[idx];
    }

    public getActionAt(idx: number) {
        return this.actions[idx];
    }

    public getValueAt(idx: number) {
        if (this.values[idx] === undefined) {
            this.values[idx] = this.getChildAt(idx).evaluate();
        }
        return this.values[idx];
    }

    public getMaxIdx() {
        for (let i = 0; i < this.values.length; i++) {
            this.getValueAt(i);
        }
        return this.values.argmax()
    }

    public evaluate() {
        return (this.state.getValue() - this.rootNode.getValue()) / (this.state.elapsedTime - this.rootNode.elapsedTime)
    }
}

export class GreedyPlanner {

    private rootNode: Node;
    private actionSpace: PlanAction[];

    constructor(actionSpace: PlanAction[], initState: PlanState) {
        this.rootNode = new Node(initState, actionSpace, initState);
        this.actionSpace = actionSpace;
    }

    public computePlan() {
        const start = Game.cpu.getUsed();
        const bestIdx = this.rootNode.getMaxIdx();
        console.log("CPU Usage: " + (Game.cpu.getUsed() - start).toFixed(3) + " Best plan evaluated with " + this.rootNode.getValueAt(bestIdx).toFixed(4) + " taking " + this.rootNode.getChildAt(bestIdx).getState().elapsedTime)
        return this.rootNode.getActionAt(bestIdx).steps;

    }
}
