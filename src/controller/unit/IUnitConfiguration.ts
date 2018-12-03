interface RoomMemory {
    unitConfiguration: {
        configurations: {[id: number]: UnitConfigEntry,
                        perSource: {[id: string]: UnitConfigEntry}},
        lastEnergyValue: number
    }
}

interface UnitConfigEntry {
    current: UnitConfig;
    next: UnitConfig;
    shortTravel: UnitConfig;
    roadTravel: UnitConfig;
    version: number;
}

interface UnitConfig {
    cost: number;
    throughput: number;
    modules: BodyPartConstant[];
    workTime: number;
    travelTime: number;
}

