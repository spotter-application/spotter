export interface ILikelyNet<InputType, OutputType> {
    run: (input: InputType) => OutputType;
}
export declare function likely<NetworkType extends ILikelyNet<Parameters<NetworkType['run']>[0], ReturnType<NetworkType['run']>>>(input: Parameters<NetworkType['run']>[0], net: NetworkType): ReturnType<NetworkType['run']> | null;
//# sourceMappingURL=likely.d.ts.map