import { KernelOutput } from 'gpu.js';
import { IPraxis } from '../praxis/base-praxis';
import { ILayer } from './base-layer';
import { Internal } from './internal';
export interface IRecurrentInput extends ILayer {
    setDimensions?: (width: number, height: number) => void;
}
export declare class RecurrentInput extends Internal implements IRecurrentInput {
    recurrentInput: ILayer;
    praxis: IPraxis | null;
    predictKernel: null;
    compareKernel: null;
    settings: {};
    constructor(recurrentInput: ILayer);
    get width(): number;
    get height(): number;
    get depth(): number;
    get deltas(): KernelOutput;
    set deltas(deltas: KernelOutput);
    get weights(): KernelOutput;
    set weights(weights: KernelOutput);
    validate(): void;
    setDimensions(width: number, height: number): void;
    predict(): void;
    compare(): void;
    learn(): void;
    setupKernels(): void;
    reuseKernels(): void;
}
//# sourceMappingURL=recurrent-input.d.ts.map