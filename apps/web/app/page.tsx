"use client";
import type { Matrix, Tuple } from "@free-transform/react";
import {
  FreeTransform,
  Grid,
  Mat,
  Handle,
  Point,
  makePerspectiveMatrix,
  makeWarpPoints,
  Anchor,
  SnapResult,
} from "@free-transform/react";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GuideLines } from "./guidelines";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Arrow(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      height={12}
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={12}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5 19.5l-15-15m0 0v11.25m0-11.25h11.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const safeParse = <T,>(item: string): T | null => {
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    return null;
  }
};
interface Element {
  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  warp?: Tuple<[number, number], 4>;
}
const initialElement = {
  x: 0,
  y: 0,
  width: 300,
  height: 300,
  matrix: Mat
    .multiply
    // Mat.translate(100, 100)
    // Mat.rotate(
    //   Angle.radians(45)
    // )
    // Mat.scale(2, 2)
    (),
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Page() {
  const [element, setElement] = useState<Element>(
    safeParse<Element>(localStorage.getItem("element") || "") || initialElement
  );
  const scene = { width: 400, height: 400 };
  const onUpdate = useCallback(
    (data: Partial<Element>) => {
      localStorage.setItem(
        "element",
        JSON.stringify({
          ...element,
          ...data,
        })
      );

      setElement((el) => ({
        ...el,
        ...data,
      }));
    },
    [element]
  );

  const [type, setType] = useState<"scale" | "warp" | "resize">("resize");

  const [offset, setOffset] = useState<Point>([0, 0]);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const box = ref.current.getBoundingClientRect();
    setOffset([box.x, box.y]);
  }, []);

  const [showWarp, setShowWarp] = useState(true);

  const matrix3d = useMemo(() => {
    const perspectiveMatrix = makePerspectiveMatrix(
      makeWarpPoints(element.width, element.height),
      element.warp || makeWarpPoints(element.width, element.height)
    );
    const _matrix3d = Mat.transpose(
      Mat.multiply(element.matrix, perspectiveMatrix)
    ).join();

    return `matrix3d(${_matrix3d})`;
  }, [element.width, element.height, element.warp, element.matrix]);
  const matrixRef = useRef(element.matrix);
  matrixRef.current = element.matrix;

  const snapTo = [
    // {
    //   y: 0,
    //   data: "ruler",
    // },
    // {
    //   y: 200,
    //   data: "ruler",
    // },
    // {
    //   x: 200,
    //   data: "ruler",
    // },
  ];

  const otherElements = [
    {
      x: 120,
      y: 120,
      width: 100,
      height: 100,
    },
  ];

  otherElements.forEach((element) => {
    // makeWarpPoints(element.width, element.height).forEach((point) => {
    //   snapTo.push({
    //     x: point[0] + element.x,
    //     y: point[1] + element.y,
    //     data: "element",
    //   });
    // });

    snapTo.push({
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
      data: "element",
    });
  });
  const [snapped, setSnapped] = useState<SnapResult[]>([]);
  return (
    <>
      <div
        className="workspace"
        style={{
          width: scene.width,
          height: scene.height,
        }}
        ref={ref}
      >
        <div
          style={{
            position: "fixed",
            bottom: 15,
            left: 15,
          }}
        >
          <button
            onClick={() => {
              setElement((element) => ({
                ...element,
                matrix: Mat.multiply(
                  element.matrix,
                  Mat.scale(1.5, 1, [element.width, element.height])
                ),
              }));
            }}
          >
            Scale to X
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("element");
              setElement(initialElement);
            }}
          >
            Reset
          </button>
          <button
            onClick={(): void => {
              setType((t) =>
                t === "scale" ? "resize" : t === "resize" ? "warp" : "scale"
              );
            }}
            type="button"
          >
            MODE: {type}
          </button>

          <input
            checked={showWarp}
            onChange={(e): void => {
              setShowWarp(e.target.checked);
            }}
            type="checkbox"
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: matrix3d,
            transformOrigin: "0 0",
            fontSize: 24,
          }}
        >
          Welcome to free transform
        </div>
        {otherElements.map((element, index) => (
          <div
            style={{
              width: element.width,
              height: element.height,
              left: element.x,
              top: element.y,
              position: "absolute",
              background: "gray",
            }}
          ></div>
        ))}

        <FreeTransform
          offset={offset}
          {...element}
          onUpdate={onUpdate}
          warp={showWarp ? element.warp : undefined}
          snap={() => {
            return [
              ...makeWarpPoints(scene.width, scene.height).map((p) => ({
                x: p[0],
                y: p[1],
                data: {
                  type: "scene",
                  width: scene.width,
                  height: scene.height,
                },
              })),
              {
                x: scene.width / 2,
                y: scene.height / 2,
                data: {
                  type: "scene",
                  width: scene.width,
                  height: scene.height,
                },
              },
            ];
          }}
          onSnap={setSnapped}
        >
          <Anchor position={[0.5, 0]}>I'm nice anchor</Anchor>

          <Grid lines={4} stroke="#3b82f6" />
          <Handle
            className="resize-handle"
            origin={[0, 0]}
            offset={[-6, -6]}
            type={type}
          >
            <Arrow />
          </Handle>
          <Handle
            className="resize-handle"
            origin={[1, 0]}
            offset={[-6, -6]}
            type={type}
          >
            B
          </Handle>
          <Handle
            className="resize-handle"
            origin={[1, 1]}
            offset={[-6, -6]}
            type={type}
          />
          <Handle
            className="resize-handle"
            origin={[0, 1]}
            offset={[-6, -6]}
            type={type}
          />

          <Handle
            className="resize-handle resize-handle-x"
            origin={[0, 0.5]}
            offset={[-9, -15]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-x"
            origin={[1, 0.5]}
            offset={[-9, -15]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-y"
            origin={[0.5, 0]}
            offset={[-15, -9]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-y"
            origin={[0.5, 1]}
            offset={[-15, -9]}
            type={type}
          />

          <Handle
            className="rotate-handle"
            offset={[-4, -40]}
            origin={[0.5, 0.5]}
            position={[0.5, 0]}
            type="rotate"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* <div className="rotation-line" /> */}
          </Handle>
        </FreeTransform>

        <GuideLines
          width={scene.width}
          height={scene.height}
          guides={snapped}
        />
      </div>
      {snapTo.map((p, index) => (
        <div key={index} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: p.y === undefined ? 1 : "100vw",
              height: p.y !== undefined ? 1 : "100vh",
              background: "red",
              position: "absolute",
              left: p.x === undefined ? 0 : offset[0] + p.x,
              top: p.y === undefined ? 0 : offset[1] + p.y,
            }}
          />
          {p.y !== undefined && (
            <>
              <div
                style={{
                  width: "100vw",
                  height: 1,
                  background: "rgba(0,0,0,0.1)",
                  position: "absolute",
                  left: 0,
                  top: offset[1] + p.y - 5,
                }}
              />
              <div
                style={{
                  width: "100vw",
                  height: 1,
                  background: "rgba(0,0,0,0.1)",
                  position: "absolute",
                  left: 0,
                  top: offset[1] + p.y + 5,
                }}
              />
            </>
          )}
        </div>
      ))}

      <pre
        style={{
          position: "fixed",
          right: 2,
          bottom: 2,
        }}
      >
        {JSON.stringify(snapped, undefined, 4)}
      </pre>
    </>
  );
}
