import { Filter } from './filter';
import { IConstantsThis, IKernelFunctionThis, IKernelMapRunShortcut, ISubKernelObject, KernelOutput } from 'gpu.js';
import { IConvolutionSettingsBase, IConvolutionConstantsBase } from './convolution';
import { ILayer, ILayerSettings } from './base-layer';
export declare function setSwitchY(value: number): number;
export declare function setSwitchX(value: number): number;
export interface IPredictConstants extends IConvolutionConstantsBase {
    inputWidth: number;
    inputHeight: number;
}
export declare function predict(this: IKernelFunctionThis<IPredictConstants>, inputs: number[][][]): number;
export interface ICompareConstants extends IConstantsThis {
    inputWidth: number;
    inputHeight: number;
    outputWidth: number;
    outputHeight: number;
}
export declare function compare(this: IKernelFunctionThis<ICompareConstants>, deltas: number[][], switchY: number[][], switchX: number[][]): number;
export declare function compare3D(this: IKernelFunctionThis<ICompareConstants>, deltas: number[][][], switchY: number[][][], switchX: number[][][]): number;
export interface IPoolSettings extends ILayerSettings, IConvolutionSettingsBase {
    switchX?: KernelOutput;
    switchY?: KernelOutput;
}
export declare const defaults: IPoolSettings;
export declare class Pool extends Filter {
    settings: Partial<IPoolSettings>;
    get strideX(): number;
    get strideY(): number;
    get paddingX(): number;
    get paddingY(): number;
    get width(): number;
    get height(): number;
    get depth(): number;
    get filterCount(): number;
    get switchX(): KernelOutput;
    set switchX(switchX: KernelOutput);
    get switchY(): KernelOutput;
    set switchY(switchY: KernelOutput);
    predictKernelMap: IKernelMapRunShortcut<ISubKernelObject> | null;
    constructor(settings: IPoolSettings, inputLayer: ILayer);
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function pool(settings: IPoolSettings, inputLayer: ILayer): Pool;
//# sourceMappingURL=pool.d.ts.map