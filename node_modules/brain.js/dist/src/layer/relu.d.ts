import { IKernelFunctionThis } from 'gpu.js';
import { Activation } from './types';
import { ILayer, ILayerSettings } from './base-layer';
export declare function predict2D(this: IKernelFunctionThis, inputs: number[][]): number;
export declare function compare2D(this: IKernelFunctionThis, weights: number[][], deltas: number[][]): number;
export declare function predict3D(this: IKernelFunctionThis, inputs: number[][][]): number;
export declare function compare3D(this: IKernelFunctionThis, weights: number[][][], deltas: number[][][]): number;
export declare class Relu extends Activation {
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function relu(inputLayer: ILayer, settings?: ILayerSettings): Relu;
//# sourceMappingURL=relu.d.ts.map