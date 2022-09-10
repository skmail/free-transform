import { getAngle, getPointAtAngle } from "./angle";
import { decompose } from "./matrix";
import { Event, Matrix, Point, Tuple, WarpUpdatePayload } from "./types";
import { getDistance } from "./utils";
export const TRIANGLES = [
  [0, 1, 2],
  [1, 0, 3],
  [2, 0, 3],
  [3, 1, 2],
];

function getTriangleRotation(pos1: Point, pos2: Point, pos3: Point) {
  const radians = getAngle(pos1, pos3) - getAngle(pos1, pos2);
  return radians >= 0 ? radians : radians + 2 * Math.PI;
}

function isConvex(points: Tuple<Point, 4>, prevPoints: Tuple<Point, 4>) {
  for (let i = 0; i < points.length; i++) {
    const p = TRIANGLES[i];
    const rad1 = getTriangleRotation(points[p[0]], points[p[1]], points[p[2]]);
    const rad2 = getTriangleRotation(
      prevPoints[p[0]],
      prevPoints[p[1]],
      prevPoints[p[2]]
    );
    const pi = Math.PI;
    if ((rad1 >= pi && rad2 <= pi) || (rad1 <= pi && rad2 >= pi)) {
      return true;
    }
  }
  return false;
}

const originalHandles: Tuple<Point, 4> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

function getNearestPoints(point: Point, points: Point[], returnCount = 1) {
  const nearest = points.map((p, index) => [index, getDistance(point, p)]);
  return nearest.sort((a, b) => a[1] - b[1]).slice(0, returnCount);
}

interface WarpProps {
  affineMatrix: Matrix;
  handles: Tuple<Point, 4>;
  start: Point;
}

export function warp(
  handle: Point,
  { affineMatrix, handles, start }: WarpProps,
  onUpdate: (data: WarpUpdatePayload) => void
): (event: Event) => void {
  const decomposed = decompose(affineMatrix);
  const radians = decomposed.rotation.angle;

  const nearestCount =
    (handle[0] === 0 || handle[0] === 1) && (handle[1] === 0 || handle[1] === 1)
      ? 1
      : 2;

  const nearestHandles = getNearestPoints(
    handle,
    originalHandles,
    nearestCount
  ).map((near) => near[0]);

  return (event) => {
    const movePoint = [event.clientX, event.clientY];

    let moveDiff = getPointAtAngle(
      [movePoint[0] - start[0], movePoint[1] - start[1]],
      -radians
    );

    moveDiff[0] /= decomposed.scale.sx;
    moveDiff[1] /= decomposed.scale.sy;

    // @todo fix the tuple return size
    // @ts-ignore
    const newHandles: Tuple<Point, 4> = handles.map((handles, index) => {
      if (nearestHandles.includes(index)) {
        return [handles[0] + moveDiff[0], handles[1] + moveDiff[1]];
      }
      return handles;
    });

    if (isConvex(newHandles, handles)) {
      return;
    }

    onUpdate({
      warp: newHandles,
    });
  };
}
