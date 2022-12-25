import { toRadians, toDegree, wrapAngle } from "./angle";
import { applyToPoint, decompose, matrixRotate, multiply } from "./matrix";
import {
  Event,
  Matrix,
  Point,
  RotateUpdatePayload,
  EventValidator,
} from "./types";

import { value } from "./utils";

interface RotateProps {
  start: Point;
  offset: Point;

  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  affineMatrix?: Matrix;

  snap: EventValidator<Event>;
  snapDegree: number;
}

export function rotate(
  handle: Point,
  {
    x,
    y,
    width,
    height,
    start,
    offset,
    matrix,
    affineMatrix = matrix,
    snapDegree = 15,
    snap,
  }: RotateProps,
  onUpdate: (data: RotateUpdatePayload) => void
): (event: Event) => void {
  const decomposed = decompose(affineMatrix);

  const rotation = decomposed.rotation.angle;
  const angle = toDegree(rotation);
  const absoluteHandle = applyToPoint(matrix, [
    width * handle[0],
    height * handle[1],
  ]);

  const pressAngle = Math.atan2(
    start[1] - offset[1] - (absoluteHandle[1] + y),
    start[0] - offset[0] - (absoluteHandle[0] + x)
  );

  return (event) => {
    let radians =
      rotation +
      Math.atan2(
        event.clientY - offset[1] - (absoluteHandle[1] + y),
        event.clientX - offset[0] - (absoluteHandle[0] + x)
      ) -
      pressAngle;

    let degrees = toDegree(radians);

    if (value(snap, event)) {
      degrees = Math.round(degrees / snapDegree) * snapDegree;
    }

    degrees -= angle;

    onUpdate({
      matrix: multiply(
        matrixRotate(wrapAngle(toRadians(degrees)), absoluteHandle),
        affineMatrix
      ),
    });
  };
}
