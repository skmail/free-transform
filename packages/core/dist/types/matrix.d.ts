import { Tuple, LUP, Matrix, Point } from "./types";
export declare function lu(A: [[number]]): LUP;
export declare function luSolve(lu: LUP, b: Tuple<number, 8>): Tuple<number, 8>;
export declare function identity(): Matrix;
export declare function transpose(a: Matrix): number[][];
export declare function dotProduct(a: number[], b: number[]): number;
export declare function multiply(a: Matrix, b: Matrix): Matrix;
export declare function multiplies(...matrices: Matrix[]): [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
export declare function applyToPoint(matrix: Matrix, point: Point): Point;
export declare function applyToPoints(matrix: Matrix, points: Point[]): Point[];
export declare function getVector(matrix: Matrix, point?: Point): number[];
export declare function matrixTranslate(tx: number, ty: number): Matrix;
export declare function matrixRotate(radians: number, origin?: Point): [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
export declare function matrixScale(sx: number, sy: number, origin?: Point): [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
export declare function createMatrixFromParams({ scaleX, scaleY, angle, width, height, }?: {
    scaleX?: number | undefined;
    scaleY?: number | undefined;
    angle?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
}): [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
export declare function inverseAffine(matrix: Matrix): Matrix;
export declare function decompose(matrix: Matrix): {
    scale: {
        sx: number;
        sy: number;
    };
    rotation: {
        angle: number;
    };
};
