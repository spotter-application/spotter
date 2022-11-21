import { KernelOutput } from 'gpu.js';
import { Internal } from './internal';
import { ILayer, ILayerSettings } from './base-layer';
export declare class RecurrentConnection extends Internal {
    settings: ILayerSettings;
    layer: ILayer | null;
    setLayer(layer: ILayer): void;
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get deltas(): KernelOutput;
    set deltas(deltas: KernelOutput);
    get weights(): KernelOutput;
    set weights(weights: KernelOutput);
    predict(): void;
    compare(): void;
    learn(): void;
    setupKernels(): void;
    reuseKernels(): void;
}
//# sourceMappingURL=recurrent-connection.d.ts.map