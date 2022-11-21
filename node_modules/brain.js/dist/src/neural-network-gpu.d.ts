import { GPU, IKernelFunctionThis, IKernelMapRunShortcut, IMappedKernelResult, KernelOutput } from 'gpu.js';
import { ITrainingStatus } from './feed-forward';
import { INeuralNetworkDatum, INeuralNetworkJSON, INeuralNetworkOptions, INeuralNetworkPreppedTrainingData, INeuralNetworkTrainOptions, NeuralNetwork } from './neural-network';
export interface INeuralNetworkGPUDatumFormatted {
    input: KernelOutput;
    output: KernelOutput;
}
export interface INeuralNetworkGPUPreppedTrainingData extends INeuralNetworkPreppedTrainingData<KernelOutput> {
    status: ITrainingStatus;
    endTime: number;
}
export interface INeuralNetworkGPUOptions extends INeuralNetworkOptions {
    mode?: 'cpu' | 'gpu';
}
export declare type BackPropagateOutput = (this: IKernelFunctionThis, outputs: KernelOutput, targets: KernelOutput) => {
    result: KernelOutput;
    error: KernelOutput;
};
export declare type BackPropagateLayer = (this: IKernelFunctionThis, weights: KernelOutput, outputs: KernelOutput, deltas: KernelOutput) => {
    result: KernelOutput;
    error: KernelOutput;
};
export declare class NeuralNetworkGPU<InputType, OutputType> extends NeuralNetwork<InputType, OutputType> {
    gpu: GPU;
    texturizeInputData: (value: KernelOutput) => KernelOutput;
    forwardPropagate: Array<(weights: KernelOutput, biases: KernelOutput, inputs: KernelOutput) => KernelOutput>;
    backwardPropagate: Array<BackPropagateOutput | BackPropagateLayer>;
    changesPropagate: Array<((this: IKernelFunctionThis<{
        size: number;
        learningRate: number;
        momentum: number;
    }>, previousOutputs: number[], deltas: number[], weights: number[][], previousChanges: number[][]) => IMappedKernelResult) & IKernelMapRunShortcut<{
        weights: number[][];
        changes: number[][];
    }>>;
    biasesPropagate: Array<(biases: KernelOutput, deltas: KernelOutput) => KernelOutput>;
    getMSE: (error: KernelOutput) => KernelOutput;
    _addMSE: (sum: KernelOutput, error: KernelOutput) => KernelOutput;
    _divideMSESum: (length: number, sum: KernelOutput) => KernelOutput;
    outputs: KernelOutput[];
    deltas: KernelOutput[];
    errors: KernelOutput[];
    weights: KernelOutput[];
    changes: KernelOutput[];
    biases: KernelOutput[];
    constructor(options?: Partial<INeuralNetworkGPUOptions>);
    initialize(): void;
    setActivation(): void;
    trainPattern(value: INeuralNetworkGPUDatumFormatted, logErrorRate?: boolean): KernelOutput | null;
    calculateTrainingError(data: INeuralNetworkGPUDatumFormatted[]): number;
    adjustWeights(): void;
    buildRunInput(): void;
    runInput: (input: KernelOutput) => KernelOutput;
    buildCalculateDeltas(): void;
    calculateDeltas: (target: KernelOutput) => void;
    buildGetChanges(): void;
    getChanges(): void;
    buildChangeBiases(): void;
    changeBiases(): void;
    buildGetMSE(): void;
    run(input: InputType): OutputType;
    prepTraining(data: Array<INeuralNetworkDatum<InputType, OutputType>>, options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkGPUPreppedTrainingData;
    toFunction(): (input: InputType) => OutputType;
    toJSON(): INeuralNetworkJSON;
}
//# sourceMappingURL=neural-network-gpu.d.ts.map