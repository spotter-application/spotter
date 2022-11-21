import { IArthurDeviationWeightsSettings } from '../praxis/arthur-deviation-weights';
import { IArthurDeviationBiasesSettings } from '../praxis/arthur-deviation-biases';
import { ILayer } from './base-layer';
import { IRandomSettings } from './random';
import { Sigmoid } from './sigmoid';
import { IPraxis } from '../praxis/base-praxis';
export interface IArthurFeedForwardPraxisSettings extends IArthurDeviationBiasesSettings, IArthurDeviationWeightsSettings {
}
export interface IArthurFeedForwardSettings extends IRandomSettings {
    initPraxis?: (layerTemplate: ILayer, settings?: IArthurFeedForwardPraxisSettings | null) => IPraxis;
}
export declare function arthurFeedForward(settings: IArthurFeedForwardPraxisSettings, inputLayer: ILayer): Sigmoid;
//# sourceMappingURL=arthur-feed-forward.d.ts.map