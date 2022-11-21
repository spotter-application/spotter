export interface IMatrixJSON {
    rows: number;
    columns: number;
    weights: number[];
}
/**
 * A matrix
 */
export declare class Matrix {
    rows: number;
    columns: number;
    weights: Float32Array;
    deltas: Float32Array;
    constructor(rows?: number, columns?: number);
    getWeight(row: number, col: number): number;
    setWeight(row: number, col: number, v: number): Matrix;
    getDelta(row: number, col: number): number;
    setDelta(row: number, col: number, v: number): Matrix;
    toJSON(): IMatrixJSON;
    static fromJSON(json: IMatrixJSON): Matrix;
    static fromArray(weights: Float32Array[] | number[][]): Matrix;
    deltasToArray(): number[][];
    weightsToArray(): number[][];
    toArray(prop?: 'weights' | 'deltas'): number[][];
    fromArray(array: number[][] | Float32Array[], prop?: 'weights' | 'deltas'): this;
    iterate(callbacks: {
        column?: (rowIndex: number, columnIndex: number) => void;
        row?: (rowIndex: number) => void;
    }): this;
}
//# sourceMappingURL=index.d.ts.map