import {
  warp,
  Point,
  Matrix,
  call,
  Event,
  WarpUpdatePayload,
  Tuple,
} from "@free-transform/core";
import { useDrag } from "./useDrag";
import { Ref } from "vue";
interface Props {
  handles: Ref<Tuple<Point, 4>>;

  affineMatrix: Ref<Matrix>;

  onStart?: (event: Event) => void;
  onMove?: (event: Event) => void;
  onEnd?: (event: Event) => void;

  onUpdate: (data: WarpUpdatePayload) => void;
}

export function useWarp({
  handles,
  affineMatrix,
  onStart,
  onMove,
  onEnd,
  onUpdate,
}: Props) {
  const onDrag = useDrag();

  return (handle: Point, event: PointerEvent) => {
    call(onStart, event);

    event.stopPropagation();
    event.preventDefault();

    const drag = warp(
      handle,
      {
        start: [event.clientX, event.clientY],
        matrix: affineMatrix.value,
        warp: handles.value,
      },
      (payload) => {
        call(onMove);
        call(onUpdate, payload);
      }
    );

    onDrag(drag, () => {
      call(onEnd, event);
    });
  };
}
