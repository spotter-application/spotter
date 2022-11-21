import {
  KernelFunction,
  IKernelSettings,
  IKernelRunShortcut,
  ThreadKernelVariable,
  IKernelFunctionThis,
  IConstantsThis,
  ThreadFunction
} from 'gpu.js';

export function gpuMock(this: IKernelFunctionThis, kernelFunction: KernelFunction, settings?: IKernelSettings): IKernelRunShortcut;
export function gpuMock<
  ArgTypes extends ThreadKernelVariable[] = ThreadKernelVariable[],
  ConstantsT extends IConstantsThis = null
  >(
  kernelFunction: ThreadFunction<ArgTypes, ConstantsT>,
  settings?: IKernelSettings
): IKernelRunShortcut;
