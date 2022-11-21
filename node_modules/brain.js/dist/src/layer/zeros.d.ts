import { Model } from './types';
import { ILayerSettings } from './base-layer';
export declare class Zeros extends Model {
    constructor(settings: ILayerSettings);
    predict(): void;
    compare(): void;
}
export declare function zeros(settings: ILayerSettings): Zeros;
//# sourceMappingURL=zeros.d.ts.map