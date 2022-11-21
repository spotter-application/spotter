import { Operator } from './operator';
import { ILayer, ILayerSettings } from './base-layer';
import { IKernelFunctionThis } from 'gpu.js';
export declare function predict(this: IKernelFunctionThis, inputLayerWeights1: number[][], inputLayerWeights2: number[][]): number;
export declare function compare(this: IKernelFunctionThis, weights: number[][], deltas: number[][]): number;
export declare class MultiplyElement extends Operator {
    get width(): number;
    get height(): number;
    get depth(): number;
    validate(): void;
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function multiplyElement(inputLayer1: ILayer, inputLayer2: ILayer, settings?: ILayerSettings): MultiplyElement;
//# sourceMappingURL=multiply-element.d.ts.map