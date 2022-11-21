export declare class ArrayLookupTable {
    prop: 'input' | 'output';
    length: number;
    table: {
        [key: string]: number;
    };
    constructor(data: Array<{
        input: Array<Record<string, number>>;
        output: Array<Record<string, number>>;
    }>, prop: 'input' | 'output');
}
//# sourceMappingURL=array-lookup-table.d.ts.map