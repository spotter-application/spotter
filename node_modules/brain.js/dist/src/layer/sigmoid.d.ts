import { ILayer, ILayerSettings } from './base-layer';
import { IKernelFunctionThis } from 'gpu.js';
import { Activation } from './types';
export declare function predict2D(this: IKernelFunctionThis, inputs: number[][]): number;
export declare function predict3D(this: IKernelFunctionThis, inputs: number[][][]): number;
export declare function compare2D(this: IKernelFunctionThis, weights: number[][], deltas: number[][]): number;
export declare function compare3D(this: IKernelFunctionThis, weights: number[][][], deltas: number[][][]): number;
export declare class Sigmoid extends Activation {
    setupKernels(): void;
    predict(): void;
    compare(): void;
    learn(learningRate?: number): void;
}
export declare function sigmoid(inputLayer: ILayer, settings?: ILayerSettings): Sigmoid;
//# sourceMappingURL=sigmoid.d.ts.map