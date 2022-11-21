import { ILayer } from '../layer';
import { IKernelRunShortcut, KernelOutput } from 'gpu.js';
export interface ILayerTemplate {
    width: number;
    height: number;
    depth: number;
}
export interface IPraxisJSON {
    width: number;
    height: number;
    depth: number;
}
export interface IPraxisSettings {
    width?: number;
    height?: number;
    depth?: number;
    kernel?: IKernelRunShortcut | null;
}
export interface IPraxis {
    layerTemplate: ILayerTemplate | null;
    kernel: IKernelRunShortcut | null;
    settings: Partial<IPraxisSettings>;
    setupKernels: () => void;
    width: number;
    height: number;
    depth: number;
    run: ((layer: ILayer, learningRate: number) => KernelOutput) | ((layer: ILayer, learningRate?: number) => KernelOutput);
    toJSON: () => Partial<IPraxisSettings>;
}
export declare abstract class BasePraxis implements IPraxis {
    layerTemplate: ILayerTemplate;
    kernel: IKernelRunShortcut | null;
    settings: Partial<IPraxisSettings>;
    get width(): number;
    get height(): number;
    get depth(): number;
    constructor(layerTemplate: ILayerTemplate, settings?: Partial<IPraxisSettings>);
    setupKernels(): void;
    reuseKernels(praxis: IPraxis): void;
    abstract run(layer: ILayer, learningRate?: number): KernelOutput;
    toJSON(): Partial<IPraxisSettings>;
}
//# sourceMappingURL=base-praxis.d.ts.map