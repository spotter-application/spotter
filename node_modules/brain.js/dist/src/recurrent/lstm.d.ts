import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { IRNNHiddenLayer, RNN } from './rnn';
export interface ILSTMHiddenLayer extends IRNNHiddenLayer {
    inputMatrix: Matrix;
    inputHidden: Matrix;
    inputBias: Matrix;
    forgetMatrix: Matrix;
    forgetHidden: Matrix;
    forgetBias: Matrix;
    outputMatrix: Matrix;
    outputHidden: Matrix;
    outputBias: Matrix;
    cellActivationMatrix: Matrix;
    cellActivationHidden: Matrix;
    cellActivationBias: Matrix;
}
export declare class LSTM extends RNN {
    getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer;
    getEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: IRNNHiddenLayer): Matrix;
}
export declare function getHiddenLSTMLayer(hiddenSize: number, prevSize: number): ILSTMHiddenLayer;
export declare function getLSTMEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: ILSTMHiddenLayer): Matrix;
//# sourceMappingURL=lstm.d.ts.map