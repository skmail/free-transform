import { Angle } from "./angle";
import { Mat } from "./matrix";
import type {
  Matrix,
  OnSnap,
  Point,
  SnapPoints,
  SnapPoint,
  SnapResult,
} from "./types";

interface SnapProps {
  points: SnapPoints;
  matrix: Matrix;
  x: number;
  y: number;
  width: number;
  height: number;
  origin: Point;
  onSnap?: OnSnap;
}

const inRange = (p1: number, p2: number, scale = 1, range = 10): boolean => {
  const diff = Math.abs(Math.round(p1 - p2));
  return diff <= range / scale;
};

export function snapScale({
  matrix,
  points,
  x,
  y,
  width,
  height,
  origin,
  onSnap,
}: SnapProps): Matrix {
  const dec = Mat.decompose(matrix);

  const isHandleX = [0, 1].includes(origin[0]);
  const isHandleY = [0, 1].includes(origin[1]);

  if ((!isHandleX || !isHandleY) && dec.rotation !== 0) {
    return matrix;
  }
  const snapData =
    typeof points === "function"
      ? points({
          x,
          y,
          width,
          height,
          matrix,
        })
      : points;

  const point = Mat.toPoint(matrix, [origin[0] * width, origin[1] * height]);

  point[0] += x;
  point[1] += y;

  const opposite = Mat.toPoint(matrix, [
    (1 - origin[0]) * width,
    (1 - origin[1]) * height,
  ]);

  opposite[0] += x;
  opposite[1] += y;

  const { results: snapped, distance } = getSurroundings(point, snapData);

  const p1 = Angle.point(point, -dec.rotation);
  const p0 = Angle.point(opposite, -dec.rotation);
  const m = Angle.point(distance, -dec.rotation);

  let scaleX = isHandleX ? (p1[0] + m[0] - p0[0]) / (p1[0] - p0[0]) : 1;
  let scaleY = isHandleY ? (p1[1] + m[1] - p0[1]) / (p1[1] - p0[1]) : 1;

  if (!isFinite(scaleX)) {
    scaleX = Number.EPSILON;
  }

  if (!isFinite(scaleY)) {
    scaleY = Number.EPSILON;
  }

  const result = Mat.multiply(
    matrix,
    Mat.scale(scaleX, scaleY, [
      (1 - origin[0]) * width,
      (1 - origin[1]) * height,
    ])
  );

  const from = Mat.toPoint(result, [origin[0] * width, origin[1] * height]);

  onSnap?.(filterOnlyMatchedSnaps(from, snapped, [x, y]));

  return result;
}

const filterOnlyMatchedSnaps = (
  matchedToPoint: Point,
  snappedResults: Omit<SnapResult, "from">[],
  position: Point
): SnapResult[] => {
  const results: SnapResult[] = [];

  const pres = 0;

  const matchedToPoint_ = [
    Number((matchedToPoint[0] + position[0]).toFixed(pres)),
    Number((matchedToPoint[1] + position[1]).toFixed(pres)),
  ];
  for (let item of snappedResults) {
    const to = [
      Number(item.to[0].toFixed(pres)),
      Number(item.to[1].toFixed(pres)),
    ];
 
    if (matchedToPoint_[0] === to[0] || matchedToPoint_[1] === to[1]) {
      results.push({
        ...item,
        from: [matchedToPoint[0]+ position[0], matchedToPoint[1]+ position[1]],
      });
    }
  }

  return results;
};
const getSurroundings = (
  origin: Point,
  points: SnapPoint[]
): {
  results: Omit<SnapResult, "from">[];
  distance: Point;
} => {
  const results: Omit<SnapResult, "from">[] = [];
  let minX = Infinity;
  let minY = Infinity;
  for (const point of points) {
    if (point.x !== undefined && inRange(origin[0], point.x)) {
      const distance = point.x - origin[0];
      minX = Math.min(minX, distance);
      results.push({
        to: [point.x || 0, point.y || 0],
        direction: "horizontal",
        data: point.data,
      });
    }
    if (point.y !== undefined && inRange(origin[1], point.y)) {
      const distance = point.y - origin[1];
      minY = Math.min(minY, distance);
      results.push({
        to: [point.x || 0, point.y || 0],
        direction: "vertical",
        data: point.data,
      });
    }
  }

  return {
    results,
    distance: [isFinite(minX) ? minX : 0, isFinite(minY) ? minY : 0],
  };
};
