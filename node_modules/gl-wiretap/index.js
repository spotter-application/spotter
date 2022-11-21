/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {IGLWiretapOptions} [options]
 * @returns {GLWiretapProxy}
 */
function glWiretap(gl, options = {}) {
  const {
    contextName = 'gl',
    throwGetError,
    useTrackablePrimitives,
    readPixelsFile,
    recording = [],
    variables = {},
    onReadPixels,
    onUnrecognizedArgumentLookup,
  } = options;
  const proxy = new Proxy(gl, { get: listen });
  const contextVariables = [];
  const entityNames = {};
  let imageCount = 0;
  let indent = '';
  let readPixelsVariableName;
  return proxy;
  function listen(obj, property) {
    switch (property) {
      case 'addComment': return addComment;
      case 'checkThrowError': return checkThrowError;
      case 'getReadPixelsVariableName': return readPixelsVariableName;
      case 'insertVariable': return insertVariable;
      case 'reset': return reset;
      case 'setIndent': return setIndent;
      case 'toString': return toString;
      case 'getContextVariableName': return getContextVariableName;
    }
    if (typeof gl[property] === 'function') {
      return function() { // need arguments from this, fyi
        switch (property) {
          case 'getError':
            if (throwGetError) {
              recording.push(`${indent}if (${contextName}.getError() !== ${contextName}.NONE) throw new Error('error');`);
            } else {
              recording.push(`${indent}${contextName}.getError();`); // flush out errors
            }
            return gl.getError();
          case 'getExtension': {
            const variableName = `${contextName}Variables${contextVariables.length}`;
            recording.push(`${indent}const ${variableName} = ${contextName}.getExtension('${arguments[0]}');`);
            const extension = gl.getExtension(arguments[0]);
            if (extension && typeof extension === 'object') {
              const tappedExtension = glExtensionWiretap(extension, {
                getEntity,
                useTrackablePrimitives,
                recording,
                contextName: variableName,
                contextVariables,
                variables,
                indent,
                onUnrecognizedArgumentLookup,
              });
              contextVariables.push(tappedExtension);
              return tappedExtension;
            } else {
              contextVariables.push(null);
            }
            return extension;
          }
          case 'readPixels':
            const i = contextVariables.indexOf(arguments[6]);
            let targetVariableName;
            if (i === -1) {
              const variableName = getVariableName(arguments[6]);
              if (variableName) {
                targetVariableName = variableName;
                recording.push(`${indent}${variableName}`);
              } else {
                targetVariableName = `${contextName}Variable${contextVariables.length}`;
                contextVariables.push(arguments[6]);
                recording.push(`${indent}const ${targetVariableName} = new ${arguments[6].constructor.name}(${arguments[6].length});`);
              }
            } else {
              targetVariableName = `${contextName}Variable${i}`;
            }
            readPixelsVariableName = targetVariableName;
            const argumentAsStrings = [
              arguments[0],
              arguments[1],
              arguments[2],
              arguments[3],
              getEntity(arguments[4]),
              getEntity(arguments[5]),
              targetVariableName
            ];
            recording.push(`${indent}${contextName}.readPixels(${argumentAsStrings.join(', ')});`);
            if (readPixelsFile) {
              writePPM(arguments[2], arguments[3]);
            }
            if (onReadPixels) {
              onReadPixels(targetVariableName, argumentAsStrings);
            }
            return gl.readPixels.apply(gl, arguments);
          case 'drawBuffers':
            recording.push(`${indent}${contextName}.drawBuffers([${argumentsToString(arguments[0], { contextName, contextVariables, getEntity, addVariable, variables, onUnrecognizedArgumentLookup } )}]);`);
            return gl.drawBuffers(arguments[0]);
        }
        let result = gl[property].apply(gl, arguments);
        switch (typeof result) {
          case 'undefined':
            recording.push(`${indent}${methodCallToString(property, arguments)};`);
            return;
          case 'number':
          case 'boolean':
            if (useTrackablePrimitives && contextVariables.indexOf(trackablePrimitive(result)) === -1) {
              recording.push(`${indent}const ${contextName}Variable${contextVariables.length} = ${methodCallToString(property, arguments)};`);
              contextVariables.push(result = trackablePrimitive(result));
              break;
            }
          default:
            if (result === null) {
              recording.push(`${methodCallToString(property, arguments)};`);
            } else {
              recording.push(`${indent}const ${contextName}Variable${contextVariables.length} = ${methodCallToString(property, arguments)};`);
            }

            contextVariables.push(result);
        }
        return result;
      }
    }
    entityNames[gl[property]] = property;
    return gl[property];
  }
  function toString() {
    return recording.join('\n');
  }
  function reset() {
    while (recording.length > 0) {
      recording.pop();
    }
  }
  function insertVariable(name, value) {
    variables[name] = value;
  }
  function getEntity(value) {
    const name = entityNames[value];
    if (name) {
      return contextName + '.' + name;
    }
    return value;
  }
  function setIndent(spaces) {
    indent = ' '.repeat(spaces);
  }
  function addVariable(value, source) {
    const variableName = `${contextName}Variable${contextVariables.length}`;
    recording.push(`${indent}const ${variableName} = ${source};`);
    contextVariables.push(value);
    return variableName;
  }
  function writePPM(width, height) {
    const sourceVariable = `${contextName}Variable${contextVariables.length}`;
    const imageVariable = `imageDatum${imageCount}`;
    recording.push(`${indent}let ${imageVariable} = ["P3\\n# ${readPixelsFile}.ppm\\n", ${width}, ' ', ${height}, "\\n255\\n"].join("");`);
    recording.push(`${indent}for (let i = 0; i < ${imageVariable}.length; i += 4) {`);
    recording.push(`${indent}  ${imageVariable} += ${sourceVariable}[i] + ' ' + ${sourceVariable}[i + 1] + ' ' + ${sourceVariable}[i + 2] + ' ';`);
    recording.push(`${indent}}`);
    recording.push(`${indent}if (typeof require !== "undefined") {`);
    recording.push(`${indent}  require('fs').writeFileSync('./${readPixelsFile}.ppm', ${imageVariable});`);
    recording.push(`${indent}}`);
    imageCount++;
  }
  function addComment(value) {
    recording.push(`${indent}// ${value}`);
  }
  function checkThrowError() {
    recording.push(`${indent}(() => {
${indent}const error = ${contextName}.getError();
${indent}if (error !== ${contextName}.NONE) {
${indent}  const names = Object.getOwnPropertyNames(gl);
${indent}  for (let i = 0; i < names.length; i++) {
${indent}    const name = names[i];
${indent}    if (${contextName}[name] === error) {
${indent}      throw new Error('${contextName} threw ' + name);
${indent}    }
${indent}  }
${indent}}
${indent}})();`);
  }
  function methodCallToString(method, args) {
    return `${contextName}.${method}(${argumentsToString(args, { contextName, contextVariables, getEntity, addVariable, variables, onUnrecognizedArgumentLookup })})`;
  }

  function getVariableName(value) {
    if (variables) {
      for (const name in variables) {
        if (variables[name] === value) {
          return name;
        }
      }
    }
    return null;
  }

  function getContextVariableName(value) {
    const i = contextVariables.indexOf(value);
    if (i !== -1) {
      return `${contextName}Variable${i}`;
    }
    return null;
  }
}

