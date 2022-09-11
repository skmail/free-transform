import {
  applyToPoint,
  applyToPoints,
  decompose,
  matrixScale,
  multiply,
} from "./matrix";
import { minMax } from "./minMax";
import { makeWarpPoints } from "./makeWarpPoints";
import { getPointAtAngle } from "./angle";
import { Event, EventValidator, Matrix, Point } from "./types";
import { clamp, value } from "./utils";

interface ScaleProps {
  start: Point;
  width: number;
  height: number;
  matrix: Matrix;
  affineMatrix?: Matrix;
  perspectiveMatrix?: Matrix;

  fromCenter?: EventValidator<Event>;
  aspectRatio?: EventValidator<Event>;
  scaleLimit?: [number, number];
}
export function scale(
  scaleType: Point,
  {
    start,
    width,
    height,
    fromCenter = () => false,
    aspectRatio = () => false,
    matrix,
    affineMatrix = matrix,
    perspectiveMatrix = matrix,
    scaleLimit,
  }: ScaleProps,
  onUpdate: (data: { matrix: Matrix }) => void
): (event: Event) => void {
  const decomposed = decompose(affineMatrix);

  const bounds = minMax(applyToPoints(matrix, makeWarpPoints(width, height)));

  const radians = decomposed.rotation.angle;

  const startPoint = [start[0], start[1]];

  return (event) => {
    const opposite = value(fromCenter, event)
      ? [0.5, 0.5]
      : [1 - scaleType[0], 1 - scaleType[1]];

    const movePoint: Point = [event.clientX, event.clientY];

    let moveDiff = getPointAtAngle(
      [movePoint[0] - startPoint[0], movePoint[1] - startPoint[1]],
      -radians
    );

    moveDiff[0] /= decomposed.scale.sx;
    moveDiff[1] /= decomposed.scale.sy;

    const px1 = applyToPoint(perspectiveMatrix, [
      width * scaleType[0],
      height * scaleType[1],
    ]);

    const px2 = applyToPoint(perspectiveMatrix, [
      width * opposite[0],
      height * opposite[1],
    ]);

    const newScale = [1, 1];

    if (scaleType[0] === 0 || scaleType[0] === 1) {
      newScale[0] = (px1[0] + moveDiff[0] - px2[0]) / (px1[0] - px2[0]);
    }

    if (scaleType[1] === 0 || scaleType[1] === 1) {
      newScale[1] = (px1[1] + moveDiff[1] - px2[1]) / (px1[1] - px2[1]);
    }

    const absoluteOrigin = applyToPoint(perspectiveMatrix, [
      width * opposite[0],
      height * opposite[1],
    ]);

    if (value(aspectRatio, event)) {
      if (scaleType[0] === 0 || scaleType[0] === 1) {
        const ratio = bounds.width / bounds.height;
        newScale[1] =
          (bounds.width * newScale[0] * (1 / ratio)) / bounds.height;
      } else if (scaleType[1] === 0 || scaleType[1] === 1) {
        const ratio = bounds.height / bounds.width;
        newScale[0] = (height * newScale[1] * ratio) / width;
      }
    }

    if (scaleLimit) {
      newScale[0] = clamp(newScale[0], scaleLimit[0], scaleLimit[1]);
      newScale[1] = clamp(newScale[1], scaleLimit[0], scaleLimit[1]);
    }

    onUpdate({
      matrix: multiply(
        affineMatrix,
        matrixScale(newScale[0], newScale[1], absoluteOrigin)
      ),
    });
  };
}
