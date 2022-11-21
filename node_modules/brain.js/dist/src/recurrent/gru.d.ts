import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RandomMatrix } from './matrix/random-matrix';
import { IRNNHiddenLayer, RNN } from './rnn';
export interface IGRUHiddenLayer extends IRNNHiddenLayer {
    updateGateInputMatrix: RandomMatrix;
    updateGateHiddenMatrix: RandomMatrix;
    updateGateBias: Matrix;
    resetGateInputMatrix: RandomMatrix;
    resetGateHiddenMatrix: RandomMatrix;
    resetGateBias: Matrix;
    cellWriteInputMatrix: RandomMatrix;
    cellWriteHiddenMatrix: RandomMatrix;
    cellWriteBias: Matrix;
}
export declare class GRU extends RNN {
    getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer;
    getEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: IRNNHiddenLayer): Matrix;
}
export declare function getGRUHiddenLayer(hiddenSize: number, prevSize: number): IGRUHiddenLayer;
export declare function getGRUEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: IGRUHiddenLayer): Matrix;
//# sourceMappingURL=gru.d.ts.map