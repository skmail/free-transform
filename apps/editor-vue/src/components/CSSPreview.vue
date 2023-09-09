<template>
  <div
    class="absolute left-4 items-center flex bottom-4 px-4 py-3 bg-gray-900 rounded-lg text-white text-sm"
  >
    <button
      @click.stop="onCopy"
      class="bg-gray-800 hover:bg-gray-700 p-1 rounded-md mr-2"
    >
      <svg
        v-if="!copied"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        />
      </svg>

      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    </button>
    {{ matrix3d }}
  </div>
</template>

<script lang="ts" setup>
import { Matrix, Point, Mat, Tuple } from "@free-transform/core";
import { useValues } from "@free-transform/vue";
import { computed } from "@vue/reactivity";
import copy from "copy-to-clipboard";
import { toRefs, ref } from "vue";

const props = withDefaults(
  defineProps<{
    disabledScale: boolean | undefined;
    x: number;
    y: number;
    width: number;
    height: number;
    matrix: Matrix;
    warp: Tuple<Point, 4> | undefined;
    precision: number;
  }>(),
  {
    precision: 10,
  }
);

const refs = toRefs(props);
const copied = ref(false);
const timeout = ref(0);

const { translatedMatrix } = useValues(refs);
const matrix3d = computed(() => {
  const mat = Mat.transpose(translatedMatrix.value);
  const string = mat.map((v) =>
    v.map((v) => Number(v.toFixed(props.precision)))
  );
  return `matrix3d(${string})`;
});

const onCopy = () => {
  clearTimeout(timeout.value);
  copied.value = true;
  copy(matrix3d.value);

  timeout.value = window.setTimeout(() => {
    copied.value = false;
  }, 1500);
};
</script>
