import { MutableRefObject, Ref } from "react";

export const assignRefs = <T extends unknown>(...refs: Ref<T | null>[]) => {
  return (node: T | null) => {
    refs.forEach((r) => {
      if (typeof r === "function") {
        r(node);
      } else if (r) {
        (r as MutableRefObject<T | null>).current = node;
      }
    });
  };
};
