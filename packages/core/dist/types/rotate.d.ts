import { Event, Matrix, Point, RotateUpdatePayload, EventValidator } from "./types";
interface RotateProps {
    x: number;
    y: number;
    width: number;
    height: number;
    start: Point;
    offset: Point;
    origin: Point;
    matrix: Matrix;
    affineMatrix: Matrix;
    snap: EventValidator<Event>;
    snapDegree: number;
}
export declare function rotate({ x, y, width, height, start, offset, origin, affineMatrix, matrix, snapDegree, snap, }: RotateProps, onUpdate: (data: RotateUpdatePayload) => void): (event: Event) => void;
export {};
