import { Activation } from './types';
import { IKernelFunctionThis } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
export declare function predict2D(this: IKernelFunctionThis, inputs: number[][]): number;
export declare function predict3D(this: IKernelFunctionThis, inputs: number[][][]): number;
export declare function compare2D(this: IKernelFunctionThis, weights: number[][], deltas: number[][]): number;
export declare function compare3D(this: IKernelFunctionThis, weights: number[][][], deltas: number[][][]): number;
export declare class LeakyRelu extends Activation {
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function leakyRelu(inputLayer: ILayer, settings: ILayerSettings): LeakyRelu;
//# sourceMappingURL=leaky-relu.d.ts.map