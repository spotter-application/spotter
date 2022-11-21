import { ILayer, ILayerSettings } from './base-layer';
import { Model } from './types';
export interface IRandomSettings extends ILayerSettings {
    std?: number | null;
}
export declare const defaults: IRandomSettings;
export declare class Random extends Model implements ILayer {
    settings: IRandomSettings;
    constructor(settings: Partial<IRandomSettings>);
    predict(): void;
    compare(): void;
}
export declare function random(settings: IRandomSettings): Random;
//# sourceMappingURL=random.d.ts.map