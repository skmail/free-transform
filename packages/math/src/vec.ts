import { Point } from "./types";
import { Angle } from "./angle";
import { Num } from "./num";

export const Vec = {
  round(vec: Point, precision?: number): Point {
    return [Num.round(vec[0], precision), Num.round(vec[1], precision)];
  },

  isEqual(vec1: Point, vec2: Point): boolean {
    return vec1[0] === vec2[0] && vec1[1] === vec2[1];
  },

  isGreater(vec: Point, vec1: Point, strict = false) {
    const x = vec[0] > vec1[0];
    const y = vec[1] > vec1[1];
    return strict ? x && y : x || y;
  },

  // Check if vec1 value are less than vec2
  isLess(vec1: Point, vec2: Point, strict = false) {
    const x = vec1[0] < vec2[0];
    const y = vec1[1] < vec2[1];
    return strict ? x && y : x || y;
  },

  // add two vectors
  add(vec: Point, vec1: Point): Point {
    return [vec[0] + vec1[0], vec[1] + vec1[1]];
  },

  // add scalar value to vector
  addScalar(vec: Point, num: number): Point {
    return [vec[0] + num, vec[1] + num];
  },

  // subtract two vectors
  subtract(vec: Point, vec1: Point): Point {
    return [vec[0] - vec1[0], vec[1] - vec1[1]];
  },

  // subtract scalar value from vector
  subtractScalar(vec: Point, num: number): Point {
    return [vec[0] - num, vec[1] - num];
  },

  // divide a vector by scalar value
  multiplyScalar(vec: Point, num: number): Point {
    return [vec[0] * num, vec[1] * num];
  },

  // multiply two vectors
  multiply(vec1: Point, vec2: Point): Point {
    return [vec1[0] * vec2[0], vec1[1] * vec2[1]];
  },

  // divide two vectors
  divide(vec1: Point, vec2: Point): Point {
    return [vec1[0] / vec2[0], vec1[1] / vec2[1]];
  },

  // divide vector by scalar value
  divideScalar(vec: Point, num: number): Point {
    return [vec[0] / num, vec[1] / num];
  },

  // the absolute values of vector
  abs(vec: Point): Point {
    return [Math.abs(vec[0]), Math.abs(vec[1])];
  },

  // clamp vector by scalar value
  clamp(vec: Point, min: number, max: number): Point {
    return [Num.clamp(vec[0], min, max), Num.clamp(vec[1], min, max)];
  },

  // clamp vector by another vector
  clampV(vec: Point, minV: Point, maxV: Point): Point {
    return [
      Num.clamp(vec[0], minV[0], maxV[0]),
      Num.clamp(vec[1], minV[1], maxV[1]),
    ];
  },
  // find the Euclidean distance between two points
  distance(vec2: Point, vec1: Point = [0, 0]) {
    return Math.sqrt(
      Math.pow(vec2[0] - vec1[0], 2) + Math.pow(vec2[1] - vec1[1], 2)
    );
  },

  atan2(point1: Point, point2: Point) {
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
  },

  isZero(point: Point) {
    return point[0] === 0 && point[1] === 0;
  },

  reflect(vec1: Point, vec2: Point): Point {
    return [2 * vec2[0] - vec1[0], 2 * vec2[1] - vec1[1]];
  },

  dot(vec1: Point, vec2: Point) {
    return vec1[0] * vec2[0] + vec1[1] * vec2[1];
  },

  // the length of the vector squared
  len2(vec: Point) {
    return vec[0] * vec[0] + vec[1] * vec[1];
  },
  len(vec: Point): number {
    return Math.hypot(vec[0], vec[1]);
  },

  isNaN(vec: Point) {
    return isNaN(vec[0]) || isNaN(vec[1]);
  },
  min(vec1: Point, vec2: Point): Point {
    return [Math.min(vec1[0], vec2[0]), Math.min(vec1[1], vec2[1])];
  },
  max(vec1: Point, vec2: Point): Point {
    return [Math.max(vec1[0], vec2[0]), Math.max(vec1[1], vec2[1])];
  },

  neg(vec: Point) {
    return Vec.multiplyScalar(vec, -1);
  },

  cross(A: Point, B: Point) {
    return A[0] * B[1] - B[0] * A[1];
  },

  length(vec: Point) {
    return Math.sqrt(Vec.len2(vec));
  },

  //normalized unit vector.
  normalize(vec: Point): Point {
    return Vec.divideScalar(vec, Vec.length(vec));
  },

  align(origin: Point, vec1: Point, vec2: Point) {
    const angle = Angle.angle(origin, vec1);
    const distance = Vec.distance(vec2, origin);

    return Vec.reflect(
      Vec.add(origin, [distance * Math.cos(angle), distance * Math.sin(angle)]),
      origin
    );
  },

  lerp(start: Point, end: Point, t: number): Point {
    return [Num.lerp(start[0], end[0], t), Num.lerp(start[1], end[1], t)];
  },

  crossPoints(a: Point, b: Point, c: Point) {
    return (a[0] - b[0]) * (c[1] - b[1]) - (c[0] - b[0]) * (a[1] - b[1]);
  },

  mid(vec1: Point, vec2: Point): Point {
    return [(vec1[0] + vec2[0]) / 2, (vec1[1] + vec2[1]) / 2];
  },
};
