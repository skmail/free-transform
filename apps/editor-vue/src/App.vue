<template>
  <div class="app bg-gray-50 h-screen overflow-hidden">
    <LeftSide @add="add($event)" />
    <div
      class="flex-1 items-center justify-center flex relative h-screen overflow-y-auto"
      @click="selectedElement = ''"
    >
      <div
        class="relative mx-auto shadow ring"
        :style="{
          width: workspace.width + 'px',
          height: workspace.height + 'px',
        }"
      >
        <div
          class="relative"
          :style="{
            width: workspace.width + 'px',
            height: workspace.height + 'px',
          }"
          :ref="(el) => (refs.workspace = el)"
          @click.stop
        >
          <Transformed
            v-for="element of elements"
            :disabled-scale="element.disabledScale"
            :key="element.id"
            :x="element.x"
            :y="element.y"
            :width="element.width"
            :height="element.height"
            :matrix="element.matrix"
            :warp="element.warp"
            @click.stop="selectedElement = element.id"
            :ref="(el) => (refs[`elements-${element.id}`] = el)"
          >
            <template v-if="element.type === 'image'">
              <img
                :width="element.width"
                :height="element.height"
                :src="element.src"
              />
            </template>
            <template v-if="element.type === 'text'">
              <div v-html="element.text"></div>
            </template>
          </Transformed>
        </div>

        <FreeTransform
          :style="{ top: 0, left: 0 }"
          v-if="element"
          :key="element.id"
          :x="element.x"
          :y="element.y"
          :width="element.width"
          :height="element.height"
          :offset="offset"
          :matrix="element.matrix"
          :warp="element.warp"
          @click.stop
          @update="updateIfNotLocked(element ? element.id : '', $event)"
        >
          <Grid
            :stroke="workspace.perspectiveGridColor"
            fill="none"
            :lines="workspace.perspectiveGrid"
            :stroke-width="workspace.perspectiveGridWidth"
          />

          <template v-for="handle of handles">
            <Handle
              :position="[handle[0], handle[1]]"
              class="transform__rotator"
              type="rotate"
              :offset="[handle[2], handle[3]]"
            />
            <Handle
              :position="[handle[0], handle[1]]"
              :class="[
                'transform__handle',
                mode === 'warp' ? 'transform__handle-warp' : '',
              ]"
              :type="mode"
            />
          </template>
        </FreeTransform>
      </div>

      <CSSPreview
        :precision="workspace.precision"
        v-if="element"
        :key="element.id"
        :x="element.x"
        :y="element.y"
        :width="element.width"
        :height="element.height"
        :offset="offset"
        :matrix="element.matrix"
        :warp="element.warp"
        :disabled-scale="element.disabledScale"
      />
    </div>

    <RightSidebar
      @update="update(selectedElement, $event)"
      @workspace-update="updateWorkspace"
      :workspace="workspace"
      :element="element"
      @reset="reset"
      @fitWorkspace="fitWorkspace"
      @fitContent="fitContent"
      @delete="deleteElement"
    />
  </div>
</template>

<script lang="ts" setup>
import { Mat } from "@free-transform/core";
import { FreeTransform, Handle, Grid, Transformed } from "@free-transform/vue";
import { computed, onMounted, ref, shallowRef } from "vue";

import CSSPreview from "./components/CSSPreview.vue";
import { Workspace, Element } from "./types";

import LeftSide from "./components/LeftSide.vue";
import RightSidebar from "./components/RightSidebar.vue";

const workspace = ref<Workspace>({
  width: 600,
  height: 400,
  perspectiveGrid: 2,
  perspectiveGridWidth: 1,
  perspectiveGridColor: "#000000",
  precision: 10,
});

const mode = ref<"scale" | "warp">("scale");
const handles = ref<[number, number, number, number][]>([
  // [0, 0, -20, -20],
  // [0, 1, -20, 20],
  [1, 0, 20, -20],
  // [1, 1, 20, 20],
  // [0.5, 0, 0, -20],
  // [0, 0.5, -20, 0],
  // [1, 0.5, 20, 0],
  // [0.5, 1, 0, 20],
]);

const refs = shallowRef<Record<string, any>>({});
const offset = ref<[number, number]>([0, 0]);
const elements = ref<Element[]>([]);
const selectedElement = ref<string>("");

const element = computed(
  () =>
    elements.value.find(
      (element) => selectedElement.value === element.id
    ) as Element
);

