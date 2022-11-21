import { BaseLayer, ILayerSettings, ILayer } from './base-layer';
export declare type ActivationType = new (inputLayer: ILayer, settings: Partial<ILayerSettings>) => ILayer;
export declare class Activation extends BaseLayer {
    inputLayer: ILayer;
    get width(): number;
    get height(): number;
    get depth(): number;
    constructor(inputLayer: ILayer, settings?: Partial<ILayerSettings>);
}
//# sourceMappingURL=activation.d.ts.map