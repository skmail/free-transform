<script lang="ts" setup>
import { Matrix, Point, transpose, Tuple } from "@free-transform/core";
import { computed } from "@vue/reactivity";
import { toRefs, ref, CSSProperties } from "vue";
import { useValues } from "../hooks/useValues";

const props = withDefaults(
  defineProps<{
    disabledScale?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    matrix: Matrix;
    warp: Tuple<Point, 4> | undefined; 
  }>(),
  {
    disabledScale: false,
  }
);

const refs = toRefs(props);

const { width, height, translatedMatrix } = useValues(refs);

const content = ref<HTMLDivElement>();

defineExpose({
  ref: content,
});
</script>

<template>
  <div
    ref="content"
    :style="{
      transform: `matrix3d(${transpose(translatedMatrix)})`,
      userSelect: 'none',
      position: 'absolute',
      transformOrigin: '0 0',
      width,
      height,
    }"
  >
    <slot></slot>
  </div>
</template>
