import { FormattableData, InputOutputValue, INumberHash, ITrainingDatum } from '../lookup';
import { IMatrixJSON, Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RandomMatrix } from './matrix/random-matrix';
import { IRNNHiddenLayer, IRNNOptions, IRNNStatus, IRNNTrainingOptions, RNN } from './rnn';
export declare type ValuesOf<T extends InputOutputValue | InputOutputValue[]> = T[number];
export interface IRNNTimeStepOptions extends IRNNTimeStepJSONOptions {
    inputSize: number;
    inputRange: number;
    hiddenLayers: number[];
    outputSize: number;
    decayRate: number;
    smoothEps: number;
    regc: number;
    clipval: number;
    maxPredictionLength: number;
    json?: IRNNTimeStepJSON;
}
export interface IRNNTimeStepJSONOptions {
    inputSize: number;
    inputRange: number;
    hiddenLayers: number[];
    outputSize: number;
    decayRate: number;
    smoothEps: number;
    regc: number;
    clipval: number;
    maxPredictionLength: number;
}
export interface IRNNTimeStepJSON {
    type: string;
    options: IRNNTimeStepJSONOptions;
    hiddenLayers: Array<{
        [index: string]: IMatrixJSON;
    }>;
    outputConnector: IMatrixJSON;
    output: IMatrixJSON;
    inputLookup: INumberHash | null;
    inputLookupLength: number;
    outputLookup: INumberHash | null;
    outputLookupLength: number;
}
export interface IMisclass {
    value: FormattableData;
    actual: FormattableData;
}
export interface ITestResults {
    misclasses: IMisclass[];
    error: number;
    total: number;
}
export interface IRNNTimeStepModel {
    isInitialized: boolean;
    hiddenLayers: IRNNHiddenLayer[];
    output: Matrix;
    equations: Equation[];
    allMatrices: Matrix[];
    equationConnections: Matrix[][];
    outputConnector: RandomMatrix | Matrix;
}
export declare const defaults: () => IRNNOptions;
export declare class RNNTimeStep extends RNN {
    inputLookupLength: number;
    inputLookup: INumberHash | null;
    outputLookup: INumberHash | null;
    outputLookupLength: number;
    model: IRNNTimeStepModel;
    options: IRNNTimeStepOptions;
    constructor(options?: Partial<IRNNTimeStepOptions & IRNNTrainingOptions>);
    createInputMatrix(): RandomMatrix;
    createOutputMatrices(): {
        outputConnector: RandomMatrix;
        output: Matrix;
    };
    bindEquation(): void;
    initialize(): void;
    mapModel(): IRNNTimeStepModel;
    backpropagate(): void;
    run<InputType extends InputOutputValue | InputOutputValue[]>(rawInput: InputType): ValuesOf<InputType>;
    forecast<InputType extends InputOutputValue | InputOutputValue[]>(rawInput: InputType, count?: number): InputType;
    forecastArray(input: Float32Array, count?: number): Float32Array;
    forecastArrayOfArray(input: Float32Array[], count?: number): Float32Array[];
    forecastArrayOfObject(input: INumberHash[], count?: number): INumberHash[];
    train(data: FormattableData[], trainOpts?: Partial<IRNNTrainingOptions>): IRNNStatus;
    trainArrayOfArray(input: Float32Array[]): number;
    trainPattern(input: Float32Array[], logErrorRate?: boolean): number;
    setSize(data: FormattableData[]): void;
    verifySize(): void;
    runArray(input: Float32Array): number;
    runArrayOfArray(input: Float32Array[]): Float32Array;
    runObject(input: INumberHash): INumberHash;
    runArrayOfObject(input: INumberHash[]): INumberHash;
    runArrayOfObjectOfArray(input: INumberHash[]): INumberHash;
    end(): void;
    requireInputOutputOfOne(): void;
    formatArray(data: number[]): Float32Array[][];
    formatArrayOfArray(data: number[][]): Float32Array[][];
    formatArrayOfObject(data: INumberHash[]): Float32Array[][];
    formatArrayOfObjectMulti(data: INumberHash[]): Float32Array[][];
    formatArrayOfDatumOfArray(data: ITrainingDatum[]): Float32Array[][];
    formatArrayOfDatumOfObject(data: ITrainingDatum[]): Float32Array[][];
    formatArrayOfArrayOfArray(data: number[][][]): Float32Array[][];
    formatArrayOfArrayOfObject(data: INumberHash[][]): Float32Array[][];
    formatArrayOfDatumOfArrayOfArray(data: ITrainingDatum[]): Float32Array[][];
    formatArrayOfDatumOfArrayOfObject(data: Array<{
        input: Array<Record<string, number>>;
        output: Array<Record<string, number>>;
    }>): Float32Array[][];
    formatData(data: FormattableData[]): Float32Array[][];
    test(data: FormattableData[]): ITestResults;
    addFormat(value: FormattableData): void;
    toJSON(): IRNNTimeStepJSON;
    fromJSON(json: IRNNTimeStepJSON): this;
    toFunction(cb?: (src: string) => string): RNNTimeStepFunction;
}
export declare type RNNTimeStepFunction = <InputType extends InputOutputValue | InputOutputValue[]>(rawInput?: InputType, isSampleI?: boolean, temperature?: number) => ValuesOf<InputType>;
export declare const trainDefaults: {
    iterations: number;
    errorThresh: number;
    log: boolean | ((status: string) => void);
    logPeriod: number;
    learningRate: number;
    callback?: ((status: IRNNStatus) => void) | undefined;
    callbackPeriod: number;
    timeout: number;
};
//# sourceMappingURL=rnn-time-step.d.ts.map