import { KernelOutput } from 'gpu.js';
import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export interface IFilterSettings extends ILayerSettings {
    filterCount: number;
    filterWidth: number;
    filterHeight: number;
    filters?: KernelOutput;
    filterDeltas?: KernelOutput;
}
export declare type FilterType = new (settings: Partial<IFilterSettings>, inputLayer: ILayer) => ILayer;
export declare class Filter extends BaseLayer {
    get width(): number;
    get height(): number;
    get depth(): number;
    get filterCount(): number;
    get filterWidth(): number;
    get filterHeight(): number;
    get filters(): KernelOutput;
    set filters(filters: KernelOutput);
    get filterDeltas(): KernelOutput;
    set filterDeltas(filterDeltas: KernelOutput);
    settings: Partial<IFilterSettings>;
    inputLayer: ILayer;
    constructor(settings: Partial<IFilterSettings>, inputLayer: ILayer);
}
//# sourceMappingURL=filter.d.ts.map