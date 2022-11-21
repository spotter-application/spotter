/// <reference types="jest" />
import { IGPUTextureSettings, Texture } from 'gpu.js';
import { ILayerTemplate, IPraxis, IPraxisSettings } from '../src/praxis/base-praxis';
import { BaseLayer, ILayerSettings, ILayer } from '../src/layer/base-layer';
export declare const xorTrainingData: {
    input: number[];
    output: number[];
}[];
export declare function onePlusPlus3D(width: number, height: number, depth: number): number[][][];
export declare function onePlusPlus2D(width: number, height: number): number[][];
export declare function zero3D(width: number, height: number, depth: number): number[][][];
export declare function zero2D(width: number, height: number): number[][];
export declare function allDeltas(model: any, fn: any): void;
export declare function allMatrices(model: any, fn: any): void;
export declare function shave(value: Float32Array): Float32Array;
export declare function shave2D(value: Float32Array[]): Float32Array[];
export declare function shave3D(value: Float32Array[][]): Float32Array[][];
export declare function expectFunction(source: string, fn: Function): void;
export declare class TestLayer extends BaseLayer {
    get width(): number;
    get height(): number;
    get depth(): number;
    constructor(settings: ILayerSettings);
}
export declare function mockLayer(settings?: ILayerSettings): ILayer;
export declare function mockTexture(settings?: Partial<IGPUTextureSettings>): Texture;
export declare function mockPraxis(layerTemplate: ILayerTemplate, praxisSettings?: Partial<IPraxisSettings>): IPraxis;
export interface IWithCompareKernel {
    compareKernel: jest.Mock;
}
export interface IWithPredictKernel {
    predictKernel: jest.Mock;
}
export interface IWithPredictKernelMap {
    predictKernelMap: jest.Mock;
}
//# sourceMappingURL=test-utils.d.ts.map