/**
 *
 * @param extension
 * @param {IGLExtensionWiretapOptions} options
 * @returns {*}
 */
function glExtensionWiretap(extension, options) {
  const proxy = new Proxy(extension, { get: listen });
  const extensionEntityNames = {};
  const {
    contextName,
    contextVariables,
    getEntity,
    useTrackablePrimitives,
    recording,
    variables,
    indent,
    onUnrecognizedArgumentLookup,
  } = options;
  return proxy;
  function listen(obj, property) {
    if (typeof obj[property] === 'function') {
      return function() {
        switch (property) {
          case 'drawBuffersWEBGL':
            recording.push(`${indent}${contextName}.drawBuffersWEBGL([${argumentsToString(arguments[0], { contextName, contextVariables, getEntity: getExtensionEntity, addVariable, variables, onUnrecognizedArgumentLookup })}]);`);
            return extension.drawBuffersWEBGL(arguments[0]);
        }
        let result = extension[property].apply(extension, arguments);
        switch (typeof result) {
          case 'undefined':
            recording.push(`${indent}${methodCallToString(property, arguments)};`);
            return;
          case 'number':
          case 'boolean':
            if (useTrackablePrimitives && contextVariables.indexOf(trackablePrimitive(result)) === -1) {
              recording.push(`${indent}const ${contextName}Variable${contextVariables.length} = ${methodCallToString(property, arguments)};`);
              contextVariables.push(result = trackablePrimitive(result));
            } else {
              recording.push(`${indent}const ${contextName}Variable${contextVariables.length} = ${methodCallToString(property, arguments)};`);
              contextVariables.push(result);
            }
            break;
          default:
            if (result === null) {
              recording.push(`${methodCallToString(property, arguments)};`);
            } else {
              recording.push(`${indent}const ${contextName}Variable${contextVariables.length} = ${methodCallToString(property, arguments)};`);
            }
            contextVariables.push(result);
        }
        return result;
      };
    }
    extensionEntityNames[extension[property]] = property;
    return extension[property];
  }

  function getExtensionEntity(value) {
    if (extensionEntityNames.hasOwnProperty(value)) {
      return `${contextName}.${extensionEntityNames[value]}`;
    }
    return getEntity(value);
  }

  function methodCallToString(method, args) {
    return `${contextName}.${method}(${argumentsToString(args, { contextName, contextVariables, getEntity: getExtensionEntity, addVariable, variables, onUnrecognizedArgumentLookup })})`;
  }

  function addVariable(value, source) {
    const variableName = `${contextName}Variable${contextVariables.length}`;
    contextVariables.push(value);
    recording.push(`${indent}const ${variableName} = ${source};`);
    return variableName;
  }
}

