interface RoomMemory {
    unitConfiguration: {
        configurations: AllUnitConfigurations,
        lastEnergyValue: number
    }
}

interface AllUnitConfigurations {
    [id: number]: UnitConfig[],
    perSource: { [id: string]: UnitConfig[] }
}

interface UnitConfig {
    cost: number;
    throughput: number;
    throughputRoad: number;
    throughputShort: number;
    modules: BodyPartConstant[];
    workTime: number;
    travelTime: number;
    version: number;
}

