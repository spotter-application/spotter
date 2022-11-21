import { FeedForward, IFeedForwardJSON } from '../feed-forward';
import { Recurrent } from '../recurrent';
import { IRNNJSON, RNN } from '../recurrent/rnn';
import { INeuralNetworkJSON, NeuralNetwork } from '../neural-network';
import { GRU } from '../recurrent/gru';
import { LSTM } from '../recurrent/lstm';
import { NeuralNetworkGPU } from '../neural-network-gpu';
import { IRNNTimeStepJSON, RNNTimeStep } from '../recurrent/rnn-time-step';
import { LSTMTimeStep } from '../recurrent/lstm-time-step';
import { GRUTimeStep } from '../recurrent/gru-time-step';
interface LineDrawInfo {
    className: string;
    color: string;
    width: number;
}
interface NodeDrawInfo {
    className: string;
    color: string;
}
interface BaseDrawArgs {
    pixelX: number;
    pixelY: number;
    radius: number;
    row: number;
    column: number;
}
interface InputDrawArgs extends BaseDrawArgs {
    line: LineDrawInfo;
    inputs: NodeDrawInfo & {
        labels?: string[] | null;
    };
    fontSize: string;
    fontClassName: string;
}
export declare function drawInput({ pixelX, pixelY, radius, inputs, row, line, fontSize, fontClassName, }: InputDrawArgs): string;
export interface NeuronDrawArgs extends BaseDrawArgs {
    column: number;
    hidden: NodeDrawInfo;
}
export declare function drawNeuron({ pixelX, pixelY, row, column, radius, hidden, }: NeuronDrawArgs): string;
export interface OutputDrawArgs extends BaseDrawArgs {
    column: number;
    line: LineDrawInfo;
    outputs: NodeDrawInfo;
}
export declare function drawOutput({ pixelX, pixelY, row, column, line, outputs, radius, }: OutputDrawArgs): string;
export interface BackwardConnectionsDrawArgs extends BaseDrawArgs {
    column: number;
    lineY: number;
    previousConnectionIndex: number;
    line: LineDrawInfo;
}
export declare function drawBackwardConnections({ pixelX, pixelY, row, column, radius, lineY, line, previousConnectionIndex, }: BackwardConnectionsDrawArgs): string;
export interface NeuralNetworkDrawOptions {
    sizes: number[];
    height: number;
    width: number;
    radius: number;
    line: LineDrawInfo;
    inputs: NodeDrawInfo & {
        labels?: string[] | null;
    };
    hidden: NodeDrawInfo;
    outputs: NodeDrawInfo;
    fontSize: string;
    fontClassName: string;
}
export declare function neuralNetworkToInnerSVG(options: NeuralNetworkDrawOptions): string;
export interface RecurrentConnectionsDrawArgs extends BaseDrawArgs {
    column: number;
    recurrentLine: LineDrawInfo;
}
export declare function drawRecurrentConnections({ pixelX, pixelY, row, column, radius, recurrentLine, }: RecurrentConnectionsDrawArgs): string;
export interface RecurrentNeuralNetworkDrawOptions extends NeuralNetworkDrawOptions {
    recurrentLine: LineDrawInfo;
}
export declare function rnnToInnerSVG(options: RecurrentNeuralNetworkDrawOptions): string;
export declare function getFeedForwardLayers(network: FeedForward): ISimpleNet;
export declare function getRecurrentLayers(network: Recurrent): ISimpleNet;
export declare function wrapOuterSVG(svgBody: string, width: number, height: number): string;
export declare function getNeuralNetworkJSONSizes(json: INeuralNetworkJSON): number[];
export declare function getNeuralNetworkSizes<InputType, OutputType>(net: NeuralNetwork<InputType, OutputType> | NeuralNetworkGPU<InputType, OutputType>): number[];
export declare function getRNNSizes(net: RNN | LSTM | GRU | RNNTimeStep | LSTMTimeStep | GRUTimeStep | IRNNJSON): number[];
export declare function defaultOptions(): RecurrentNeuralNetworkDrawOptions;
export interface ISimpleNet {
    inputSize: number;
    hiddenLayers: number[];
    outputSize: number;
}
export interface ISizes {
    sizes: number[];
}
export declare function toSVG<T extends ISimpleNet | ISizes | Recurrent | FeedForward | IFeedForwardJSON | RNNTimeStep | IRNNTimeStepJSON | LSTMTimeStep | GRUTimeStep | RNN | IRNNJSON | GRU | LSTM | NeuralNetwork<InputType, OutputType> | INeuralNetworkJSON | NeuralNetworkGPU<InputType, OutputType>, InputType, OutputType>(net: T, options?: Partial<RecurrentNeuralNetworkDrawOptions> | Partial<NeuralNetworkDrawOptions>): string;
export declare function checkSizes(sizes: number[], labels: string[] | null | undefined): number[];
export {};
//# sourceMappingURL=to-svg.d.ts.map