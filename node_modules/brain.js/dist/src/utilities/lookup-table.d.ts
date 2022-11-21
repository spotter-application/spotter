import { InputOutputValue, INumberHash, ITrainingDatum } from '../lookup';
export declare type LookupTableProp = 'input' | 'output';
export declare class LookupTable {
    length: number;
    prop: LookupTableProp | null;
    table: INumberHash;
    constructor(data: ITrainingDatum[] | InputOutputValue[] | InputOutputValue[][], prop?: LookupTableProp);
}
//# sourceMappingURL=lookup-table.d.ts.map