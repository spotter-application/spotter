import { Operator } from './operator';
import { IKernelFunctionThis } from 'gpu.js';
import { ILayerSettings, ILayer } from './base-layer';
export declare function predict(this: IKernelFunctionThis, inputWeights1: number[][], inputWeights2: number[][]): number;
export declare class Add extends Operator {
    get width(): number;
    get height(): number;
    get depth(): number;
    validate(): void;
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function add(inputLayer1: ILayer, inputLayer2: ILayer, settings?: ILayerSettings): Add;
//# sourceMappingURL=add.d.ts.map