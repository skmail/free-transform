<script lang="ts" setup>
import { Matrix, Mat, Angle } from "@free-transform/core";
import { computed, inject, Ref } from "vue";

export interface Props {
  position: [number, number];
  origin?: [number, number];
  type: "warp" | "rotate" | "scale";
  offset?: [number, number];
}

type Handler = (handle: [number, number], event: PointerEvent) => void;

const props = withDefaults(defineProps<Props>(), {
  offset: () => [0, 0],
});

const width = inject<Ref<number>>("width");

const height = inject<Ref<number>>("height");

const affineMatrix = inject<Ref<Matrix>>("affineMatrix");
const matrix = inject<Ref<Matrix>>("matrix");

const handlers = {
  scale: inject<Handler>("scale"),
  rotate: inject<Handler>("rotate"),
  warp: inject<Handler>("warp"),
};

const transform = computed(() => {
  if (!affineMatrix || !matrix || !width || !height) {
    return "";
  }

  const decomposed = Mat.decompose(affineMatrix.value);

  const point1 = Mat.toPoint(matrix.value, [
    Math.floor(props.position[0]) * width.value,
    Math.floor(props.position[1]) * height.value,
  ]);

  const point2 = Mat.toPoint(matrix.value, [
    Math.ceil(props.position[0]) * width.value,
    Math.ceil(props.position[1]) * height.value,
  ]);

  const find = (p1: number, p2: number, per: number) => p1 + (p2 - p1) * per;

  const percentage = Math.abs(props.position[0] - props.position[1]);

  const point = [
    find(point1[0], point2[0], percentage),
    find(point1[1], point2[1], percentage),
  ];

  const radians = decomposed.rotation.angle;

  const [x, y] = Angle.point([props.offset[0], props.offset[1]], radians);

  return `translate(${point[0] + x}px, ${
    point[1] + y
  }px) rotate(${Angle.degrees(-radians)}deg)`;
});

const onDown = (event: PointerEvent) => {
  handlers[props.type]?.(props.origin || props.position, event);
};
</script>

<template>
  <div
    :style="{
      transform,
    }"
    @pointerdown.stop="onDown"
  ></div>
</template>
