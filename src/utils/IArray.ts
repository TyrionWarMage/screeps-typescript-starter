interface Array<T> {
    max(): number;
    argmax(): number;
    sum(): number;
    mean(): number;
    std(mean: number): number;
    meanNoOutlier(): number;
    equal(arr: T[]): boolean;
}
