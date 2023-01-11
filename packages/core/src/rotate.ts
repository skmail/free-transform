import { Angle } from "./angle";
import { Mat } from "./matrix";
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
  const decomposed = Mat.decompose(affineMatrix);

  const rotation = decomposed.rotation.angle;

  const absoluteHandle = Mat.toPoint(matrix, [
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

    let degrees = Angle.degrees(radians - rotation);

    if (value(snap, event)) {
      degrees = Math.round(degrees / snapDegree) * snapDegree;
    }

    onUpdate({
      matrix: Mat.multiply(
        Mat.rotate(Angle.radians(degrees), absoluteHandle),
        affineMatrix
      ),
    });
  };
}
