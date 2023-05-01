<template>
  <div id="app">
    <PianoKeyboard />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PianoKeyboard from "./components/Keyboard.vue"; // Update the imported component name

export default defineComponent({
  name: "App",
  components: {
    PianoKeyboard, // Register the renamed component
  },
});
</script>
