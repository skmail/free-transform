import { Point } from "./types";

export function call(callback?: (...args: any[]) => void, ...args: any[]) {
  if (callback) {
    callback(...args);
  }
}

export function value<T = boolean>(
  descriptor: T,
  ...args: T extends (...args: any[]) => any ? Parameters<T> : any[]
): T extends (...args: any[]) => any ? ReturnType<T> : T {
  if (typeof descriptor === "function") {
    return descriptor(...args);
  }
  // @todo [as any] tricking the compiler for now, will revisit later;
  return descriptor as any;
}

export function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(number, max));
}

export const getDistance = (p2: Point, p1: Point) => {
  return Math.sqrt(
    (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1])
  );
};
