import { IKernelRunShortcut, KernelOutput } from 'gpu.js';
import { EntryPoint } from './types';
import { ILayer, ILayerSettings } from './base-layer';
export declare const defaults: ILayerSettings;
export declare class Input extends EntryPoint {
    reshapeInput: IKernelRunShortcut | null;
    constructor(settings: ILayerSettings);
    setupKernels(): void;
    reuseKernels(layer: ILayer): void;
    predict(inputs: KernelOutput): void;
    predict1D(inputs: KernelOutput): void;
    compare(): void;
    learn(): void;
}
export declare function input(settings: ILayerSettings): Input;
//# sourceMappingURL=input.d.ts.map