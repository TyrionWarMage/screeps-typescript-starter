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

export enum Finalize {
    BUILD_TARGETED_ROAD,
    BUILD_TARGETED_CONTAINER,
    NO_FINALIZE
}

export class Constants {
    public static MAX_STATISTICS_LENGTH = 100;
    public static OUTLIER_STD_FACTOR = 1.25;
    public static ASTAR_WEIGHT = 1.2;
    public static BUILDER_TRAVEL_DIST = 10;
    public static BUILDER_TRAVEL_COST = 10;
    public static REPAIR_THRESHOLD_PERCENT = 0.5;
}



