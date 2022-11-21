import { IKernelFunctionThis } from 'gpu.js';
import { ILayer } from './base-layer';
import { Modifier } from './types';
export declare function predict(this: IKernelFunctionThis, value: number[][]): number;
export declare class Transpose extends Modifier {
    get width(): number;
    get height(): number;
    constructor(inputLayer: ILayer);
    setupKernels(): void;
    predict(): void;
    compare(): void;
}
export declare function transpose(inputLayer: ILayer): Transpose;
//# sourceMappingURL=transpose.d.ts.map