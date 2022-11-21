import { BaseLayer, ILayerSettings, ILayer } from './base-layer';
export declare type OperatorType = new (inputLayer1: ILayer, inputLayer2: ILayer, settings?: Partial<ILayerSettings>) => ILayer;
export declare abstract class Operator extends BaseLayer {
    inputLayer1: ILayer;
    inputLayer2: ILayer;
    constructor(inputLayer1: ILayer, inputLayer2: ILayer, settings?: Partial<ILayerSettings>);
}
//# sourceMappingURL=operator.d.ts.map