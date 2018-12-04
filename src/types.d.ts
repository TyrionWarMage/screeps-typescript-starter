interface Structure {
  init(): void;
  act(): void;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    Profiler: Profiler
  }
}
