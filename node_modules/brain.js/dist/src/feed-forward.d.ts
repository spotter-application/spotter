import { KernelOutput } from 'gpu.js';
import { MeanSquaredError } from './estimator/mean-squared-error';
import { ILayer, ILayerJSON } from './layer';
import { InputOutputValue, INumberHash } from './lookup';
import { IPraxis, IPraxisSettings } from './praxis/base-praxis';
export interface IFeedForwardTrainingData<InputType extends InputOutputValue | KernelOutput = number[] | Float32Array, OutputType extends InputOutputValue | KernelOutput = number[] | Float32Array> {
    input: InputType;
    output: OutputType;
}
export interface IFeedForwardNormalizedTrainingData {
    input: Float32Array;
    output: Float32Array;
}
export interface IFeedForwardGPUTrainingData {
    input: KernelOutput;
    output: KernelOutput;
}
export interface ITrainingStatus {
    iterations: number;
    error: number;
}
export declare type Log = (status: string) => void;
export declare type FeedForwardCallback = (status: ITrainingStatus) => void;
export interface IFeedForwardTrainingOptions {
    iterations?: number;
    errorThresh?: number;
    log?: boolean | Log;
    logPeriod?: number;
    learningRate?: number;
    callback?: FeedForwardCallback;
    callbackPeriod?: number;
    errorCheckInterval?: number;
    timeout?: number;
}
export interface IFeedForwardOptions {
    learningRate?: number;
    binaryThresh?: number;
    hiddenLayers?: Array<(inputLayer: ILayer, layerIndex: number) => ILayer>;
    inputLayer?: () => ILayer;
    outputLayer?: (inputLayer: ILayer, index: number) => ILayer;
    praxisOpts?: Partial<IPraxisSettings>;
    initPraxis?: (layerTemplate: ILayer, settings: Partial<IPraxisSettings>) => IPraxis;
    praxis?: IPraxis;
    layers?: ILayer[];
    inputLayerIndex?: number;
    outputLayerIndex?: number;
    sizes?: number[];
}
export interface IFeedForwardPreppedTrainingData {
    status: ITrainingStatus;
    preparedData: IFeedForwardGPUTrainingData[];
    endTime: number;
}
export declare const defaults: IFeedForwardOptions;
export declare const trainDefaults: IFeedForwardTrainingOptions;
export interface IFeedForwardJSON {
    type: string;
    sizes: number[];
    layers: ILayerJSON[];
    inputLayerIndex: number;
    outputLayerIndex: number;
}
export declare class FeedForward<InputType extends InputOutputValue | KernelOutput = number[] | Float32Array, OutputType extends InputOutputValue | KernelOutput = number[] | Float32Array> {
    static _validateTrainingOptions(options: Partial<IFeedForwardTrainingOptions>): void;
    /**
     * if a method is passed in method is used
     * if false passed in nothing is logged
     */
    _setLogMethod(log: Log | undefined | boolean): void;
    _updateTrainingOptions(opts: Partial<IFeedForwardTrainingOptions>): void;
    trainOpts: Partial<IFeedForwardTrainingOptions>;
    options: IFeedForwardOptions;
    layers: ILayer[] | null;
    _inputLayer: ILayer | null;
    _hiddenLayers: ILayer[] | null;
    _outputLayer: ILayer | null;
    _model: ILayer[] | null;
    meanSquaredError: MeanSquaredError | null;
    inputLookup: INumberHash | null;
    inputLookupLength: number | null;
    outputLookup: INumberHash | null;
    outputLookupLength: number | null;
    constructor(options?: IFeedForwardOptions);
    _connectOptionsLayers(): ILayer[];
    _connectNewLayers(): ILayer[];
    _connectHiddenLayers(previousLayer: ILayer): ILayer[];
    initialize(): void;
    initializeLayers(layers: ILayer[]): void;
    run(input: InputType): OutputType;
    runInput(input: KernelOutput): KernelOutput;
    train(data: Array<IFeedForwardTrainingData<InputType, OutputType>>, options?: Partial<IFeedForwardTrainingOptions>): ITrainingStatus;
    trainAsync(data: Array<IFeedForwardTrainingData<InputType, OutputType>>, options?: Partial<IFeedForwardTrainingOptions>): Promise<ITrainingStatus>;
    _trainingTick(status: ITrainingStatus, endTime: number, calculateError: () => number, trainPatterns: () => void): boolean;
    _prepTraining(data: Array<IFeedForwardTrainingData<InputType, OutputType>>, options: Partial<IFeedForwardTrainingOptions>): IFeedForwardPreppedTrainingData;
    verifyIsInitialized(): void;
    _calculateTrainingError(preparedData: IFeedForwardGPUTrainingData[]): number;
    /**
     * @param data
     * @private
     */
    _trainPatterns(data: IFeedForwardGPUTrainingData[]): void;
    _trainPattern(input: KernelOutput, target: KernelOutput, logErrorRate: boolean): KernelOutput | null;
    _calculateDeltas(target: KernelOutput): void;
    /**
     *
     */
    adjustWeights(): void;
    /**
     *
     * @param data
     * @returns {*}
     */
    formatData(data: Array<IFeedForwardTrainingData<InputType, OutputType>> | IFeedForwardTrainingData<InputType, OutputType>): IFeedForwardNormalizedTrainingData[];
    transferData(formattedData: IFeedForwardNormalizedTrainingData[]): IFeedForwardGPUTrainingData[];
    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array
     *  }
     * }
     */
    test(): void;
    /**
     *
     */
    toJSON(): IFeedForwardJSON;
    static fromJSON(json: IFeedForwardJSON, getLayer?: (layerJson: ILayerJSON, inputLayer1?: ILayer, inputLayer2?: ILayer) => ILayer): FeedForward;
    /**
     *
     * @returns {Function}
     */
    toFunction(): void;
    /**
     * This will create a TrainStream (WriteStream) for us to send the training data to.
     * @param opts training options
     * @returns {TrainStream|*}
     */
    createTrainStream(): void;
}
//# sourceMappingURL=feed-forward.d.ts.map