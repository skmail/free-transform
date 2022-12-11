import { Point } from "./types";

export const getAngle = (p1: Point, p2: Point = [0, 0]) =>
  Math.atan2(p2[1] - p1[1], p1[0] - p2[0]);

export const toRadians = (degree: number) => degree * (Math.PI / 180);

export const toDegree = (radians: number) => radians * (180 / Math.PI);

export const getPointAtAngle = ([x, y]: Point, radians: number): Point => {
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  return [x * cos + y * sin, y * cos - x * sin];
};

export function wrapAngle(radians: number) {
  while (radians < -Math.PI) radians += 2 * Math.PI;
  while (radians >= Math.PI) radians -= 2 * Math.PI;
  return radians;
}
