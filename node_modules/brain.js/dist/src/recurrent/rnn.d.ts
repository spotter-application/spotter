import { Log } from '../feed-forward';
import { INeuralNetworkTrainOptions } from '../neural-network';
import { IDataFormatter, IDataFormatterJSON } from '../utilities/data-formatter';
import { IMatrixJSON, Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RandomMatrix } from './matrix/random-matrix';
import { IRNNDatum, Value } from './rnn-data-types';
export interface IRNNModel {
    isInitialized: boolean;
    input: Matrix;
    hiddenLayers: IRNNHiddenLayerModel[];
    output: Matrix;
    equations: Equation[];
    allMatrices: Matrix[];
    equationConnections: Matrix[][];
    outputConnector: RandomMatrix | Matrix;
}
export interface IRNNOptions {
    inputSize: number;
    inputRange: number;
    hiddenLayers: number[];
    outputSize: number;
    decayRate: number;
    smoothEps: number;
    regc: number;
    clipval: number;
    maxPredictionLength: number;
    dataFormatter: IDataFormatter;
    json?: IRNNJSON;
}
export interface IRNNJSONOptions {
    inputSize: number;
    inputRange: number;
    hiddenLayers: number[];
    outputSize: number;
    decayRate: number;
    smoothEps: number;
    regc: number;
    clipval: number;
    maxPredictionLength: number;
    dataFormatter: IDataFormatterJSON;
}
export interface IRNNTrainingOptions {
    iterations: number;
    errorThresh: number;
    log: boolean | ((status: string) => void);
    logPeriod: number;
    learningRate: number;
    callback?: (status: IRNNStatus) => void;
    callbackPeriod: number;
    timeout: number;
}
export interface IRNNJSONTrainOptions {
    iterations: number;
    errorThresh: number;
    log: boolean | ((status: string) => void);
    logPeriod: number;
    learningRate: number;
    callback?: (status: IRNNStatus) => void;
    callbackPeriod: number;
    timeout: number | 'Infinity';
}
export declare const trainDefaults: IRNNTrainingOptions;
export interface IRNNHiddenLayer {
    [key: string]: RandomMatrix | Matrix;
}
export interface IRNNHiddenLayerModel extends IRNNHiddenLayer {
    weight: RandomMatrix;
    transition: RandomMatrix;
    bias: Matrix;
}
export declare const defaults: () => IRNNOptions;
export interface IRNNStatus {
    iterations: number;
    error: number;
}
export interface IRNNPreppedTrainingData {
    status: IRNNStatus;
    preparedData: number[][];
    endTime: number;
}
export declare class RNN {
    options: IRNNOptions;
    trainOpts: IRNNTrainingOptions;
    stepCache: {
        [index: number]: Float32Array;
    };
    runs: number;
    ratioClipped: number;
    model: IRNNModel;
    initialLayerInputs: Matrix[];
    constructor(options?: Partial<IRNNOptions & IRNNTrainingOptions>);
    initialize(): void;
    createHiddenLayers(): IRNNHiddenLayer[];
    getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer;
    getEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: IRNNHiddenLayer): Matrix;
    createInputMatrix(): RandomMatrix;
    createOutputMatrices(): {
        outputConnector: RandomMatrix;
        output: Matrix;
    };
    bindEquation(): void;
    mapModel(): IRNNModel;
    trainInput(input: number[]): number;
    backpropagate(input: number[]): void;
    adjustWeights(): void;
    get isRunnable(): boolean;
    checkRunnable(): void;
    run(rawInput?: Value, isSampleI?: boolean, temperature?: number): string;
    /**
     *
     * Verifies network sizes are initialized
     * If they are not it will initialize them
     */
    verifyIsInitialized(): void;
    /**
     *
     * @param options
     *    Supports all `trainDefaults` properties
     *    also supports:
     *       learningRate: (number),
     *       momentum: (number),
     *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
     */
    updateTrainingOptions(options: Partial<IRNNTrainingOptions>): void;
    validateTrainingOptions(options: INeuralNetworkTrainOptions): void;
    setLogMethod(log: Log | undefined | boolean): void;
    protected prepTraining(data: Array<Value | IRNNDatum>, options: Partial<IRNNTrainingOptions>): IRNNPreppedTrainingData;
    train(data: Array<Value | IRNNDatum>, trainOpts?: Partial<IRNNTrainingOptions>): IRNNStatus;
    addFormat(): void;
    toJSON(): IRNNJSON;
    fromJSON(json: IRNNJSON): this;
    toFunction(cb?: (src: string) => string): RNNFunction;
    trainPattern(input: number[], logErrorRate?: boolean): number;
}
export interface IRNNJSON {
    type: string;
    options: IRNNJSONOptions;
    trainOpts: IRNNJSONTrainOptions;
    input: IMatrixJSON;
    hiddenLayers: Array<{
        [index: string]: IMatrixJSON;
    }>;
    outputConnector: IMatrixJSON;
    output: IMatrixJSON;
}
export declare function last<T>(values: T[]): T;
export declare type RNNFunction = (rawInput?: Array<Value | IRNNDatum> | string, isSampleI?: boolean, temperature?: number) => string;
//# sourceMappingURL=rnn.d.ts.map