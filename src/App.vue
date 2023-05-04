<template>
  <div id="app">
    <PianoKeyboard />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PianoKeyboard from "./components/PianoKeyboard.vue"; // Update the imported component name

export default defineComponent({
  name: "App",
  components: {
    PianoKeyboard,
  },
});
</script>

<style scoped>
#app {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: linear-gradient(#0c8ed3, #0cabc0, #aff3ff);
}
</style>
