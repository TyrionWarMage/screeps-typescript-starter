import { ATask } from "utils/AClasses";

export class DetermineProjectTask extends ATask implements RoomTask {
    public name = 'Determine next project';

    public act(room: Room): void {
        room.determineNextProject();
    }
}

