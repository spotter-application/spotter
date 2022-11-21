import { BasePraxis, IPraxisSettings } from './base-praxis';
import { ILayer } from '../layer/base-layer';
import { IConstantsThis, IKernelFunctionThis, IKernelMapRunShortcut, ISubKernelObject, ISubKernelsResults, KernelOutput } from 'gpu.js';
export declare function updateChange(value: number): number;
export interface IUpdateConstants extends IConstantsThis {
    learningRate: number;
    momentum: number;
}
export declare function update(this: IKernelFunctionThis<IUpdateConstants>, changes: number[][], weights: number[][], incomingWeights: number[][], inputDeltas: number[][]): number;
export interface IArthurDeviationWeightsSettings extends IPraxisSettings {
    learningRate?: number;
    momentum?: number;
    weightsLayer?: ILayer | null;
    incomingLayer?: ILayer | null;
    deltaLayer?: ILayer | null;
}
export interface IKernelMapResults extends ISubKernelsResults {
    changes: KernelOutput;
}
export declare const defaultSettings: IArthurDeviationWeightsSettings;
export declare class ArthurDeviationWeights extends BasePraxis {
    changes: KernelOutput;
    kernelMap: IKernelMapRunShortcut<ISubKernelObject> | null;
    settings: IArthurDeviationWeightsSettings;
    get learningRate(): number;
    get momentum(): number;
    get weightsLayer(): ILayer;
    set weightsLayer(layer: ILayer);
    get deltaLayer(): ILayer;
    set deltaLayer(layer: ILayer);
    get incomingLayer(): ILayer;
    set incomingLayer(layer: ILayer);
    constructor(layer: ILayer, settings?: IArthurDeviationWeightsSettings);
    run(): KernelOutput;
    setupKernels(): void;
}
export declare function arthurDeviationWeights(layer: ILayer, settings?: Partial<IArthurDeviationWeightsSettings>): ArthurDeviationWeights;
//# sourceMappingURL=arthur-deviation-weights.d.ts.map