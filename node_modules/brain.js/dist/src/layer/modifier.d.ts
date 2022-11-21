import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export declare type ModifierType = new (inputLayer: ILayer, settings?: Partial<ILayerSettings>) => ILayer;
export declare class Modifier extends BaseLayer {
    inputLayer: ILayer;
    constructor(inputLayer: ILayer, settings?: Partial<ILayerSettings>);
    validate(): void;
}
//# sourceMappingURL=modifier.d.ts.map