import {
  translate,
  call,
  Event,
  TranslateUpdatePayload,
} from "@free-transform/core";
import { useDrag } from "./useDrag";
import { Ref } from "vue";
interface Props {
  x: Ref<number>;
  y: Ref<number>;

  onStart?: (event: Event) => void;
  onMove?: (event: Event) => void;
  onEnd?: (event: Event) => void;

  onUpdate: (data: TranslateUpdatePayload) => void;
}

export function useTranslate({
  x,
  y,
  onStart,
  onMove,
  onEnd,
  onUpdate,
}: Props) {
  const onDrag = useDrag();

  return (event: PointerEvent) => {
    call(onStart, event);

    event.stopPropagation();
    event.preventDefault();

    const drag = translate(
      {
        start: [event.clientX, event.clientY],
        x: x.value,
        y: y.value,
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
