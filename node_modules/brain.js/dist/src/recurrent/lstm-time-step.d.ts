import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RNNTimeStep } from './rnn-time-step';
import { IRNNHiddenLayer } from './rnn';
export declare class LSTMTimeStep extends RNNTimeStep {
    getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer;
    getEquation(equation: Equation, inputMatrix: Matrix, previousResult: Matrix, hiddenLayer: IRNNHiddenLayer): Matrix;
}
//# sourceMappingURL=lstm-time-step.d.ts.map