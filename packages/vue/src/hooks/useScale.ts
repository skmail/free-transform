import {
  scale,
  Point,
  Matrix,
  call,
  Event,
  ScaleUpdatePayload,
  EventValidator,
} from "@free-transform/core";
import { useDrag } from "./useDrag";
import { Ref } from "vue";
interface Props {
  x: Ref<number>;
  y: Ref<number>;

  width: Ref<number>;
  height: Ref<number>;

  matrix: Ref<Matrix>;
  affineMatrix: Ref<Matrix>;
  perspectiveMatrix: Ref<Matrix>;

  onStart?: (event: Event) => void;
  onMove?: (event: Event) => void;
  onEnd?: (event: Event) => void;

  onUpdate: (data: ScaleUpdatePayload) => void;

  fromCenter: Ref<EventValidator<Event>>;
  aspectRatio: Ref<EventValidator<Event>>;
  scaleLimit: Ref<[number, number]>;
}

export function useScale({
  width,
  height,
  matrix,
  affineMatrix,
  perspectiveMatrix,

  fromCenter,
  aspectRatio,
  scaleLimit,

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

    const drag = scale(
      handle,
      {
        start: [event.clientX, event.clientY],

        width: width.value,
        height: height.value,
        matrix: matrix.value,
        affineMatrix: affineMatrix.value,
        perspectiveMatrix: perspectiveMatrix.value,

        aspectRatio: aspectRatio.value,
        fromCenter: fromCenter.value,

        scaleLimit: scaleLimit.value,
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
