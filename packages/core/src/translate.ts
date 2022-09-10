import { Event, Point, TranslateUpdatePayload } from "./types";

interface TransalateProps {
  x: number;
  y: number;
  start: Point;
}

export function translate(
  { x, y, start }: TransalateProps,
  onUpdate: (data: TranslateUpdatePayload) => void
): (event: Event) => void {
  return (dragEvent) => {
    x += dragEvent.clientX - start[0];
    y += dragEvent.clientY - start[1];

    onUpdate({ x, y });

    start = [dragEvent.clientX, dragEvent.clientY];
  };
}
