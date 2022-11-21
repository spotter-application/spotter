import { IConstantsThis, IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';
import { Filter, IFilterSettings } from './filter';
import { ILayer } from './base-layer';
export interface IPredictConstants extends IConstantsThis {
    inputWidth: number;
    inputHeight: number;
}
export declare function predict(this: IKernelFunctionThis<IPredictConstants>, inputs: number[][], filters: number[][], biases: number[]): number;
export declare function predict3D(this: IKernelFunctionThis<IPredictConstants>, inputs: number[][][], filters: number[][], biases: number[]): number;
export interface ICompareInputDeltasConstants extends IConstantsThis {
    filterCount: number;
}
export declare function compareInputDeltas(this: IKernelFunctionThis<ICompareInputDeltasConstants>, inputDeltas: number[][], deltas: number[][], filters: number[][]): number;
export declare function compareInputDeltas3D(this: IKernelFunctionThis<ICompareInputDeltasConstants>, inputDeltas: number[][][], deltas: number[][], filters: number[][]): number;
export declare function compareBiases(this: IKernelFunctionThis, biases: number[], deltas: number[][]): number;
export interface ICompareFiltersDeltas extends IConstantsThis {
    deltaX: number;
    deltaY: number;
    inputWidth: number;
    inputHeight: number;
}
export declare function compareFilterDeltas(this: IKernelFunctionThis<ICompareFiltersDeltas>, filterDeltas: number[][], inputWeights: number[][], deltas: number[][]): number;
export declare function compareFilterDeltas3D(this: IKernelFunctionThis<ICompareFiltersDeltas>, filterDeltas: number[][], inputWeights: number[][][], deltas: number[][]): number;
export interface IFullyConnectedDefaultSettings extends Partial<IFilterSettings> {
    bias?: number;
    biases?: KernelOutput;
    biasDeltas?: KernelOutput;
}
export declare const defaults: IFullyConnectedDefaultSettings;
export declare class FullyConnected extends Filter {
    get bias(): number;
    get biases(): KernelOutput;
    set biases(biases: KernelOutput);
    get biasDeltas(): KernelOutput;
    set biasDeltas(biasDeltas: KernelOutput);
    settings: Partial<IFullyConnectedDefaultSettings>;
    compareFilterDeltasKernel: IKernelRunShortcut | null;
    compareInputDeltasKernel: IKernelRunShortcut | null;
    compareBiasesKernel: IKernelRunShortcut | null;
    constructor(settings: Partial<IFullyConnectedDefaultSettings>, inputLayer: ILayer);
    validate(): void;
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function fullyConnected(settings: IFullyConnectedDefaultSettings, inputLayer: ILayer): FullyConnected;
//# sourceMappingURL=fully-connected.d.ts.map