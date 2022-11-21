import { BasePraxis, IPraxisSettings } from './base-praxis';
import { ILayer } from '../layer/base-layer';
import { IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';
export interface IUpdateThis extends IKernelFunctionThis {
    constants: {
        learningRate: number;
    };
}
export declare function update(this: IUpdateThis, weights: number[][], deltas: number[][]): number;
export interface IArthurDeviationBiasesSettings extends IPraxisSettings {
    learningRate?: number;
}
export declare const defaultSettings: {
    learningRate: number;
};
export declare class ArthurDeviationBiases extends BasePraxis {
    settings: IArthurDeviationBiasesSettings;
    kernel: IKernelRunShortcut | null;
    constructor(layer: ILayer, settings?: IArthurDeviationBiasesSettings);
    run(layer: ILayer): KernelOutput;
    setupKernels(): void;
}
export declare function arthurDeviationBiases(layer: ILayer, settings?: Partial<IArthurDeviationBiasesSettings>): ArthurDeviationBiases;
//# sourceMappingURL=arthur-deviation-biases.d.ts.map