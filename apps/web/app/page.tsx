"use client";
import type { Matrix } from "@free-transform/react";
import { FreeTransform, Grid, Mat, Handle, Point } from "@free-transform/react";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

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
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Page() {
  const [element, setElement] = useState<Element>(
    safeParse<Element>(localStorage.getItem("element") || "") || {
      x: 50,
      y: 50,
      width: 300,
      height: 300,
      matrix: Mat
        .multiply
        // Mat.translate(100, 100)
        // Mat.rotate(
        //   Angle.radians(45)
        // )
        (),
    }
  );
  const onUpdate = useCallback(
    (data: Partial<Element>) => {
      // localStorage.setItem(
      //   "element",
      //   JSON.stringify({
      //     ...element,
      //     ...data,
      //   })
      // );

      setElement((el) => ({
        ...el,
        ...data,
      }));
    },
    [element]
  );

  const [type, setType] = useState<"scale" | "warp">("warp");
  const [origin, setOrigin] = useState([0, 0]);
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
  return (
    <div className="workspace" ref={ref}>
      <div
        style={{
          position: "fixed",
          bottom: 15,
          left: 15,
        }}
      >
        <button
          onClick={(): void => {
            setType((t) => (t === "scale" ? "warp" : "scale"));
          }}
          type="button"
        >
          toggle {type}
        </button>

        <input
          onChange={(e): void => {
            setOrigin((o) => [o[1], parseFloat(e.target.value)]);
          }}
          value={origin[0]}
        />

        <input
          onChange={(e): void => {
            setOrigin((o) => [o[0], parseFloat(e.target.value)]);
          }}
          value={origin[0]}
        />

        <input
          checked={showWarp}
          onChange={(e): void => {
            setShowWarp(e.target.checked);
          }}
          type="checkbox"
        />
      </div>

      <div className="faded">
        <FreeTransform
          offset={offset}
          {...element}
          warp={undefined}
          onUpdate={onUpdate}
        >
          <Grid lines={15} stroke="#3b82f6" />
          <Handle className="resize-handle" origin={[0, 0]} type={type}>
            <Arrow />
          </Handle>
          <Handle className="resize-handle" origin={[1, 0]} type={type}>
            B
          </Handle>
          <Handle className="resize-handle" origin={[1, 1]} type={type} />
          <Handle className="resize-handle" origin={[0, 1]} type={type} />

          <Handle
            className="resize-handle resize-handle-x"
            origin={[0, 0.5]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-x"
            origin={[1, 0.5]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-y"
            origin={[0.5, 0]}
            type={type}
          />
          <Handle
            className="resize-handle resize-handle-y"
            origin={[0.5, 1]}
            type={type}
          />

          <Handle
            className="rotate-handle"
            offset={[0, -30]}
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
      </div>

      <FreeTransform
        offset={offset}
        {...element}
        warp={showWarp ? element.warp : undefined}
        onUpdate={onUpdate}
      >
        <Grid lines={15} stroke="#3b82f6" />
        <Handle className="resize-handle" origin={[0, 0]} type={type}>
          <Arrow />
        </Handle>
        <Handle className="resize-handle" origin={[1, 0]} type={type}>
          B
        </Handle>
        <Handle className="resize-handle" origin={[1, 1]} type={type} />
        <Handle className="resize-handle" origin={[0, 1]} type={type} />

        <Handle
          className="resize-handle resize-handle-x"
          origin={[0, 0.5]}
          type={type}
        />
        <Handle
          className="resize-handle resize-handle-x"
          origin={[1, 0.5]}
          type={type}
        />
        <Handle
          className="resize-handle resize-handle-y"
          origin={[0.5, 0]}
          type={type}
        />
        <Handle
          className="resize-handle resize-handle-y"
          origin={[0.5, 1]}
          type={type}
        />

        <Handle
          className="rotate-handle"
          offset={[0, -30]}
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
    </div>
  );
}
