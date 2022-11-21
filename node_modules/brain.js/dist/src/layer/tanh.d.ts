import { IKernelFunctionThis } from 'gpu.js';
import { Activation } from './activation';
import { ILayer, ILayerSettings } from './base-layer';
export declare function predict2D(this: IKernelFunctionThis, inputs: number[][]): number;
export declare function predict3D(this: IKernelFunctionThis, inputs: number[][][]): number;
export declare function compare2D(this: IKernelFunctionThis, weights: number[][], errors: number[][]): number;
export declare function compare3D(this: IKernelFunctionThis, weights: number[][][], errors: number[][][]): number;
export declare class Tanh extends Activation {
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function tanh(inputLayer: ILayer, settings?: ILayerSettings): Tanh;
//# sourceMappingURL=tanh.d.ts.map