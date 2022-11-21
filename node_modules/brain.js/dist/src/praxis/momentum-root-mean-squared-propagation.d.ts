import { BasePraxis, ILayerTemplate, IPraxisSettings } from './base-praxis';
import { IConstantsThis, IKernelFunctionThis, IKernelMapRunShortcut, ISubKernelObject, KernelOutput } from 'gpu.js';
import { ILayer } from '../layer';
export declare function getMomentum(delta: number, decay: number, previousMomentum: number): number;
export declare function clipByValue(value: number, max: number, min: number): number;
interface IUpdate extends IConstantsThis {
    clipValue: number;
    decayRate: number;
    smoothEps: number;
    regularizationStrength: number;
}
/**
 * @description Momentum Root Mean Square Propagation Function
 */
export declare function update(this: IKernelFunctionThis<IUpdate>, weights: number[][], deltas: number[][], previousMomenta: number[][]): number;
export declare function isClippedByValue(value: number, max: number, min: number): number;
export interface IMomentumRootMeanSquaredPropagationSettings extends IPraxisSettings {
    decayRate?: number;
    regularizationStrength?: number;
    learningRate?: number;
    smoothEps: number;
    clipValue: number;
}
export declare const defaults: IMomentumRootMeanSquaredPropagationSettings;
export declare class MomentumRootMeanSquaredPropagation extends BasePraxis {
    momenta: KernelOutput;
    kernelMap: IKernelMapRunShortcut<ISubKernelObject> | null;
    settings: Partial<IMomentumRootMeanSquaredPropagationSettings>;
    get clipValue(): number;
    get decayRate(): number;
    get learningRate(): number;
    get regularizationStrength(): number;
    get smoothEps(): number;
    constructor(layerTemplate: ILayerTemplate, settings?: Partial<IMomentumRootMeanSquaredPropagationSettings>);
    run(layer: ILayer): KernelOutput;
    setupKernels(): void;
}
export declare function momentumRootMeanSquaredPropagation(layer: ILayer, settings: Partial<IMomentumRootMeanSquaredPropagationSettings>): MomentumRootMeanSquaredPropagation;
/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 */
export declare const MRmsProp: typeof MomentumRootMeanSquaredPropagation;
export declare const mRmsProp: typeof momentumRootMeanSquaredPropagation;
export {};
//# sourceMappingURL=momentum-root-mean-squared-propagation.d.ts.map