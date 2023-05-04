<template>
  <div class="key" :class="[note.type, { 'active-key': isActive }]"></div>
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
    isActive: Boolean,
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

<style scoped>
.key {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}
.active-key {
  opacity: 0.45;
}
</style>
