import {
  rotate,
  Point,
  Matrix,
  call,
  Event,
  RotateUpdatePayload,
  EventValidator,
} from "@free-transform/core";
import { useDrag } from "./useDrag";
import { Ref } from "vue";
interface Props {
  x: Ref<number>;
  y: Ref<number>;

  width: Ref<number>;
  height: Ref<number>;

  offset: Ref<[number, number]>;

  matrix: Ref<Matrix>;
  affineMatrix: Ref<Matrix>;

  snap: Ref<EventValidator<Event>>;
  snapDegree: Ref<number>;

  onStart?: (event: Event) => void;
  onMove?: (event: Event) => void;
  onEnd?: (event: Event) => void;

  onUpdate: (data: RotateUpdatePayload) => void;
}
export function useRotate({
  x,
  y,
  width,
  height,
  offset,
  matrix,
  affineMatrix,
  snap,
  snapDegree,
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

    const drag = rotate(
      handle,
      {
        start: [event.clientX, event.clientY],
        x: x.value,
        y: y.value,
        width: width.value,
        height: height.value,
        offset: offset.value,
        matrix: matrix.value,
        affineMatrix: affineMatrix.value,
        snap: snap.value,
        snapDegree: snapDegree.value,
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
