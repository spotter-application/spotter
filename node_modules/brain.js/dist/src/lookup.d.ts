import { KernelOutput } from 'gpu.js';
export interface INumberHash {
    [character: string]: number;
}
export interface INumberArray {
    length: number;
    buffer?: ArrayBuffer;
    [index: number]: number;
}
export declare type InputOutputValue = INumberArray | Partial<INumberHash>;
export interface ITrainingDatum {
    input: InputOutputValue | InputOutputValue[] | KernelOutput;
    output: InputOutputValue | InputOutputValue[] | KernelOutput;
}
export declare type FormattableData = number | ITrainingDatum | InputOutputValue | InputOutputValue[];
export declare const lookup: {
    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} hashes
     * @returns {Object}
     */
    toTable(hashes: INumberHash[]): INumberHash;
    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     */
    toTable2D(objects2D: INumberHash[][]): INumberHash;
    toInputTable2D(data: {
        input: {
            [key: string]: number;
        }[];
    }[]): INumberHash;
    toOutputTable2D(data: {
        output: {
            [key: string]: number;
        }[];
    }[]): INumberHash;
    /**
     * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
     */
    toHash(hash: INumberHash): INumberHash;
    /**
     * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
     */
    toArray(lookup: INumberHash, object: INumberHash, arrayLength: number): Float32Array;
    toArrayShort(lookup: INumberHash, object: INumberHash): Float32Array;
    toArrays(lookup: INumberHash, objects: INumberHash[], arrayLength: number): Float32Array[];
    /**
     * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
     * @param {Object} lookup
     * @param {Array} array
     * @returns {Object}
     */
    toObject(lookup: INumberHash, array: number[] | Float32Array): INumberHash;
    toObjectPartial(lookup: INumberHash, array: number[] | Float32Array, offset?: number, limit?: number): INumberHash;
    dataShape(data: FormattableData[] | FormattableData): string[];
    addKeys(value: number[] | INumberHash, table: INumberHash): INumberHash;
};
//# sourceMappingURL=lookup.d.ts.map