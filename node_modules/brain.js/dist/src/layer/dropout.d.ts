import { Filter, IFilterSettings } from './filter';
import { IConstantsThis, IKernelFunctionThis, IKernelMapRunShortcut, ISubKernelObject, KernelOutput } from 'gpu.js';
import { ILayer, ILayerSettings } from './base-layer';
export declare function setDropout(dropout: number): number;
export interface IDropoutConstants extends IConstantsThis {
    probability: number;
}
export declare function trainingPredict(this: IKernelFunctionThis<IDropoutConstants>, inputs: number[][]): number;
export declare function predict(this: IKernelFunctionThis<IDropoutConstants>, inputs: number[][]): number;
export declare function compare(this: IKernelFunctionThis, dropouts: number[][], deltas: number[][]): number;
export interface IDropoutSettings extends ILayerSettings {
    probability: number;
}
export declare const dropoutDefaults: IDropoutSettings;
export declare class Dropout extends Filter {
    dropouts: KernelOutput | null;
    predictKernelMap: IKernelMapRunShortcut<ISubKernelObject> | null;
    settings: Partial<IDropoutSettings>;
    constructor(inputLayer: ILayer, settings?: Partial<IDropoutSettings> & Partial<IFilterSettings>);
    setupKernels(isTraining?: boolean): void;
    predict(): void;
    compare(): void;
}
export declare function dropout(inputLayer: ILayer, settings?: Partial<IDropoutSettings>): Dropout;
//# sourceMappingURL=dropout.d.ts.map