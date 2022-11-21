import { Modifier } from './types';
import { IKernelFunctionThis } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
export declare function predict(this: IKernelFunctionThis, weights: number[][]): number;
export declare class Negative extends Modifier {
    constructor(inputLayer: ILayer, settings?: ILayerSettings);
    setupKernels(): void;
    predict(): void;
}
export declare function negative(inputLayer: ILayer, settings?: ILayerSettings): Negative;
//# sourceMappingURL=negative.d.ts.map