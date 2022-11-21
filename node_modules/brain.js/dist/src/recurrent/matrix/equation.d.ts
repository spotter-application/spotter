import { Matrix } from '.';
declare type PropagateIndex = (product: Matrix, left: Matrix, index: number) => void;
declare type PropagateProduct = (product: Matrix) => void;
declare type PropagateProductFromLeft = (product: Matrix, left: Matrix) => void;
declare type PropagateProductFromLeftRight = (product: Matrix, left: Matrix, right: Matrix) => void;
declare type PropagateFunction = PropagateIndex | PropagateProduct | PropagateProductFromLeft | PropagateProductFromLeftRight;
export interface IState {
    name: string;
    product: Matrix;
    left?: Matrix;
    right?: Matrix;
    forwardFn: PropagateFunction;
    backpropagationFn: PropagateFunction;
}
export declare class Equation {
    states: IState[];
    inputValue?: Float32Array;
    inputRow: number;
    add(left: Matrix, right: Matrix): Matrix;
    allOnes(rows: number, columns: number): Matrix;
    cloneNegative(matrix: Matrix): Matrix;
    /**
     * connects two matrices together by subtract
     */
    subtract(left: Matrix, right: Matrix): Matrix;
    /**
     * connects two matrices together by multiply
     */
    multiply(left: Matrix, right: Matrix): Matrix;
    /**
     * connects two matrices together by multiplyElement
     */
    multiplyElement(left: Matrix, right: Matrix): Matrix;
    /**
     * connects a matrix to relu
     */
    relu(matrix: Matrix): Matrix;
    /**
     * input a matrix
     */
    input(input: Matrix): Matrix;
    /**
     * connects a matrix via a row
     */
    inputMatrixToRow(matrix: Matrix): Matrix;
    /**
     * connects a matrix to sigmoid
     */
    sigmoid(matrix: Matrix): Matrix;
    /**
     * connects a matrix to tanh
     */
    tanh(matrix: Matrix): Matrix;
    /**
     *
     * Observe a matrix for debugging
     */
    observe(matrix: Matrix): Matrix;
    /**
     * Run index through equations via forward propagation
     */
    runIndex(rowIndex?: number): Matrix;
    /**
     * Run value through equations via forward propagation
     */
    runInput(inputValue: Float32Array): Matrix;
    /**
     * Run value through equations via back propagation
     */
    backpropagate(): Matrix;
    /**
     * Run index through equations via back propagation
     */
    backpropagateIndex(rowIndex?: number): Matrix;
    /**
     * Predict a target value from equation
     */
    predictTarget(input: Float32Array, target: Float32Array): number;
    /**
     * Predict a target index from equation
     */
    predictTargetIndex(input: number, target: number): number;
}
export {};
//# sourceMappingURL=equation.d.ts.map