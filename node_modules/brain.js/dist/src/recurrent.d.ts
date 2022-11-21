import { RecurrentConnection } from './layer/recurrent-connection';
import { IRecurrentInput, ILayer } from './layer';
import { FeedForward, IFeedForwardOptions, IFeedForwardTrainingOptions, ITrainingStatus } from './feed-forward';
import { KernelOutput, TextureArrayOutput } from 'gpu.js';
export interface IRecurrentTrainingOptions extends IFeedForwardTrainingOptions {
}
export interface IRecurrentOptions extends IFeedForwardOptions {
    hiddenLayers: Array<(inputLayer: ILayer, recurrentInput: IRecurrentInput, index: number) => ILayer>;
}
export interface IRecurrentPreppedTrainingData<T> {
    status: ITrainingStatus;
    preparedData: T[][];
    endTime: number;
}
export declare class Recurrent<T extends TextureArrayOutput = TextureArrayOutput> extends FeedForward {
    trainOpts: IRecurrentTrainingOptions;
    options: IRecurrentOptions;
    _outputConnection: RecurrentConnection | null;
    _layerSets: ILayer[][];
    _hiddenLayerOutputIndices: number[];
    _model: ILayer[] | null;
    constructor(options?: Partial<IRecurrentOptions & IRecurrentTrainingOptions>);
    _connectLayers(): {
        inputLayer: ILayer;
        hiddenLayers: ILayer[];
        outputLayer: ILayer;
    };
    _connectLayersDeep(): ILayer[];
    _connectHiddenLayers(previousLayer: ILayer): ILayer[];
    initialize(): void;
    initializeDeep(): void;
    run(inputs: T[]): T[];
    runInput(input: KernelOutput): KernelOutput;
    runInputs(inputs: T[]): KernelOutput;
    train(data: T[][], options?: Partial<IRecurrentTrainingOptions>): ITrainingStatus;
    end(): void;
    transferData(formattedData: T[][]): T[][];
    _prepTraining(data: T[][], options: Partial<IRecurrentTrainingOptions>): IRecurrentPreppedTrainingData<T>;
    _calculateTrainingError(data: T[][]): number;
    formatData(data: Float32Array): Float32Array;
    _calculateDeltas(target: T[]): void;
    adjustWeights(): void;
    _trainPatterns(data: T[][]): void;
    _trainPattern(inputs: T[], logErrorRate: boolean): KernelOutput | null;
}
//# sourceMappingURL=recurrent.d.ts.map