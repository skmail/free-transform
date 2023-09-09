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
      let radians = -decomposed.rotation;

      const point = Mat.toPoint(finalMatrix, [
        position[0] * width,
        position[1] * height,
      ]);

      const offsetPosition = Angle.point(
        [
          (handleOffset[0] - centerMargin[0]) * Math.sign(decomposed.scale[0]),
          (handleOffset[1] - centerMargin[1]) * Math.sign(decomposed.scale[1]),
        ],
        -radians
      );

      const final = [
        point[0] + x + offsetPosition[0],
        point[1] + y + offsetPosition[1],
      ];

      const scaleSign = [
        Math.sign(decomposed.scale[0]),
        Math.sign(decomposed.scale[1]),
      ];

      return {
        style: `
        translate(${final[0]}px, ${final[1]}px)        
        rotate(${radians}rad)
        scale(${scaleSign[0]}, ${scaleSign[1]})
        `,
        radians,
      };
    }, [matrix,finalMatrix, width, height, x, y, origin, type, centerMargin]);

    
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
