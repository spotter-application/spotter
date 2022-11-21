import { Value, IRNNDatum } from '../recurrent/rnn-data-types';
export interface IDataFormatter {
    indexTable: {
        [value: string]: number;
    };
    toIndexesInputOutput: (input: Value, output?: Value) => number[];
    toIndexes: (input: string) => number[];
    toCharacters: (output: number[]) => string[];
    characters: Array<string | number>;
    specialIndexes: number[];
    toFunctionString: () => string;
    formatDataIn: (input?: Value, output?: Value) => number[];
    formatDataOut: (input: number[], output: number[]) => string;
    format: (data: Array<IRNNDatum | Value>) => number[][];
    isSetup: boolean;
    toJSON: () => IDataFormatterJSON;
}
export declare class DataFormatter implements IDataFormatter {
    private values?;
    indexTable: {
        [key: string]: number;
        [key: number]: number;
    };
    characterTable: {
        [key: number]: string | number | null;
    };
    characters: Array<string | number>;
    specialIndexes: number[];
    isSetup: boolean;
    constructor(values?: (string | number | boolean | number[] | string[] | IRNNDatum | boolean[])[] | undefined, maxThreshold?: number);
    setup(values: Array<IRNNDatum | Value>, maxThreshold?: number): void;
    buildCharactersFromIterable(values: Array<IRNNDatum | Value>): void;
    addCharacters(characters: string | string[] | boolean[] | number[], charactersTable: {
        [character: string]: boolean;
    }): void;
    buildTables(maxThreshold: number): void;
    toIndexes(value: Value, maxThreshold?: number): number[];
    toIndexesInputOutput(input: Value, output?: Value, maxThreshold?: number): number[];
    toIndexesValue(value: Value, maxThreshold: number, isInput: boolean): number[];
    toCharacters(indices: number[], maxThreshold?: number): string[];
    toString(indices: number[], maxThreshold: number): string;
    addInputOutput(): void;
    addUnrecognized(): void;
    static fromAllPrintable(maxThreshold: number, values?: string[]): DataFormatter;
    static fromAllPrintableInputOutput(maxThreshold: number, values?: string[]): DataFormatter;
    static fromStringInputOutput(string: string, maxThreshold: number): DataFormatter;
    static fromArrayInputOutput(data: IRNNDatum[], maxThreshold?: number): DataFormatter;
    static fromString(string: string, maxThreshold?: number): DataFormatter;
    toJSON(): IDataFormatterJSON;
    /** TODO: Type better, The type of json is not "string that is a valid JSON", it is a POJO in the shape of DataFormatter.
     * this method re-hydrates the the data as an instance of DataFormatter.
     */
    static fromJSON(json: IDataFormatterJSON): DataFormatter;
    addSpecial(special: string | number, character?: null): void;
    toFunctionString(): string;
    formatDataIn(input?: Value, output?: Value): number[];
    formatDataOut(input: number[], output: number[]): string;
    format(data: Array<IRNNDatum | Value>): number[][];
}
export interface IDataFormatterJSON {
    indexTable: {
        [key: string]: number;
        [key: number]: number;
    };
    characterTable: {
        [key: number]: string | number | null;
    };
    values: Value[];
    characters: Array<string | number>;
    specialIndexes: number[];
}
//# sourceMappingURL=data-formatter.d.ts.map