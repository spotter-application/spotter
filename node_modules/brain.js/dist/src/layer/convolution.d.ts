import { Filter } from './filter';
import { IConstantsThis, IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
export interface IConvolutionConstantsBase extends IConstantsThis {
    paddingX: number;
    paddingY: number;
    strideX: number;
    strideY: number;
    filterWidth: number;
    filterHeight: number;
}
export interface IPredictConstants extends IConvolutionConstantsBase {
    inputWidth: number;
    inputHeight: number;
}
export declare function predict(this: IKernelFunctionThis<IPredictConstants>, inputs: number[][][], filters: number[][][], biases: number[]): number;
export interface ICompareFilterDeltasConstants extends IConvolutionConstantsBase {
    deltaWidth: number;
    deltaHeight: number;
    inputWidth: number;
    inputHeight: number;
    deltaZ: number;
}
export declare function compareFilterDeltas(this: IKernelFunctionThis<ICompareFilterDeltasConstants>, filterDeltas: number[][][], inputs: number[][][], deltas: number[][][]): number;
export interface ICompareInputDeltasConstants extends IConvolutionConstantsBase {
    deltaHeight: number;
    deltaWidth: number;
    deltaZ: number;
}
export declare function compareInputDeltas(this: IKernelFunctionThis<ICompareInputDeltasConstants>, inputDeltas: number[][][], filters: number[][][], deltas: number[][][]): number;
export interface ICompareBiasesConstants extends IConstantsThis {
    deltaHeight: number;
    deltaWdith: number;
}
export declare function compareBiases(this: IKernelFunctionThis<ICompareBiasesConstants>, biasDeltas: number[][][], deltas: number[][][]): number;
export interface IConvolutionSettingsBase {
    stride?: number;
    strideX?: number;
    strideY?: number;
    padding?: number;
    paddingX?: number;
    paddingY?: number;
    filterCount?: number;
    filterWidth?: number;
    filterHeight?: number;
}
export interface IConvolutionSettings extends ILayerSettings, IConvolutionSettingsBase {
    bias?: number;
    biases?: KernelOutput;
    biasDeltas?: KernelOutput;
    filters?: KernelOutput;
    filterDeltas?: KernelOutput;
}
export declare const defaults: IConvolutionSettings;
export declare class Convolution extends Filter {
    settings: Partial<IConvolutionSettings>;
    get strideX(): number;
    get strideY(): number;
    get paddingX(): number;
    get paddingY(): number;
    get width(): number;
    get height(): number;
    get bias(): number;
    get depth(): number;
    get biases(): KernelOutput;
    set biases(biases: KernelOutput);
    get biasDeltas(): KernelOutput;
    set biasDeltas(weights: KernelOutput);
    get filters(): KernelOutput;
    set filters(filters: KernelOutput);
    get filterDeltas(): KernelOutput;
    set filterDeltas(filterDeltas: KernelOutput);
    constructor(settings: IConvolutionSettings, inputLayer: ILayer);
    compareFilterDeltasKernel: IKernelRunShortcut | null;
    compareInputDeltasKernel: IKernelRunShortcut | null;
    compareBiasesKernel: IKernelRunShortcut | null;
    setupKernels(): void;
    predict(): void;
    compare(): void;
    learn(learningRate: number): void;
}
export declare function convolution(settings: IConvolutionSettings, inputLayer: ILayer): Convolution;
//# sourceMappingURL=convolution.d.ts.map