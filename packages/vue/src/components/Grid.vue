<script lang="ts" setup>
import {
  minMax, 
  Matrix,
  Mat
} from "@free-transform/core";
import { computed, inject, Ref } from "vue";

export interface Props {
  strokeWidth: number;
  lines: number;
}
const props = withDefaults(defineProps<Props>(), {
  strokeWidth: 1,
  lines: 2,
});

const matrix = inject<Ref<Matrix>>("matrix");
const width = inject<Ref<number>>("width");
const height = inject<Ref<number>>("height");

const svg = computed(() => {
  if (!matrix || !height || !width) {
    return;
  }
  const points = Mat.toPoints(matrix.value, [
    [0, 0],
    [0, height.value],
    [width.value, height.value],
    [width.value, 0],
  ]);

  const data = points.map((point, i) => {
    const data = [];
    if (i === 0) {
      data.push(`M ${point[0].toFixed(10)} ${point[1].toFixed(10)}`);
    } else {
      data.push(`L ${point[0].toFixed(10)} ${point[1].toFixed(10)}`);
    }

    return data.join(" ");
  });

  data.push("Z");

  const count = Math.max(0, props.lines) + 1;
  const h = height.value / count;
  for (let i = h; i < height.value; i += h) {
    const p = Mat.toPoint(matrix.value, [0, i]);
    const p2 = Mat.toPoint(matrix.value, [width.value, i]);
    data.push(`M ${p[0]} ${p[1]}`);
    data.push(`L ${p2[0]} ${p2[1]}`);
  }

  const w = width.value / count;
  for (let i = w; i < width.value; i += w) {
    const p = Mat.toPoint(matrix.value, [i, 0]);
    const p2 = Mat.toPoint(matrix.value, [i, height.value]);
    data.push(`M ${p[0]} ${p[1]}`);
    data.push(`L ${p2[0]} ${p2[1]}`);
  }

  const box = minMax(points);

  const margin = props.strokeWidth / 2;

  return {
    d: data.join(" "),
    viewBox: `${(box.xmin - margin).toFixed(10)} ${(box.ymin - margin).toFixed(
      10
    )} ${(box.width + margin * 2).toFixed(10)} ${(
      box.height +
      margin * 2
    ).toFixed(10)}`,
    width: box.width + margin * 2,
    height: box.height + margin * 2,
    box: {
      ...box,
      ymin: box.ymin,
      xmin: box.xmin,
    },
  };
});
</script>

<template>
  <svg
    v-if="svg"
    :style="{
      position: 'absolute',
      left: svg.box.xmin,
      top: svg.box.ymin,
    }"
    :width="svg.width"
    :height="svg.height"
    :viewBox="svg.viewBox"
    fill="none"
  >
    <path :stroke-width="strokeWidth" :d="svg.d" />
  </svg>
</template>
