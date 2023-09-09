import {
  ComponentProps,
  forwardRef,
  useCallback,
  useMemo,
  PointerEvent as ReactPointerEvent,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { useFreeTransform } from "./free-transform";
import {
  Angle,
  Mat,
  Matrix,
  Point,
  makePerspectiveMatrix,
  makeWarpPoints,
  rotate,
  scale,
  warp,
} from "@free-transform/core";
import { assignRefs } from "../utils/assign-refs";

type Props = {
  origin: Point;
  position?: Point;
  type: "rotate" | "scale" | "warp";
  offset?: Point;
};
export const Handle = forwardRef<HTMLDivElement, ComponentProps<"div"> & Props>(
  function Handle(
    {
      origin,
      type,
      position = origin,
      offset: handleOffset = [0, 0],
      ...props
    },
    ref
  ) {
    const rref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (!rref.current) {
        return;
      }
      const box = rref.current.getBoundingClientRect();
      setCenterMargin([box.width / 2, box.height / 2]);
    }, []);

    const {
      matrix,
      width,
      height,
      x,
      y,
      onUpdate,
      offset = [0, 0],
      warp: warpPonts,
      perspectiveMatrix,
      finalMatrix,
    } = useFreeTransform();

    const [centerMargin, setCenterMargin] = useState<Point>([0, 0]);

    const transform = useMemo(() => {
      const decomposed = Mat.decompose(matrix);

      const point1 = Mat.toPoint(finalMatrix, [
        Math.floor(position[0]) * width,
        Math.floor(position[1]) * height,
      ]);

      const point2 = Mat.toPoint(finalMatrix, [
        Math.ceil(position[0]) * width,
        Math.ceil(position[1]) * height,
      ]);

      const find = (p1: number, p2: number, per: number) =>
        p1 + (p2 - p1) * per;

      const percentage = Math.abs(position[0] - position[1]);

      const point = [
        find(point1[0], point2[0], percentage),
        find(point1[1], point2[1], percentage),
      ];

      const scaleSign = [
        Math.sign(decomposed.scale[0]),
        Math.sign(decomposed.scale[1]),
      ];

      const radians = decomposed.rotation;

      const [xx, yy] = Angle.point(
        [handleOffset[0] - centerMargin[0], handleOffset[1] - centerMargin[1]],
        radians
      );
      const final = [point[0] + xx + x, point[1] + yy + y];

      
      return {
        style: `
        translate(${final[0]}px, ${final[1]}px)        
        rotate(${-radians}rad)
        scale(${scaleSign[0]}, ${scaleSign[1]})
        `,
        radians,
      };
    }, [matrix, finalMatrix, width, height, x, y, origin, type, centerMargin]);

    const handler = useCallback(
      (startEvent: ReactPointerEvent) => {
        switch (type) {
          case "scale":
            return scale(
              origin,
              {
                start: [startEvent.clientX, startEvent.clientY],
                width,
                height,
                matrix: finalMatrix,
                affineMatrix: matrix,
                perspectiveMatrix,
                // scaleLimit: [0.1, Infinity],
                fromCenter: (event: any) => event.altKey,
                aspectRatio: (event: any) => event.shiftKey,
              },
              onUpdate
            );
          case "rotate":
            return rotate(
              origin,
              {
                start: [startEvent.clientX, startEvent.clientY],
                width,
                height,
                matrix: finalMatrix,
                affineMatrix: matrix,
                x,
                y,
              },
              onUpdate
            );
          case "warp":
            return warp(
              origin,
              {
                start: [startEvent.clientX, startEvent.clientY],
                matrix,

                warp: warpPonts || makeWarpPoints(width, height),
              },
              onUpdate
            );
        }
      },
      [width, height, matrix, origin, type]
    );

    return (
      <div
        ref={assignRefs(ref, rref)}
        {...props}
        onPointerDown={(startEvent) => {
          startEvent.preventDefault();
          startEvent.stopPropagation();

          const onDrag = handler(startEvent);

          const onMouseUp = (event: PointerEvent) => {
            document.removeEventListener("pointermove", onDrag);
            document.removeEventListener("pointerup", onMouseUp);
          };

          document.addEventListener("pointermove", onDrag);
          document.addEventListener("pointerup", onMouseUp);
        }}
        style={{
          transform: transform.style,
          position: "absolute",
          transformOrigin: "0 0",
          ...(props.style || {}),
        }}
      />
    );
  }
);
