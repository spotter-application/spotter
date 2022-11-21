import { ITrainingStatus } from './feed-forward';
import { INumberHash } from './lookup';
import { INeuralNetworkBinaryTestResult, INeuralNetworkState, INeuralNetworkTestResult } from './neural-network-types';
declare type NeuralNetworkFormatter = ((v: INumberHash) => Float32Array) | ((v: number[]) => Float32Array);
export declare function getTypedArrayFn(value: INeuralNetworkData, table: INumberHash | null): null | NeuralNetworkFormatter;
export declare type NeuralNetworkActivation = 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';
export interface IJSONLayer {
    biases: number[];
    weights: number[][];
}
export interface INeuralNetworkJSON {
    type: string;
    sizes: number[];
    layers: IJSONLayer[];
    inputLookup: INumberHash | null;
    inputLookupLength: number;
    outputLookup: INumberHash | null;
    outputLookupLength: number;
    options: INeuralNetworkOptions;
    trainOpts: INeuralNetworkTrainOptionsJSON;
}
export interface INeuralNetworkOptions {
    inputSize: number;
    outputSize: number;
    binaryThresh: number;
    hiddenLayers?: number[];
}
export declare function defaults(): INeuralNetworkOptions;
export interface INeuralNetworkTrainOptionsJSON {
    activation: NeuralNetworkActivation | string;
    iterations: number;
    errorThresh: number;
    log: boolean;
    logPeriod: number;
    leakyReluAlpha: number;
    learningRate: number;
    momentum: number;
    callbackPeriod: number;
    timeout: number | 'Infinity';
    praxis?: 'adam';
    beta1: number;
    beta2: number;
    epsilon: number;
}
export interface INeuralNetworkPreppedTrainingData<T> {
    status: ITrainingStatus;
    preparedData: Array<INeuralNetworkDatumFormatted<T>>;
    endTime: number;
}
export interface INeuralNetworkTrainOptions {
    activation: NeuralNetworkActivation | string;
    iterations: number;
    errorThresh: number;
    log: boolean | ((status: INeuralNetworkState) => void);
    logPeriod: number;
    leakyReluAlpha: number;
    learningRate: number;
    momentum: number;
    callback?: (status: {
        iterations: number;
        error: number;
    }) => void;
    callbackPeriod: number;
    timeout: number;
    praxis?: 'adam';
    beta1: number;
    beta2: number;
    epsilon: number;
}
export declare function trainDefaults(): INeuralNetworkTrainOptions;
export declare type INeuralNetworkData = number[] | Float32Array | Partial<INumberHash>;
export interface INeuralNetworkDatum<InputType, OutputType> {
    input: InputType;
    output: OutputType;
}
export interface INeuralNetworkDatumFormatted<T> {
    input: T;
    output: T;
}
export declare class NeuralNetwork<InputType extends INeuralNetworkData, OutputType extends INeuralNetworkData> {
    options: INeuralNetworkOptions;
    trainOpts: INeuralNetworkTrainOptions;
    sizes: number[];
    outputLayer: number;
    biases: Float32Array[];
    weights: Float32Array[][];
    outputs: Float32Array[];
    deltas: Float32Array[];
    changes: Float32Array[][];
    errors: Float32Array[];
    errorCheckInterval: number;
    inputLookup: INumberHash | null;
    inputLookupLength: number;
    outputLookup: INumberHash | null;
    outputLookupLength: number;
    _formatInput: NeuralNetworkFormatter | null;
    _formatOutput: NeuralNetworkFormatter | null;
    runInput: (input: Float32Array) => Float32Array;
    calculateDeltas: (output: Float32Array) => void;
    biasChangesLow: Float32Array[];
    biasChangesHigh: Float32Array[];
    changesLow: Float32Array[][];
    changesHigh: Float32Array[][];
    iterations: number;
    constructor(options?: Partial<INeuralNetworkOptions & INeuralNetworkTrainOptions>);
    /**
     *
     * Expects this.sizes to have been set
     */
    initialize(): void;
    setActivation(activation?: NeuralNetworkActivation): void;
    get isRunnable(): boolean;
    run(input: Partial<InputType>): OutputType;
    _runInputSigmoid(input: Float32Array): Float32Array;
    _runInputRelu(input: Float32Array): Float32Array;
    _runInputLeakyRelu(input: Float32Array): Float32Array;
    _runInputTanh(input: Float32Array): Float32Array;
    /**
     *
     * Verifies network sizes are initialized
     * If they are not it will initialize them based off the data set.
     */
    verifyIsInitialized(preparedData: Array<INeuralNetworkDatumFormatted<Float32Array>>): void;
    updateTrainingOptions(trainOpts: Partial<INeuralNetworkTrainOptions>): void;
    validateTrainingOptions(options: INeuralNetworkTrainOptions): void;
    /**
     *
     *  Gets JSON of trainOpts object
     *    NOTE: Activation is stored directly on JSON object and not in the training options
     */
    getTrainOptsJSON(): INeuralNetworkTrainOptionsJSON;
    setLogMethod(log: boolean | ((state: INeuralNetworkState) => void)): void;
    logTrainingStatus(status: INeuralNetworkState): void;
    calculateTrainingError(data: Array<INeuralNetworkDatumFormatted<Float32Array>>): number;
    trainPatterns(data: Array<INeuralNetworkDatumFormatted<Float32Array>>): void;
    trainingTick(data: Array<INeuralNetworkDatumFormatted<Float32Array>>, status: INeuralNetworkState, endTime: number): boolean;
    prepTraining(data: Array<INeuralNetworkDatum<InputType, OutputType>>, options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkPreppedTrainingData<Float32Array>;
    train(data: Array<INeuralNetworkDatum<Partial<InputType>, Partial<OutputType>>>, options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkState;
    trainAsync(data: Array<INeuralNetworkDatum<InputType, OutputType>>, options?: Partial<INeuralNetworkTrainOptions>): Promise<ITrainingStatus>;
    trainPattern(value: INeuralNetworkDatumFormatted<Float32Array>, logErrorRate?: boolean): number | null;
    _calculateDeltasSigmoid(target: Float32Array): void;
    _calculateDeltasRelu(target: Float32Array): void;
    _calculateDeltasLeakyRelu(target: Float32Array): void;
    _calculateDeltasTanh(target: Float32Array): void;
    /**
     *
     * Changes weights of networks
     */
    adjustWeights(): void;
    _setupAdam(): void;
    _adjustWeightsAdam(): void;
    validateData(data: Array<INeuralNetworkDatumFormatted<Float32Array>>): void;
    validateInput(formattedInput: Float32Array): void;
    formatData(data: Array<INeuralNetworkDatum<InputType, OutputType>>): Array<INeuralNetworkDatumFormatted<Float32Array>>;
    addFormat(data: INeuralNetworkDatum<InputType, OutputType>): void;
    test(data: Array<INeuralNetworkDatum<Partial<InputType>, Partial<OutputType>>>): INeuralNetworkTestResult | INeuralNetworkBinaryTestResult;
    toJSON(): INeuralNetworkJSON;
    fromJSON(json: INeuralNetworkJSON): this;
    toFunction(cb?: (source: string) => string): (input: Partial<InputType>) => OutputType;
}
export {};
//# sourceMappingURL=neural-network.d.ts.map