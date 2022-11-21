export interface IGLWiretapOptions {
  contextName?: string;
  readPixelsFile?: string;
  recording?: string[];
  throwGetError?: Boolean;
  throwGetShaderParameter?: Boolean;
  throwGetProgramParameter?: Boolean;
  useTrackablePrimitives?: Boolean;
  onReadPixels?: (targetName: string, argumentAsStrings: string[]) => void;
  onUnrecognizedArgumentLookup?: (argument: any) => string;
}

export interface IGLExtensionWiretapOptions {
  contextName: string;
  contextVariables: any[];
  getEntity: (value: number) => string | number;
  useTrackablePrimitives?: Boolean;
  recording: string[];
  onUnrecognizedArgumentLookup?: (argument: any) => string;
}

export interface GLWiretapProxy extends WebGLRenderingContext {
  addComment(comment: string): void;
  checkThrowError(): void;
  getReadPixelsVariableName(): string;
  insertVariable(name: string, value: any): void;
  reset(): void;
  setIndent(spaces: number): void;
  toString(): string;
  getContextVariableName(value: any): string;
}

export function glWiretap(gl: WebGLRenderingContext, options?: IGLWiretapOptions): GLWiretapProxy;

export function glExtensionWiretap(extension: any, options: IGLExtensionWiretapOptions);
