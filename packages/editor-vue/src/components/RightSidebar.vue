<template>
  <div
    class="sidebar border-l border-gray-200 bg-gray-100 h-screen flex flex-col overflow-y-auto"
  >
    <div v-if="element">
      <div class="py-2 bg-gray-200 px-4 -mx-4 mb-2 -mt-4">Element</div>
      <div class="input-field">
        <label> Width </label>
        <input
          @input="updateFloat"
          :value="element.width"
          name="width"
          class="input"
          type="number"
        />
      </div>
      <div class="input-field">
        <label> Height </label>
        <input
          @input="updateFloat"
          :value="element.height"
          class="input"
          name="height"
          type="number"
        />
      </div>

      <div class="input-field">
        <label>x</label>
        <input
          @input="updateFloat"
          :value="element.x"
          class="input"
          name="x"
          type="number"
        />
      </div>

      <div class="input-field">
        <label> y </label>
        <input
          @input="updateFloat"
          :value="element.y"
          class="input"
          name="y"
          type="number"
        />
      </div>

      <div v-if="element.type === 'image'" class="input-field">
        <label> src </label>
        <input
          @input="updateText"
          :value="element.src"
          class="input"
          name="text"
          type="text"
        />
      </div>
      <div v-if="element.type === 'text'" class="input-field block">
        <div class="flex justify-between">
          <label> text </label>
          <textarea
            @input="updateText"
            :value="element.text"
            class="input"
            name="text"
            type="text"
          ></textarea>
        </div>
        <p class="text-xs mt-1 text-gray-700 font-medium text-end">
          Html embed allowed
        </p>
      </div>

      <div class="input-field">
        <label> Locked </label>
        <input
          @input="updateCheckbox"
          :checked="element.locked"
          class="input"
          name="locked"
          type="checkbox"
        />
      </div>

      <div class="input-field">
        <label> Resizble </label>
        <input
          @input="updateCheckbox"
          :checked="element.disabledScale"
          class="input"
          name="disabledScale"
          type="checkbox"
        />
      </div>

      <div class="-mx-1">
        <button
          @click="emit('reset')"
          class="hover:bg-gray-50 bg-gray-200 px-2 py-1 rounded m-1"
        >
          Reset
        </button>
        <button
          @click="emit('fitWorkspace')"
          class="hover:bg-gray-50 bg-gray-200 px-2 py-1 rounded m-1"
        >
          Fit workspace
        </button>
        <button
          @click="emit('fitContent')"
          class="hover:bg-gray-50 bg-gray-200 px-2 py-1 rounded m-1"
        >
          Fit content
        </button>
        <button
          @click="emit('delete')"
          class="hover:bg-red-600 bg-red-500 text-white px-2 py-1 rounded m-1"
        >
          Delete
        </button>
      </div>
    </div>

    <div>
      <div class="py-2 bg-gray-200 px-4 -mx-4 my-2">Workspace</div>
      <div class="input-field">
        <label> Width </label>
        <input
          @input="updateWorkspaceFloat"
          :value="workspace.width"
          class="input"
          name="width"
          type="number"
        />
      </div>
      <div class="input-field">
        <label> Height </label>
        <input
          @input="updateWorkspaceFloat"
          :value="workspace.height"
          class="input"
          name="height"
          type="number"
        />
      </div>

      <div class="input-field block">
        <label class="block mb-0.5"> Perspective grid lines </label>
        <input
          @input="updateWorkspaceFloat"
          :value="workspace.perspectiveGrid"
          class="input"
          name="perspectiveGrid"
          type="number"
        />
      </div>
      <div class="input-field block">
        <label class="block mb-0.5"> Perspective grid stroke width </label>
        <input
          @input="updateWorkspaceFloat"
          :value="workspace.perspectiveGridWidth"
          class="input"
          name="perspectiveGridWidth"
          type="number"
          min="0"
        />
      </div>
      <div class="input-field block">
        <label class="block mb-0.5"> Perspective grid stroke color </label>
        <input
          @input="updateWorkspaceText"
          :value="workspace.perspectiveGridColor"
          class="input"
          name="perspectiveGridColor"
          type="color"
          min="0"
        />
      </div>

      <div class="input-field">
        <label>matrix3d precision</label>
        <input
          @input="updateWorkspaceFloat"
          :value="workspace.precision"
          class="input"
          name="precision"
          type="number"
          min="0"
          max="20"
        />
      </div>
    </div>
    <div class="mt-auto space-y-2">
      <div>
        <span class="bg-blue-500 text-white px-2 rounded py-0.5 mr-2">CMD</span>
        Warp
      </div>
      <div>
        <span class="bg-blue-500 text-white px-2 rounded py-0.5 mr-2">Alt</span>
        Scale from center
      </div>
      <div>
        <span class="bg-blue-500 text-white px-2 rounded py-0.5 mr-2"
          >Shift</span
        >
        Aspect ratio Scale
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Element, Workspace } from "../types";

defineProps<{
  element: Element;
  workspace: Workspace;
}>();

const emit = defineEmits<{
  (e: "update", value: Partial<Element>): void;
  (e: "workspaceUpdate", value: Partial<Workspace>): void;
  (e: "reset"): void;
  (e: "fitWorkspace"): void;
  (e: "fitWorkspace"): void;
  (e: "delete"): void;
  (e: "fitContent"): void;
}>();

const updateFloat = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseFloat(target.value);
  if (isNaN(value)) {
    return;
  }
  emit("update", {
    [target.name]: value,
  });
};

const updateText = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update", {
    [target.name]: target.value,
  });
};

const updateCheckbox = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update", {
    [target.name]: target.checked,
  });
};

const updateWorkspaceFloat = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseFloat(target.value);
  if (isNaN(value)) {
    return;
  }
  emit("workspaceUpdate", {
    [target.name]: value,
  });
};

const updateWorkspaceText = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("workspaceUpdate", {
    [target.name]: target.value,
  });
};


</script>
