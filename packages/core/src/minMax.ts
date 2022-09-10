import { Point } from "./types";

export const minMax = (points: Point[]) => {
  const bounds = points.reduce(
    (bounds, point) => {
      bounds.xmin = Math.min(bounds.xmin, point[0]);
      bounds.xmax = Math.max(bounds.xmax, point[0]);
      bounds.ymin = Math.min(bounds.ymin, point[1]);
      bounds.ymax = Math.max(bounds.ymax, point[1]);
      return bounds;
    },
    {
      xmin: Infinity,
      xmax: -Infinity,
      ymin: Infinity,
      ymax: -Infinity,
    }
  );

  return {
    ...bounds,
    width: bounds.xmax - bounds.xmin,
    height: bounds.ymax - bounds.ymin,
  };
};
