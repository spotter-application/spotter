import { IKernelRunShortcut, IKernelFunctionThis } from 'gpu.js';
interface mse2dThis extends IKernelFunctionThis {
    constants: {
        height: number;
        width: number;
        length: number;
    };
}
/**
 * 2D Mean Squared Error
 */
export declare function mse2d(this: mse2dThis, errors: Array<[number, number]>): number;
export declare class MeanSquaredError {
    /** Calculate the mean squared error given an array of errors */
    calculate: IKernelRunShortcut;
    /** Returns the sum of absolute values of previuous error and previous layer errors */
    addAbsolute: IKernelRunShortcut;
    /** Adds two erros */
    add: IKernelRunShortcut;
    /** Returns the ratio of sum of errors and length (ie the average) */
    divide: IKernelRunShortcut;
    constructor({ width, height }: {
        width: number;
        height: number;
    });
}
export {};
//# sourceMappingURL=mean-squared-error.d.ts.map