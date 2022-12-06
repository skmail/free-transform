export type Tuple<T, N, R extends T[] = []> = R["length"] extends N
  ? R
  : Tuple<T, N, [...R, T]>;

export type Point = Tuple<number, 2>;

export type Matrix = Tuple<Tuple<number, 4>, 4>;

export interface LUP {
  LU: [[number]];
  P: number[];
}

export type Vector = Tuple<number, 3>;

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

export type UpdatePayload =
  | RotateUpdatePayload
  | ScaleUpdatePayload
  | WarpUpdatePayload
  | TranslateUpdatePayload;

export type EventCallback<T extends Event, R = void> = (event: T) => R;

export type EventValidator<T extends Event = Event> = ((event: T) => boolean) | boolean;