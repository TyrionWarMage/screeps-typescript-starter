export enum Worktype {
    HARVEST,
    UPGRADE,
    BUILD,
    REPAIR,
    PAUSE,
    CARRY,
    MINER,
    SCOUT,
    COMBAT,
    CLAIMER,
    DEFENDER,
}

export enum Tasktype {
    CREEP_BUILD,
    CREEP_UPGRADE,
    CREEP_ROAD,
    CREEP_SHORTTRAVEL
}

export class Constants {
    public static MAX_STATISTICS_LENGTH = 200;
    public static OUTLIER_STD_FACTOR = 1.25;
}