function argumentsToString(args, options) {
  const { variables, onUnrecognizedArgumentLookup } = options;
  return (Array.from(args).map((arg) => {
    const variableName = getVariableName(arg);
    if (variableName) {
      return variableName;
    }
    return argumentToString(arg, options);
  }).join(', '));

  function getVariableName(value) {
    if (variables) {
      for (const name in variables) {
        if (!variables.hasOwnProperty(name)) continue;
        if (variables[name] === value) {
          return name;
        }
      }
    }
    if (onUnrecognizedArgumentLookup) {
      return onUnrecognizedArgumentLookup(value);
    }
    return null;
  }
}

function argumentToString(arg, options) {
  const { contextName, contextVariables, getEntity, addVariable, onUnrecognizedArgumentLookup } = options;
  if (typeof arg === 'undefined') {
    return 'undefined';
  }
  if (arg === null) {
    return 'null';
  }
  const i = contextVariables.indexOf(arg);
  if (i > -1) {
    return `${contextName}Variable${i}`;
  }
  switch (arg.constructor.name) {
    case 'String':
      const hasLines = /\n/.test(arg);
      const hasSingleQuotes = /'/.test(arg);
      const hasDoubleQuotes = /"/.test(arg);
      if (hasLines) {
        return '`' + arg + '`';
      } else if (hasSingleQuotes && !hasDoubleQuotes) {
        return '"' + arg + '"';
      } else if (!hasSingleQuotes && hasDoubleQuotes) {
        return "'" + arg + "'";
      } else {
        return '\'' + arg + '\'';
      }
    case 'Number': return getEntity(arg);
    case 'Boolean': return getEntity(arg);
    case 'Array':
      return addVariable(arg, `new ${arg.constructor.name}([${Array.from(arg).join(',')}])`);
    case 'Float32Array':
    case 'Uint8Array':
    case 'Uint16Array':
    case 'Int32Array':
      return addVariable(arg, `new ${arg.constructor.name}(${JSON.stringify(Array.from(arg))})`);
    default:
      if (onUnrecognizedArgumentLookup) {
        const instantiationString = onUnrecognizedArgumentLookup(arg);
        if (instantiationString) {
          return instantiationString;
        }
      }
      throw new Error(`unrecognized argument type ${arg.constructor.name}`);
  }
}

function trackablePrimitive(value) {
  // wrapped in object, so track-able
  return new value.constructor(value);
}

if (typeof module !== 'undefined') {
  module.exports = { glWiretap, glExtensionWiretap };
}

if (typeof window !== 'undefined') {
  glWiretap.glExtensionWiretap = glExtensionWiretap;
  window.glWiretap = glWiretap;
}
