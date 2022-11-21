import { ILayer, ILayerJSON, ILayerSettings } from './base-layer';
import { IKernelRunShortcut, Input, KernelOutput } from 'gpu.js';
import { IPraxis } from '../praxis/base-praxis';
export declare type InternalType = new (settings: Partial<ILayerSettings>) => ILayer;
export declare abstract class Internal implements ILayer {
    abstract settings: ILayerSettings;
    abstract predict(inputs?: KernelOutput): void;
    abstract compare(targetValues?: KernelOutput): void;
    abstract learn(learningRate?: number): void;
    abstract setupKernels(training?: boolean): void;
    predictKernel: IKernelRunShortcut | null;
    compareKernel: IKernelRunShortcut | null;
    praxis: IPraxis | null;
    get width(): number;
    get height(): number;
    get depth(): number;
    get weights(): KernelOutput | Input;
    set weights(weights: KernelOutput | Input);
    get deltas(): KernelOutput;
    set deltas(deltas: KernelOutput);
    toJSON(): Partial<ILayerJSON>;
    abstract reuseKernels(layer: ILayer): void;
}
//# sourceMappingURL=internal.d.ts.map