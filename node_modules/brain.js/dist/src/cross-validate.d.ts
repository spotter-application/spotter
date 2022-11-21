import { INeuralNetworkBinaryTestResult, INeuralNetworkState, INeuralNetworkTestResult } from './neural-network-types';
export declare type InitClassifier<TrainOptsType, JsonType, DatumType> = () => IClassifier<TrainOptsType, JsonType, DatumType>;
export interface IClassifier<TrainOptsType, JsonType, DatumType> {
    trainOpts: TrainOptsType;
    toJSON: () => JsonType;
    fromJSON: (json: JsonType) => this;
    train: (data: DatumType[], options?: Partial<TrainOptsType>) => INeuralNetworkState;
    test: (data: DatumType[]) => INeuralNetworkTestResult | INeuralNetworkBinaryTestResult;
    initialize: () => void;
}
export declare type ICrossValidateJSON<JsonType> = ICrossValidateStats<JsonType> | ICrossValidateBinaryStats<JsonType>;
export interface ICrossValidateStatsAverages {
    trainTime: number;
    testTime: number;
    iterations: number;
    error: number;
}
export interface ICrossValidateStats<JsonType> {
    avgs: ICrossValidateStatsAverages;
    stats: ICrossValidateStatsResultStats;
    sets: Array<ICrossValidationTestPartitionResults<JsonType>>;
}
export interface ICrossValidateBinaryStats<NetworkType> {
    avgs: ICrossValidateStatsAverages;
    stats: ICrossValidateStatsResultBinaryStats;
    sets: Array<ICrossValidationTestPartitionBinaryResults<NetworkType>>;
}
export interface ICrossValidateStatsResultStats {
    total: number;
    testSize: number;
    trainSize: number;
}
export interface ICrossValidateStatsResultBinaryStats extends ICrossValidateStatsResultStats {
    total: number;
    truePos: number;
    trueNeg: number;
    falsePos: number;
    falseNeg: number;
    precision: number;
    recall: number;
    accuracy: number;
}
export interface ICrossValidationTestPartitionResults<JsonType> extends INeuralNetworkTestResult {
    trainTime: number;
    testTime: number;
    iterations: number;
    network: JsonType;
    total: number;
}
export declare type ICrossValidationTestPartitionBinaryResults<JsonType> = INeuralNetworkBinaryTestResult & ICrossValidationTestPartitionResults<JsonType>;
export default class CrossValidate<InitClassifierType extends InitClassifier<ReturnType<InitClassifierType>['trainOpts'], ReturnType<ReturnType<InitClassifierType>['toJSON']>, Parameters<ReturnType<InitClassifierType>['train']>[0][0]>> {
    initClassifier: InitClassifierType;
    json: ICrossValidateJSON<ReturnType<ReturnType<InitClassifierType>['toJSON']>>;
    constructor(initClassifier: InitClassifierType);
    testPartition(trainOpts: Parameters<ReturnType<InitClassifierType>['train']>[1], trainSet: Parameters<ReturnType<InitClassifierType>['train']>[0], testSet: Parameters<ReturnType<InitClassifierType>['train']>[0]): ICrossValidationTestPartitionResults<ReturnType<ReturnType<InitClassifierType>['toJSON']>> | ICrossValidationTestPartitionBinaryResults<ReturnType<ReturnType<InitClassifierType>['toJSON']>>;
    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     * source: http://stackoverflow.com/a/12646864/1324039
     */
    shuffleArray<K>(array: K[]): K[];
    static isBinaryStats: (stats: ICrossValidateStatsResultStats | ICrossValidateStatsResultBinaryStats) => stats is ICrossValidateStatsResultBinaryStats;
    static isBinaryResults: <JsonType>(stats: ICrossValidateStats<JsonType> | ICrossValidateBinaryStats<JsonType>) => stats is ICrossValidateBinaryStats<JsonType>;
    static isBinaryPartitionResults: <JsonType>(stats: ICrossValidationTestPartitionResults<JsonType> | ICrossValidationTestPartitionBinaryResults<JsonType>) => stats is ICrossValidationTestPartitionBinaryResults<JsonType>;
    train(data: Array<Parameters<ReturnType<InitClassifierType>['train']>[0][0]>, trainOpts?: Partial<Parameters<ReturnType<InitClassifierType>['train']>[1]>, k?: number): ICrossValidateStats<ReturnType<InitClassifierType>['toJSON']>;
    toNeuralNetwork(): ReturnType<InitClassifierType>;
    toJSON(): ICrossValidateJSON<ReturnType<ReturnType<InitClassifierType>['toJSON']>> | null;
    fromJSON(crossValidateJson: ICrossValidateJSON<ReturnType<ReturnType<InitClassifierType>['toJSON']>>): ReturnType<InitClassifierType>;
}
//# sourceMappingURL=cross-validate.d.ts.map