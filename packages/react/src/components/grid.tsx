import { Mat, Matrix, minMax } from "@free-transform/core";
import { ComponentProps, forwardRef, useMemo } from "react";
import { useFreeTransform } from "./free-transform";

type Props = {
  strokeWidth?: number;
  lines?: number;
};
export const Grid = forwardRef<SVGSVGElement, ComponentProps<"svg"> & Props>(
  function Grid({ strokeWidth = 1, lines = 2, ...rest }, ref) {
    const { height, width, finalMatrix, x, y } = useFreeTransform();

    const svg = useMemo(() => {
      const points = Mat.toPoints(finalMatrix, [
        [0, 0],
        [0, height],
        [width, height],
        [width, 0],
      ]);

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
        const p = Mat.toPoint(finalMatrix, [0, i]);
        const p2 = Mat.toPoint(finalMatrix, [width, i]);
        data.push(`M ${p[0]} ${p[1]}`);
        data.push(`L ${p2[0]} ${p2[1]}`);
      }

      const w = width / count;
      for (let i = w; i < width; i += w) {
        const p = Mat.toPoint(finalMatrix, [i, 0]);
        const p2 = Mat.toPoint(finalMatrix, [i, height]);
        data.push(`M ${p[0]} ${p[1]}`);
        data.push(`L ${p2[0]} ${p2[1]}`);
      }

      const box = minMax(points);

      const margin = strokeWidth / 2;

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
    }, [height, lines, finalMatrix, strokeWidth, width]);

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
        }}
        width={svg.width}
        height={svg.height}
        viewBox={svg.viewBox}
        fill="none"
      >
        <path d={svg.d} />
      </svg>
    );
  }
);
