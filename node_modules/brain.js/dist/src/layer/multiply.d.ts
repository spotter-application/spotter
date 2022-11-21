import { Operator } from './operator';
import { IConstantsThis, IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';
import { ILayer, ILayerJSON, ILayerSettings } from './base-layer';
export interface IMultiplyConstants extends IConstantsThis {
    size: number;
}
export declare function predict(this: IKernelFunctionThis<IMultiplyConstants>, weights1: number[][], weights2: number[][]): number;
export declare function compareFromX(this: IKernelFunctionThis<IMultiplyConstants>, deltas: number[][], inputDeltas: number[][], inputWeights: number[][]): number;
export declare function compareFromY(this: IKernelFunctionThis<IMultiplyConstants>, deltas: number[][], inputDeltas: number[][], inputWeights: number[][]): number;
export declare class Multiply extends Operator {
    compareKernel1: IKernelRunShortcut | null;
    compareKernel2: IKernelRunShortcut | null;
    get width(): number;
    set width(width: number);
    get height(): number;
    set height(height: number);
    get depth(): number;
    set depth(depth: number);
    validate(): void;
    setupKernels(): void;
    reuseKernels(layer: ILayer): void;
    predict(): void;
    compare(): void;
    setupPraxis(): void;
    toJSON(): Partial<ILayerJSON>;
}
export declare function multiply(inputLayer1: ILayer, inputLayer2: ILayer, settings?: ILayerSettings): Multiply;
//# sourceMappingURL=multiply.d.ts.map