import { IKernelFunctionThis, KernelOutput } from 'gpu.js';
import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export declare function compare1D(this: IKernelFunctionThis, weights: number[][], targetValues: number[]): number;
export declare function compare2D(this: IKernelFunctionThis, weights: number[][], targetValues: number[][]): number;
export declare type TargetType = new (settings: Partial<ILayerSettings>, inputLayer: ILayer) => ILayer;
export declare class Target extends BaseLayer {
    errors: KernelOutput;
    inputLayer: ILayer;
    constructor(settings: Partial<ILayerSettings>, inputLayer: ILayer);
    setupKernels(): void;
    predict(): void;
    compare(targetValues: KernelOutput): void;
    setupPraxis(): void;
}
export declare function target(settings: ILayerSettings, inputLayer: ILayer): Target;
//# sourceMappingURL=target.d.ts.map