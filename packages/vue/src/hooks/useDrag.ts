type EventCallback = (event: PointerEvent) => void;

export function useDrag() {
  return (drag: EventCallback, onUp?: EventCallback) => {
    const up = (event: PointerEvent) => {
      if (onUp) {
        onUp(event);
      }
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", up);
  };
}