const add = (data: Partial<Element> = {}) => {
  const width = data.width || 100;
  const height = data.height || 100;

  const element = {
    ...data,

    width,
    height,
    x: 0,
    y: 0,
    id: `${Math.random()}`,
    matrix: Mat.fromParams({
      width,
      height,
      scaleX: 1,
      scaleY: 1,
    }),
  };
  elements.value.push(element as Element);
  selectedElement.value = element.id;
};

const update = (id: string, payload: Partial<Element>) => {
  elements.value = elements.value.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...payload,
      } as Element;
    }
    return item;
  });
};

const updateIfNotLocked = (id: string, payload: Partial<Element>) => {
  const element = elements.value.find((element) => element.id === id);
  if (!element || element.locked) {
    return;
  }
  update(id, payload);
};

const setSelected = (id: string) => (selectedElement.value = id);

const reset = () => {
  update(selectedElement.value, {
    matrix: Mat.fromParams({
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
    }),
    warp: undefined,
  });
};

const deleteElement = () => {
  const id = selectedElement.value;
  selectedElement.value = "";
  elements.value = elements.value.filter((element) => element.id !== id);
};

const fitWorkspace = () => {
  update(selectedElement.value, {
    matrix: Mat.fromParams({
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
    }),
    warp: undefined,
    width: workspace.value.width,
    height: workspace.value.height,
    x: 0,
    y: 0,
  });
};

const updateWorkspace = (data: Partial<Workspace>) => {
  workspace.value = {
    ...workspace.value,
    ...data,
  };
};
const fitContent = () => {
  if (!element.value) {
    return;
  }

  const dom = refs.value[`elements-${element.value.id}`].ref;

  const styles = {
    transform: dom.style.transform,
    width: dom.style.width,
    height: dom.style.height,
  };
  dom.style.transform = "";
  dom.style.width = "";
  dom.style.height = "";
  const bounds = dom.getBoundingClientRect();
  dom.style.transform = styles.transform;
  dom.style.width = styles.width;
  dom.style.height = styles.height;
  update(element.value.id, {
    matrix: Mat.fromParams({
      width: bounds.width,
      height: bounds.height,
      scaleX: 1,
      scaleY: 1,
    }),
    warp: undefined,
    width: bounds.width,
    height: bounds.height,
  });
};

onMounted(() => {
  if (!refs.value.workspace) {
    return;
  }
  const bounds = refs.value.workspace.getBoundingClientRect();
  offset.value = [bounds.x, bounds.y];

  window.addEventListener("keydown", (event) => {
    if (event.code === "MetaLeft") {
      mode.value = "warp";
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "MetaLeft") {
      mode.value = "scale";
    }
  });
  add({
    type: "text",
    text: '<div style="font-size:64px;">Free transform</div>',
  });
  setTimeout(() => {
    if (!element.value) {
      return;
    }

    fitContent();
    update(selectedElement.value, {
      x: workspace.value.width / 2 - element.value.width / 2,
      y: workspace.value.height / 2 - element.value.height / 2,
    });
  }, 5);
});
</script>

<style>
.transform {
  position: absolute;
}
.transform--active {
  position: absolute;
  z-index: 5;
}

.transform__content {
  user-select: none;
  position: absolute;
}
.transform__content .element {
  padding: 5px;
}

.transform__content,
.transform__controls {
  transform-origin: 0 0;
}

:root {
  --handle-size: 10px;
}

.transform__handle {
  background: #fff;
  width: var(--handle-size);
  height: var(--handle-size);

  border-radius: 2px;
  position: absolute;
  cursor: pointer;
  box-shadow: 0 0 0 1.5px #3b82f6;

  margin-top: calc(var(--handle-size) / -2);
  margin-left: calc(var(--handle-size) / -2);
}

.transform__handle-warp {
  box-shadow: 0 0 0 1.5px #db2777;
}

.transform__rotator {
  --handle-size: 10px;
  width: var(--handle-size);
  height: var(--handle-size);

  border-radius: 3;
  position: absolute;
  cursor: pointer;

  border-radius: 40px;

  margin-left: calc(var(--handle-size) / -2);
  margin-top: calc(var(--handle-size) / -2);
  box-shadow: 0 0 0 1.5px #3b82f6;
}

.transform__rotator:hover,
.transform__handle:hover {
  background: #f1f5f8;
}

.transform__rotator:active,
.transform__handle:active {
  background: #dae1e7;
}

.transform__origin {
  --size: 10px;
  width: var(--size);
  height: var(--size);
  background: white;
  position: absolute;
  border-radius: 9999px;
  margin-left: calc(var(--size) / -2);
  margin-top: calc(var(--size) / -2);
  box-shadow: 0 0 0px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.transform__origin:hover {
  transform: scale(1.2);
}
</style>
