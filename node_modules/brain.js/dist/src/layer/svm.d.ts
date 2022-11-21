import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export declare class SVM extends BaseLayer {
    inputLayer: ILayer;
    constructor(inputLayer: ILayer, settings: ILayerSettings);
    predict(): void;
    learn(): void;
}
export declare function svm(inputLayer: ILayer, settings: ILayerSettings): SVM;
//# sourceMappingURL=svm.d.ts.map