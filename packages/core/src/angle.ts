import { Point } from "./types";

export const Angle = {
  angle(p1: Point, p2: Point = [0, 0]) {
    return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  },
  radians(degree: number) {
    return degree * (Math.PI / 180);
  },
  degrees(radians: number) {
    return radians * (180 / Math.PI);
  },
  point([x, y]: Point, radians: number): Point {
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    return [x * cos + y * sin, y * cos - x * sin];
  },
  wrap(radians: number) {
    while (radians < -Math.PI) radians += 2 * Math.PI;
    while (radians >= Math.PI) radians -= 2 * Math.PI;
    return radians;
  },
};
