<template>
  <div
    class="key"
    :class="[note.type, { active: note.active }]"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PianoKey",
  props: {
    note: {
      type: Object,
      required: true,
    },
    playNote: {
      type: Function,
      required: true,
    },
    stopNote: {
      type: Function,
      required: true,
    },
  },
  methods: {
    onMouseDown() {
      this.playNote(this.note.frequency, this.note.label);
    },
    onMouseUp() {
      this.stopNote();
    },
  },
});
</script>

<!-- PianoKey.vue -->
<!-- ... -->
<style scoped>
.key {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 4px 6px rgba(86, 135, 175, 0.524);
}
</style>
