import {
  ComponentProps,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useFreeTransform } from "./free-transform";
import {
  Angle,
  Mat,
  Point,
  makeWarpPoints,
  rotate,
  scale,
  snapScale,
  warp,
} from "@free-transform/core";
import { assignRefs } from "../utils/assign-refs";

type MoveEventPayload = { clientX: number; clientY: number };
type Props = {
  origin: Point;
  position?: Point;
  type: "rotate" | "scale" | "resize" | "warp";
  offset?: Point;
  scaleLimit?: Point;
  onStart?: (event: any) => void;
  onMove?: (
    event: MoveEventPayload,
    prevEvent: MoveEventPayload
  ) => void | {
    startEvent: Partial<MoveEventPayload>;
    moveEvent: Partial<MoveEventPayload>;
  };
  onEnd?: (event: any) => void;
};
export const Handle = forwardRef<HTMLDivElement, ComponentProps<"div"> & Props>(
  function Handle(
    {
      origin,
      type,
      position = origin,
      offset: handleOffset = [0, 0],
      scaleLimit,
      onStart,
      onMove,
      onEnd,
      ...props
    },
    ref
  ) {
 
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
      snap,
      onSnap
    } = useFreeTransform();

    const transform = useMemo(() => {
      const decomposed = Mat.decompose(matrix);
      let radians = decomposed.rotation;

      const point = Mat.toPoint(finalMatrix, [
        position[0] * width,
        position[1] * height,
      ]);

      const offsetPosition = Angle.point(
        [
          handleOffset[0] * Math.sign(decomposed.scale[0]),
          handleOffset[1] * Math.sign(decomposed.scale[1]),
        ],
        radians
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
        rotate(${-radians}rad)
        scale(${scaleSign[0]}, ${scaleSign[1]})
        `,
        radians,
      };
    }, [matrix, finalMatrix, width, height, x, y, origin, type]);

    const handler = useCallback(
      (startEvent: MoveEventPayload) => {
        switch (type) {
          case "scale":
          case "resize":
            return scale(
              origin,
              {
                start: [startEvent.clientX, startEvent.clientY],
                width,
                height,
                matrix: finalMatrix,
                affineMatrix: matrix,
                perspectiveMatrix,
                fromCenter: (event: any) => event.altKey,
                aspectRatio: (event: any) => event.shiftKey,
              },
              (changes) => {
                if (snap) {
                  changes = {
                    ...changes,
                    matrix: snapScale({
                      onSnap,
                      matrix: changes.matrix,
                      points: snap,
                      x,
                      y,
                      width,
                      height,
                      origin,
                    }),
                  };
                }

                if (type === "scale") {
                  onUpdate(changes);
                  return;
                }

                const dec = Mat.decompose(changes.matrix);
                const rotationMatrix = Mat.multiply(
                  changes.matrix,
                  Mat.inverse(
                    Mat.scale(
                      dec.scale[0] * Math.sign(dec.scale[0]),
                      dec.scale[1] * Math.sign(dec.scale[1])
                    )
                  )
                );
                onUpdate({
                  width: Math.abs(width * dec.scale[0]),
                  height: Math.abs(height * dec.scale[1]),
                  matrix: rotationMatrix,
                });

                // const rotationMatrix = Mat.multiply(
                //   changes.matrix,
                //   Mat.inverse(
                //     Mat.scale(
                //       dec.scale[0] * Math.sign(dec.scale[0]),
                //       dec.scale[1] * Math.sign(dec.scale[1])
                //     )
                //   ),
                //   Mat.scale(dec0.scale[0], dec0.scale[1])
                // );
                // onUpdate({
                //   width: Math.abs(
                //     width + width * ((dec.scale[0] - dec0.scale[0]) / 2)
                //   ),
                //   height: Math.abs(
                //     height + height * ((dec.scale[1] - dec0.scale[1]) / 2)
                //   ),
                //   matrix: rotationMatrix,
                // });
              }
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
                offset,
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
      [
        width,
        height,
        matrix,
        origin,
        type,
        warpPonts,
        perspectiveMatrix,
        finalMatrix,
      ]
    );

    return (
      <div
        ref={assignRefs(ref)}
        {...props}
        onPointerDown={(startEvent) => {
          startEvent.preventDefault();
          startEvent.stopPropagation();
          onStart && onStart(startEvent);
          let moveHandler = handler(startEvent);
          const onDrag = (event: MouseEvent) => {
            moveHandler(event);
          };

          const onMouseUp = (event: PointerEvent) => {
            onEnd && onEnd(event);
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
