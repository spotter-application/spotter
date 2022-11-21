import { BaseLayer, ILayer, ILayerSettings } from './base-layer';
export { Activation } from './activation';
export { Filter } from './filter';
export { Internal } from './internal';
export { Modifier } from './modifier';
export { Operator } from './operator';
export { Target } from './target';
export declare class InternalModel {
}
export declare type EntryPointType = new (settings: Partial<ILayerSettings>) => ILayer;
export declare class EntryPoint extends BaseLayer {
}
export declare class Model extends BaseLayer {
    learn(learningRate?: number): void;
}
//# sourceMappingURL=types.d.ts.map