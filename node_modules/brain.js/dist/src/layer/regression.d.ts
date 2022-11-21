import { IKernelFunctionThis } from 'gpu.js';
import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export declare class Regression extends BaseLayer {
    inputLayer: ILayer;
    constructor(settings: ILayerSettings, inputLayer: ILayer);
    predict(): void;
    learn(): void;
}
export declare function learn(this: IKernelFunctionThis, inputs: number[], targets: number[]): number;
export declare function regression(settings: ILayerSettings, inputLayer: ILayer): Regression;
//# sourceMappingURL=regression.d.ts.map