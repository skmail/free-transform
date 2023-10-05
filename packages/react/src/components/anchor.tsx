import { Angle, Mat, Point, minMax } from "@free-transform/core";
import { ComponentProps, PropsWithChildren } from "react";
import { Vec } from "../../../math/src";
import { useFreeTransform } from "./free-transform";

type Props = {
  position: Point;
};
export function Anchor({
  position,
  children,
  ...rest
}: PropsWithChildren<Props & ComponentProps<"div">>) {
  const { matrix, width, height, x, y } = useFreeTransform();

  const points = Mat.toPoints(matrix, [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]);

  const bounds = minMax(points);

  const info = getTitleInfo(bounds, points, position);

  return (
    <div
      {...rest}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${info.position[0] + info.offset[0]}px, ${
          info.position[1] + info.offset[1]
        }px) rotate(${info.angle}rad)`,
        transformOrigin: "0 0",
        maxWidth: info.width,
      }}
    >
      {children}
    </div>
  );
}

const isMin = (
  point: Point,
  origin: Point,
  currentMin: number,
  callback: (dist: number) => void
) => {
  const dist = Vec.distance(origin, point);
  const isMin = dist < currentMin;
  if (isMin) {
    return callback(dist);
  }
};
export function getTitleInfo(
  bounds: { xmin: number; ymin: number; xmax: number; ymax: number },
  points: Point[],
  position: Point
) {
  const topLeftOrigin: Point = [bounds.xmin, bounds.ymin];
  const topRightOrigin: Point = [bounds.xmax, bounds.ymin];

  const { topLeftIndex, topRightIndex } = points.reduce(
    (acc, point, index) => {
      isMin(point, topLeftOrigin, acc.topLeft, (dist) => {
        acc.topLeft = dist;
        acc.topLeftIndex = index;
      });
      isMin(point, topRightOrigin, acc.topRight, (dist) => {
        acc.topRight = dist;
        acc.topRightIndex = index;
      });
      return acc;
    },
    {
      topLeft: Number.MAX_VALUE,
      topLeftIndex: 0,
      topRight: Number.MAX_VALUE,
      topRightIndex: 0,
    }
  );

  const topLeft = points[topLeftIndex];
  const topRight = points[topRightIndex];
 
  
  const angle = Angle.angle(topLeft, topRight);

  const offset = Mat.toPoint(Mat.rotate(angle), [0, -20]);

  const width = Vec.distance(topLeft, topRight);

  return {
    angle,
    position: topLeft,
    offset,
    width: width !== 0 ? width : bounds.xmax - topLeft[0],
  };
}
