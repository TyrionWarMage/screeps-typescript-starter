export abstract class AActor {
    public abstract initiated: boolean;
    public abstract tasks: ATask[];

    public abstract init(): void;
    public abstract preTask(): void;
    public abstract postTask(): void;

    public act() {
        if(!this.initiated) {this.init()};
        this.preTask();
        while(this.tasks.length>0) {
            const task = this.tasks.shift();
            if(task!==undefined) {
                console.log(this+":"+task.name)
                // tslint:disable-next-line:no-eval
                const taskInstance = eval(`new ${task.classname}()`)
                task.act = taskInstance.act
                if(task!==undefined){
                    task.act(this);
                }
            }
        }
        this.postTask();
    }
}

export abstract class ATask implements Task {
    public abstract name: string;
    public classname = this.constructor.name;
    public abstract act(obj:any): void;
}