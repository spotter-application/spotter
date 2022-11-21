import { GPU, IConstantsThis, IGPUKernelSettings, IKernelMapRunShortcut, IKernelRunShortcut, Input, ISubKernelObject, KernelFunction, KernelOutput, OutputDimensions, ThreadFunction, ThreadKernelVariable } from 'gpu.js';
/**
 * Sets up the gpu.js instance
 */
export declare function setup(value: GPU): void;
/**
 * Destroys any existing gpu.js instance
 */
export declare function teardown(): void;
export declare function makeKernel<ArgTypes extends ThreadKernelVariable[] = ThreadKernelVariable[], ConstantsTypes extends IConstantsThis = IConstantsThis>(fn: KernelFunction<ArgTypes, ConstantsTypes>, settings: IGPUKernelSettings): IKernelRunShortcut;
export declare function makeKernelMap<ArgTypes extends ThreadKernelVariable[], ConstantsTypes extends IConstantsThis>(map: ISubKernelObject, fn: ThreadFunction<ArgTypes, ConstantsTypes>, settings: IGPUKernelSettings): IKernelMapRunShortcut<ISubKernelObject>;
/**
 * Compiles a function into a gpu.js dev mode kernel
 */
export declare function kernelInput(value: number[], size: OutputDimensions): Input;
/**
 * Deletes a gpu.js texture and frees VRAM
 */
export declare function release(possibleTexture: KernelOutput | Input): void;
/**
 * Cleans ie sets all elements to 0 of a Texture or a js array
 */
export declare function clear(value: KernelOutput): void;
/**
 * Clones a value
 */
export declare function clone(value: KernelOutput): KernelOutput;
//# sourceMappingURL=kernel.d.ts.map