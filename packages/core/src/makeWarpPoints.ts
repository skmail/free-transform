import type { Point, Tuple } from "./types";

export function makeWarpPoints(width: number, height: number): Tuple<Point, 4> {
  return [
    [0, 0],
    [0, height],
    [width, 0],
    [width, height],
  ];
}
