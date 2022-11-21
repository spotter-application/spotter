function setupArguments(args) {
  const newArguments = new Array(args.length);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.toArray) {
      newArguments[i] = arg.toArray();
    } else {
      newArguments[i] = arg;
    }
  }
  return newArguments;
}

function mock1D() {
  const args = setupArguments(arguments);
  const row = new Float32Array(this.output.x);
  for (let x = 0; x < this.output.x; x++) {
    this.thread.x = x;
    this.thread.y = 0;
    this.thread.z = 0;
    row[x] = this._fn.apply(this, args);
  }
  return row;
}

function mock2D() {
  const args = setupArguments(arguments);
  const matrix = new Array(this.output.y);
  for (let y = 0; y < this.output.y; y++) {
    const row = new Float32Array(this.output.x);
    for (let x = 0; x < this.output.x; x++) {
      this.thread.x = x;
      this.thread.y = y;
      this.thread.z = 0;
      row[x] = this._fn.apply(this, args);
    }
    matrix[y] = row;
  }
  return matrix;
}

function mock2DGraphical() {
  const args = setupArguments(arguments);
  for (let y = 0; y < this.output.y; y++) {
    for (let x = 0; x < this.output.x; x++) {
      this.thread.x = x;
      this.thread.y = y;
      this.thread.z = 0;
      this._fn.apply(this, args);
    }
  }
}

function mock3D() {
  const args = setupArguments(arguments);
  const cube = new Array(this.output.z);
  for (let z = 0; z < this.output.z; z++) {
    const matrix = new Array(this.output.y);
    for (let y = 0; y < this.output.y; y++) {
      const row = new Float32Array(this.output.x);
      for (let x = 0; x < this.output.x; x++) {
        this.thread.x = x;
        this.thread.y = y;
        this.thread.z = z;
        row[x] = this._fn.apply(this, args);
      }
      matrix[y] = row;
    }
    cube[z] = matrix;
  }
  return cube;
}

function apiDecorate(kernel) {
  kernel.setOutput = (output) => {
    kernel.output = setupOutput(output);
    if (kernel.graphical) {
      setupGraphical(kernel);
    }
  };
  kernel.toJSON = () => {
    throw new Error('Not usable with gpuMock');
  };
  kernel.setConstants = (flag) => {
    kernel.constants = flag;
    return kernel;
  };
  kernel.setGraphical = (flag) => {
    kernel.graphical = flag;
    return kernel;
  };
  kernel.setCanvas = (flag) => {
    kernel.canvas = flag;
    return kernel;
  };
  kernel.setContext = (flag) => {
    kernel.context = flag;
    return kernel;
  };
  kernel.destroy = () => {};
  kernel.validateSettings = () => {};
  if (kernel.graphical && kernel.output) {
    setupGraphical(kernel);
  }
  kernel.exec = function() {
    return new Promise((resolve, reject) => {
      try {
        resolve(kernel.apply(kernel, arguments));
      } catch(e) {
        reject(e);
      }
    });
  };
  kernel.getPixels = (flip) => {
    const {x, y} = kernel.output;
    // cpu is not flipped by default
    return flip ? flipPixels(kernel._imageData.data, x, y) : kernel._imageData.data.slice(0);
  };
  kernel.color = function(r, g, b, a) {
    if (typeof a === 'undefined') {
      a = 1;
    }

    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    a = Math.floor(a * 255);

    const width = kernel.output.x;
    const height = kernel.output.y;

    const x = kernel.thread.x;
    const y = height - kernel.thread.y - 1;

    const index = x + y * width;

    kernel._colorData[index * 4 + 0] = r;
    kernel._colorData[index * 4 + 1] = g;
    kernel._colorData[index * 4 + 2] = b;
    kernel._colorData[index * 4 + 3] = a;
  };

  // these are added for api compatibility, but have no affect
  const mockMethod = () => kernel;
  const methods = [
    'setWarnVarUsage',
    'setArgumentTypes',
    'setTactic',
    'setOptimizeFloatMemory',
    'setDebug',
    'setLoopMaxIterations',
    'setConstantTypes',
    'setFunctions',
    'setNativeFunctions',
    'setInjectedNative',
    'setPipeline',
    'setPrecision',
    'setOutputToTexture',
    'setImmutable',
    'setStrictIntegers',
    'setDynamicOutput',
    'setHardcodeConstants',
    'setDynamicArguments',
    'setUseLegacyEncoder',
    'setWarnVarUsage',
    'addSubKernel',
  ];
  for (let i = 0; i < methods.length; i++) {
    kernel[methods[i]] = mockMethod;
  }
  return kernel;
}

function setupGraphical(kernel) {
  const {x, y} = kernel.output;
  if (kernel.context && kernel.context.createImageData) {
    const data = new Uint8ClampedArray(x * y * 4);
    kernel._imageData = kernel.context.createImageData(x, y);
    kernel._colorData = data;
  } else {
    const data = new Uint8ClampedArray(x * y * 4);
    kernel._imageData = { data };
    kernel._colorData = data;
  }
}

function setupOutput(output) {
  let result = null;
  if (output.length) {
    if (output.length === 3) {
      const [x,y,z] = output;
      result = { x, y, z };
    } else if (output.length === 2) {
      const [x,y] = output;
      result = { x, y };
    } else {
      const [x] = output;
      result = { x };
    }
  } else {
    result = output;
  }
  return result;
}

function gpuMock(fn, settings = {}) {
  const output = settings.output ? setupOutput(settings.output) : null;
  function kernel() {
    if (kernel.output.z) {
      return mock3D.apply(kernel, arguments);
    } else if (kernel.output.y) {
      if (kernel.graphical) {
        return mock2DGraphical.apply(kernel, arguments);
      }
      return mock2D.apply(kernel, arguments);
    } else {
      return mock1D.apply(kernel, arguments);
    }
  }
  kernel._fn = fn;
  kernel.constants = settings.constants || null;
  kernel.context = settings.context || null;
  kernel.canvas = settings.canvas || null;
  kernel.graphical = settings.graphical || false;
  kernel._imageData = null;
  kernel._colorData = null;
  kernel.output = output;
  kernel.thread = {
    x: 0,
    y: 0,
    z: 0
  };
  return apiDecorate(kernel);
}

function flipPixels(pixels, width, height) {
  // https://stackoverflow.com/a/41973289/1324039
  const halfHeight = height / 2 | 0; // the | 0 keeps the result an int
  const bytesPerRow = width * 4;
  // make a temp buffer to hold one row
  const temp = new Uint8ClampedArray(width * 4);
  const result = pixels.slice(0);
  for (let y = 0; y < halfHeight; ++y) {
    const topOffset = y * bytesPerRow;
    const bottomOffset = (height - y - 1) * bytesPerRow;

    // make copy of a row on the top half
    temp.set(result.subarray(topOffset, topOffset + bytesPerRow));

    // copy a row from the bottom half to the top
    result.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);

    // copy the copy of the top half row to the bottom half
    result.set(temp, bottomOffset);
  }
  return result;
}

module.exports = {
  gpuMock
};
