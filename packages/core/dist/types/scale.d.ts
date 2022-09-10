import { Event, EventValidator, Matrix, Point } from "./types";
interface ScaleProps {
    start: Point;
    width: number;
    height: number;
    matrix: Matrix;
    affineMatrix: Matrix;
    perspectiveMatrix: Matrix;
    fromCenter?: EventValidator<Event>;
    aspectRatio?: EventValidator<Event>;
    scaleLimit?: [number, number];
}
export declare function scale(scaleType: Point, { start, width, height, fromCenter, aspectRatio, matrix, affineMatrix, perspectiveMatrix, scaleLimit, }: ScaleProps, onUpdate: (data: {
    matrix: Matrix;
}) => void): (event: Event) => void;
export {};
