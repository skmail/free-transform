import { SnapResult } from "@free-transform/react";

export function GuideLines({
  width,
  height,
  guides,
}: {
  width: number;
  height: number;
  guides: SnapResult[];
}) {
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {guides.map((guide, index) => (
        <Guideline guide={guide} key={index} />
      ))}
    </svg>
  );
}

const getFrom = (guide: SnapResult) => {
  if (guide.data.type === "scene") {
    if (guide.direction === "horizontal") {
      return [guide.from[0], 0];
    }
    return [0, guide.from[1]];
  }

  return guide.from;
};
const getTo = (guide: SnapResult) => {
  if (guide.data.type === "scene") {
    if (guide.direction === "horizontal") {
      return [guide.to[0], guide.data.height];
    }
    return [guide.data.width, guide.from[1]];
  }

  return guide.to;
};

const Guideline = ({ guide }: { guide: SnapResult }) => {
  const from = getFrom(guide);
  const to = getTo(guide);
  return (
    <>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#e11d48" />

      <path
        transform={`translate(${to[0] - 3}, ${to[1] - 3})`}
        d="M0.528483 0.454559C0.692883 0.454559 0.846992 0.52087 0.941556 0.632298L2.5256 2.49883L4.11083 0.630901C4.20465 0.520349 4.35754 0.454559 4.52065 0.454559C4.93716 0.454559 5.1718 0.851198 4.91665 1.12398L3.20446 2.95456L4.9128 4.78102C5.16951 5.05548 4.93343 5.45456 4.51436 5.45456C4.35466 5.45456 4.20441 5.39186 4.10933 5.28554L2.5256 3.51446L0.943065 5.28419C0.847234 5.39136 0.695783 5.45456 0.534811 5.45456C0.114244 5.45456 -0.124245 5.05538 0.130762 4.77827L1.80902 2.95456L0.126925 1.12668C-0.12651 0.851277 0.110509 0.454559 0.528483 0.454559Z"
        fill="#e11d48"
      />
    </>
  );
};
