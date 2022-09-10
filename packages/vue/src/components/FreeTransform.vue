<script setup lang="ts">
import { withDefaults, provide } from "vue";
import { useRotate } from "../hooks/useRotate";
import { useScale } from "../hooks/useScale";
import { useWarp } from "../hooks/useWarp";
import { useTranslate } from "../hooks/useTranslate";
import { toRefs } from "vue";
import {
  Matrix,
  Point,
  Tuple,
  Event,
  UpdatePayload,
  EventValidator,
} from "@free-transform/core";
import { useValues } from "../hooks/useValues";

export interface Props {
  aspectRatio?: EventValidator<Event>;
  scaleFromCenter?: EventValidator<Event>;
  snapRotation?: EventValidator<Event>;
  snapRotationDegree?: number;
  scaleLimit?: [number, number];
  offset?: [number, number];

  disabledScale?: boolean;

  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  warp: Tuple<Point, 4> | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  scaleLimit: () => [-Infinity, Infinity],
  offset: () => [0, 0],
  aspectRatio: () => (event: Event) =>
    Boolean((event as PointerEvent).shiftKey),
  scaleFromCenter: () => (event: Event) =>
    Boolean((event as PointerEvent).altKey),
  snapRotation: () => (event: Event) =>
    Boolean((event as PointerEvent).shiftKey),
  snapRotationDegree: 10,
  disabledScale: false,
});

const emit = defineEmits<{
  (e: "rotate.start", value: Event): void;
  (e: "rotate", value: Event): void;
  (e: "rotate.end", value: Event): void;

  (e: "scale.start", value: Event): void;
  (e: "scale", value: Event): void;
  (e: "scale.end", value: Event): void;

  (e: "warp.start", value: Event): void;
  (e: "warp", value: Event): void;
  (e: "warp.end", value: Event): void;

  (e: "translate.start", value: Event): void;
  (e: "translate", value: Event): void;
  (e: "translate.end", value: Event): void;

  (e: "update", value: UpdatePayload): void;
}>();

const refs = toRefs(props);

const {
  x,
  y,
  width,
  height,
  affineMatrix,
  matrix,
  perspectiveMatrix,
  translatedMatrix,
  warpPoints,
} = useValues(refs);

const rotate = useRotate({
  x,
  y,

  width,
  height,

  matrix,
  affineMatrix,

  offset: refs.offset,

  snap: refs.snapRotation,
  snapDegree: refs.snapRotationDegree,

  onStart: (e) => emit("rotate.start", e),
  onMove: (e) => emit("rotate", e),
  onEnd: (e) => emit("rotate.end", e),

  onUpdate: (data) => emit("update", data),
});

const scale = useScale({
  x,
  y,

  width,
  height,

  matrix,
  affineMatrix,
  perspectiveMatrix,

  fromCenter: refs.scaleFromCenter,
  aspectRatio: refs.aspectRatio,
  scaleLimit: refs.scaleLimit,

  onStart: (e) => emit("scale.start", e),
  onMove: (e) => emit("scale", e),
  onEnd: (e) => emit("scale.end", e),

  onUpdate: (data) => emit("update", data),
});

const warp = useWarp({
  handles: warpPoints,
  affineMatrix: refs.matrix,

  onStart: (e) => emit("warp.start", e),
  onMove: (e) => emit("warp", e),
  onEnd: (e) => emit("warp.end", e),

  onUpdate: (data) => emit("update", data),
});

const translate = useTranslate({
  x: refs.x,
  y: refs.y,

  onStart: (e) => emit("translate.start", e),
  onMove: (e) => emit("translate", e),
  onEnd: (e) => emit("translate.end", e),

  onUpdate: (data) => emit("update", data),
});

provide("width", width);
provide("height", height);
provide("matrix", translatedMatrix);
provide("affineMatrix", refs.matrix);
provide("scale", scale);
provide("rotate", rotate);
provide("warp", warp);
</script>

<template>
  <div v-on:pointerdown.stop="translate" style="position: absolute">
    <slot></slot>
  </div>
</template>
