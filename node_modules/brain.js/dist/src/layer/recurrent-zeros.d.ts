import { IPraxis } from '../praxis/base-praxis';
import { ILayerSettings } from './base-layer';
import { Internal } from './internal';
import { IRecurrentInput } from './recurrent-input';
export declare class RecurrentZeros extends Internal implements IRecurrentInput {
    praxis: IPraxis | null;
    settings: Partial<ILayerSettings>;
    predictKernel: null;
    compareKernel: null;
    constructor(settings?: Partial<ILayerSettings>);
    setDimensions(width: number, height: number): void;
    setupKernels(): void;
    reuseKernels(): void;
    predict(): void;
    compare(): void;
    learn(learningRate: number): void;
}
export declare function recurrentZeros(): RecurrentZeros;
//# sourceMappingURL=recurrent-zeros.d.ts.map