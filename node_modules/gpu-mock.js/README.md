# gpu-mock.js
A simple mocker for testing threaded development.

## GPU testing
GPU testing should be easy, but it isn't... ur, uh, wasn't.  This lib aims to resolve that.  By testing with simple javascript that is transpiled to GPU code, we can have the best of both worlds.  A mature debugging environment (javascript), and an accelerated environment (glsl).

## Install
`npm i gpu-mock.js --saveDev`

## Use
```js
import { gpuMock } from 'gpu-mock.js'

const testKernel = gpuMock(myKernelFunction, gpuJsOptions);

const results = testKernel();
```

## Why
**gpu.js**, and further the GPU, do a lot under the hood that can make debugging challenging. **gpu-mock.js** provides a pure and simple javascript environment for testing the functions that are planned to be used with **gpu.js**.
