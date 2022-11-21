import { IConstantsThis, IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
import { Modifier } from './modifier';
interface ISoftMaxConstants extends IConstantsThis {
    inputWidth: number;
}
export declare function getMaxValue(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[]): number;
export declare function getMaxValue2D(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[][]): number;
export declare function getMaxValue3D(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[][][]): number;
export declare function getSum(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[]): number;
export declare function getSum2D(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[][]): number;
export declare function getSum3D(this: IKernelFunctionThis<ISoftMaxConstants>, inputs: number[][][]): number;
export declare function getExponentials(this: IKernelFunctionThis, inputs: number[], maxInput: number[]): number;
export declare function getExponentials2D(this: IKernelFunctionThis, inputs: number[][], maxInput: number[]): number;
export declare function getExponentials3D(this: IKernelFunctionThis, inputs: number[][][], maxInput: number[]): number;
export declare function predict(this: IKernelFunctionThis, exponentials: number[], exponentialsSum: number[]): number;
export declare function predict2D(this: IKernelFunctionThis, exponentials: number[][], exponentialsSum: number[]): number;
export declare function predict3D(this: IKernelFunctionThis, exponentials: number[][][], exponentialsSum: number[]): number;
export declare function compare(this: IKernelFunctionThis, target: number, exponentials: number[]): number;
export declare function compare2D(this: IKernelFunctionThis, target: number, exponentials: number[][]): number;
export declare function compare3D(this: IKernelFunctionThis, target: number, exponentials: number[][][]): number;
export declare function loss(): number;
export declare class SoftMax extends Modifier {
    getExponentialsKernel: IKernelRunShortcut | null;
    getMaxValueKernel: IKernelRunShortcut | null;
    getSumKernel: IKernelRunShortcut | null;
    errors: KernelOutput | null;
    constructor(inputLayer: ILayer, settings?: ILayerSettings);
    setupKernels(): void;
    predict(): void;
    compare(targetValues: KernelOutput): void;
}
export declare function softMax(inputLayer: ILayer, settings?: ILayerSettings): SoftMax;
export {};
//# sourceMappingURL=soft-max.d.ts.map