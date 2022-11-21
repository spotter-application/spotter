import { IConvolutionSettingsBase } from '../layer/convolution';
export interface IStride {
    strideX: number;
    strideY: number;
}
export declare function getStride(settings: IConvolutionSettingsBase, defaults: IConvolutionSettingsBase): IStride;
export interface IPadding {
    paddingX: number;
    paddingY: number;
}
export declare function getPadding(settings: IConvolutionSettingsBase, defaults: IConvolutionSettingsBase): IPadding;
//# sourceMappingURL=layer-setup.d.ts.map