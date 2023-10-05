import {
  Mat,
  Matrix,
  Point,
  makeWarpPoints,
  minMax,
  snapTranslation,
  translate,
} from "@free-transform/core";
import { ComponentProps, forwardRef, useMemo } from "react";
import { useFreeTransform } from "./free-transform";

type Props = {
  strokeWidth?: number;
  lines?: number;
  translate?: boolean;
};
export const Grid = forwardRef<SVGSVGElement, ComponentProps<"svg"> & Props>(
  function Grid(
    {
      strokeWidth = 1,
      lines = 2,
      translate: translateEnabled = true,

      ...rest
    },
    ref
  ) {
    const {
      height,
      width,
      matrix,
      x,
      y,
      onUpdate,
      rotationMatrix,
      decomposedMatrix,
      perspectiveMatrix,
      finalMatrix,
      snap,
      onSnap,
    } = useFreeTransform();

    const matrix3d = useMemo(() => {
      const matrix3d = Mat.transpose(finalMatrix);
      return `matrix3d(${matrix3d})`;
    }, [rotationMatrix]);

    const svg = useMemo(() => {
      const scaleMatrix = finalMatrix;
      const points: Point[] = Mat.toPoints(scaleMatrix, [
        [0, 0],
        [0, height],
        [width, height],
        [width, 0],
      ]);
      // .map((p) => [Math.abs(p[0]), Math.abs(p[1])]);

      const data = points.map((point, i) => {
        const data = [];
        if (i === 0) {
          data.push(`M ${point[0]} ${point[1]}`);
        } else {
          data.push(`L ${point[0]} ${point[1]}`);
        }

        return data.join(" ");
      });

      data.push("Z");

      const count = Math.max(0, lines) + 1;
      const h = height / count;
      for (let i = h; i < height; i += h) {
        const p = Mat.toPoint(scaleMatrix, [0, i]);
        const p2 = Mat.toPoint(scaleMatrix, [width, i]);
        data.push(`M ${p[0]} ${p[1]}`);
        data.push(`L ${p2[0]} ${p2[1]}`);
      }

      const w = width / count;
      for (let i = w; i < width; i += w) {
        const p = Mat.toPoint(scaleMatrix, [i, 0]);
        const p2 = Mat.toPoint(scaleMatrix, [i, height]);
        data.push(`M ${p[0]} ${p[1]}`);
        data.push(`L ${p2[0]} ${p2[1]}`);
      }

      const box = minMax(points);

      const margin = 0;

      return {
        d: data.join(" "),
        viewBox: `${box.xmin - margin} ${box.ymin - margin} ${
          box.width + margin * 2
        } ${box.height + margin * 2}`,
        width: box.width + margin * 2,
        height: box.height + margin * 2,
        box: {
          ...box,
          ymin: box.ymin,
          xmin: box.xmin,
        },
      };
    }, [
      height,
      lines,
      decomposedMatrix,
      perspectiveMatrix,
      strokeWidth,
      width,
    ]);

    return (
      <svg
        ref={ref}
        stroke="black"
        {...rest}
        strokeWidth={strokeWidth}
        style={{
          position: "absolute",
          left: svg.box.xmin + x,
          top: svg.box.ymin + y,
          overflow: "visible",

          transformOrigin: "0 0",
        }}
        width={svg.width}
        height={svg.height}
        viewBox={svg.viewBox}
        fill="none"
        onPointerDown={(startEvent) => {
          if (!translateEnabled) {
            return false;
          }
          startEvent.preventDefault();
          startEvent.stopPropagation();

          const onDrag = translate(
            {
              start: [startEvent.clientX, startEvent.clientY],
              x,
              y,
            },
            (changes) => {
              if (snap) {
                changes = {
                  ...changes,
                  ...snapTranslation({
                    onSnap,
                    matrix: matrix,
                    points: snap,
                    x,
                    y,
                    width,
                    height,
                    origin: Mat.toPoints(matrix, makeWarpPoints(width, height)),
                  }),
                };
              }

              onUpdate(changes);
            }
          );

          const onMouseUp = (event: PointerEvent) => {
            document.removeEventListener("pointermove", onDrag);
            document.removeEventListener("pointerup", onMouseUp);
          };

          document.addEventListener("pointermove", onDrag);
          document.addEventListener("pointerup", onMouseUp);
        }}
      >
        <path d={svg.d} />
      </svg>
    );
  }
);
