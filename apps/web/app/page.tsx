"use client";
import { Angle, FreeTransform, Grid, Mat, Handle } from "@free-transform/react";
import { ComponentProps, useCallback, useMemo, useState } from "react";

const Arrow = (props: ComponentProps<"svg">) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width={12}
    height={12}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 19.5l-15-15m0 0v11.25m0-11.25h11.25"
    />
  </svg>
);

const safeParse = (item) => {
  try {
    return JSON.parse(item);
  } catch (error) {
    return;
  }
};
export default function Page() {
  const [element, setElement] = useState(
    safeParse(localStorage.getItem("element")) || {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      matrix: Mat.multiply(
        Mat.translate(100, 100)
        // Mat.rotate(
        //   Angle.radians(45)
        // )
      ),
    }
  );
  const onUpdate = useCallback(
    (data: any) => {
      localStorage.setItem(
        "element",
        JSON.stringify({
          ...element,
          ...data,
        })
      );

      return setElement((element) => ({
        ...element,
        ...data,
      }));
    },
    [element]
  );

  const [type, setType] = useState<"scale" | "warp">("scale");
  const [origin, setOrigin] = useState([0, 0]);
  return (
    <div className="workspace">
      <div
        style={{
          position: "fixed",
          bottom: 15,
          left: 15,
        }}
      >
        <button
          onClick={() =>
            setType((type) => (type === "scale" ? "warp" : "scale"))
          }
        >
          toggle {type}
        </button>

        <input
          value={origin[0]}
          onChange={(e) => {
            setOrigin((origin) => [origin[1], parseFloat(e.target.value)]);
          }}
        />

        <input
          value={origin[0]}
          onChange={(e) => {
            setOrigin((origin) => [origin[0], parseFloat(e.target.value)]);
          }}
        />
      </div>
      <FreeTransform {...element} onUpdate={onUpdate}>
        <Grid lines={15} stroke="#3b82f6" />
        <Handle type={type} origin={[0, 0]} className="resize-handle">
          <Arrow />
        </Handle>
        <Handle type={type} origin={[1, 0]} className="resize-handle">
          B
        </Handle>
        <Handle type={type} origin={[1, 1]} className="resize-handle" />
        <Handle type={type} origin={[0, 1]} className="resize-handle" />

        <Handle
          type="rotate"
          origin={[0.5, 0.5]}
          position={[0.5, 0]}
          className="rotate-handle"
          offset={[0, -30]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          {/* <div className="rotation-line" /> */}
        </Handle>
      </FreeTransform>
    </div>
  );
}
