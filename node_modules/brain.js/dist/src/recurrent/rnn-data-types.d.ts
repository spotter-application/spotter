/** TODO: might need to be extended to include string[][] */
export declare type Value = string | number | boolean | string[] | number[] | boolean[];
export interface IRNNDatum {
    input: Value;
    output: Value;
}
export interface ITimeStepObject {
    [key: string]: number | number[];
}
export declare type TimeStepArray = number[];
export declare type TimeStepValue = Array<number[] | number[][] | ITimeStepObject | ITimeStepObject[] | TimeStepArray>;
export interface ITimeStepRNNDatum {
    input: TimeStepValue;
    output: TimeStepValue;
}
//# sourceMappingURL=rnn-data-types.d.ts.map