interface RoomMemory {
    unitConfiguration: {
        configurations: AllUnitConfigurations,
        lastEnergyValue: number
    }
}

interface AllUnitConfigurations {
    [id: number]: UnitConfigEntry,
    perSource: { [id: string]: UnitConfigEntry }
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

