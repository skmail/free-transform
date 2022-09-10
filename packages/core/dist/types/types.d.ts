export declare type Tuple<T, N, R extends T[] = []> = R["length"] extends N ? R : Tuple<T, N, [...R, T]>;
export declare type Point = Tuple<number, 2>;
export declare type Matrix = Tuple<Tuple<number, 4>, 4>;
export interface LUP {
    LU: [[number]];
    P: number[];
}
export declare type Vector = Tuple<number, 3>;
export interface Event {
    clientX: number;
    clientY: number;
}
export interface RotateUpdatePayload {
    matrix: Matrix;
}
export interface ScaleUpdatePayload {
    matrix: Matrix;
}
export interface WarpUpdatePayload {
    warp: Tuple<Point, 4>;
}
export interface TranslateUpdatePayload {
    x: number;
    y: number;
}
export declare type UpdatePayload = RotateUpdatePayload | ScaleUpdatePayload | WarpUpdatePayload | TranslateUpdatePayload;
export declare type EventCallback<T extends Event, R = void> = (event: T) => R;
export declare type EventValidator<T extends Event = Event> = ((event: T) => boolean) | boolean;
