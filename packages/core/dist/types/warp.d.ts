import { Event, Matrix, Point, Tuple, WarpUpdatePayload } from "./types";
export declare const TRIANGLES: number[][];
interface WarpProps {
    affineMatrix: Matrix;
    handles: Tuple<Point, 4>;
    start: Point;
}
export declare function warp(handle: Point, { affineMatrix, handles, start }: WarpProps, onUpdate: (data: WarpUpdatePayload) => void): (event: Event) => void;
export {};
