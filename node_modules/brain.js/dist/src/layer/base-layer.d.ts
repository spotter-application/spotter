import { IKernelRunShortcut, Input, KernelOutput, TextureArrayOutput } from 'gpu.js';
import { IPraxis, IPraxisSettings } from '../praxis/base-praxis';
export interface ILayerJSON {
    width?: number;
    height?: number;
    depth?: number;
    weights?: number[] | number[][] | number[][][] | null;
    type: string;
    inputLayerIndex?: number;
    inputLayer1Index?: number;
    inputLayer2Index?: number;
    praxisOpts?: Partial<IPraxisSettings> | null;
}
export interface ILayer {
    width: number;
    height: number;
    depth: number;
    weights: KernelOutput | Input;
    deltas: KernelOutput;
    praxis: IPraxis | null;
    errors?: KernelOutput | null;
    setupKernels: (training?: boolean) => void;
    predictKernel: IKernelRunShortcut | null;
    compareKernel: IKernelRunShortcut | null;
    settings: Partial<ILayerSettings>;
    reuseKernels: (layer: ILayer) => void;
    predict: (inputs?: KernelOutput) => void;
    compare: (targetValues?: KernelOutput) => void;
    learn: ((learningRate?: number) => void) | ((learningRate: number) => void);
    toJSON: () => Partial<ILayerJSON>;
    inputLayer?: ILayer;
    inputLayer1?: ILayer;
    inputLayer2?: ILayer;
    index?: number;
    id?: string;
}
export interface ILayerSettings {
    width?: number | null;
    height?: number | null;
    depth?: number | null;
    weights?: KernelOutput | null;
    deltas?: KernelOutput | null;
    id?: string;
    praxis?: IPraxis | null;
    praxisOpts?: Partial<IPraxisSettings> | null;
    initPraxis?: ((layerTemplate: ILayer, settings?: IPraxisSettings) => IPraxis) | null;
    cleanupDeltas?: boolean;
}
export declare const baseLayerDefaultSettings: ILayerSettings;
export declare type BaseLayerType = new (settings?: Partial<ILayerSettings>) => ILayer;
export declare class BaseLayer implements ILayer {
    praxis: IPraxis | null;
    predictKernel: IKernelRunShortcut | null;
    compareKernel: IKernelRunShortcut | null;
    settings: Partial<ILayerSettings>;
    get width(): number;
    get height(): number;
    get depth(): number;
    get weights(): KernelOutput | Input;
    set weights(weights: KernelOutput | Input);
    get deltas(): KernelOutput;
    set deltas(deltas: KernelOutput);
    get id(): string;
    set id(title: string);
    constructor(settings?: Partial<ILayerSettings>);
    setupPraxis(): void;
    validate(): void;
    setupKernels(isTraining?: boolean): void;
    reuseKernels(layer: ILayer): void;
    predict(inputs?: KernelOutput): void;
    compare(targetValues?: KernelOutput): void;
    learn(learningRate?: number): void;
    toArray(): TextureArrayOutput;
    toJSON(): Partial<ILayerJSON>;
    static toJSON(layer: ILayer): Partial<ILayerJSON>;
}
//# sourceMappingURL=base-layer.d.ts.map