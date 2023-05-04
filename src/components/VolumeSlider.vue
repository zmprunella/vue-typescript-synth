<template>
  <div class="volume-slider">
    <label for="volume">🔊 Volume 🔊</label>
    <input
      type="range"
      id="volume"
      min="0"
      max="1"
      step="0.01"
      v-model="currentVolume"
      @input="updateVolume"
      class="slider"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "VolumeSlider",
  props: {
    initialVolume: {
      type: Number,
      required: true,
    },
    onVolumeChange: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const currentVolume = ref(props.initialVolume);

    const updateVolume = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const volume = parseFloat(target.value);
      currentVolume.value = volume;
      emit("volume-change", volume);
    };

    return {
      currentVolume,
      updateVolume,
    };
  },
});
</script>

<style>
.volume-slider {
  margin-top: 3rem;
  color: #000000;
  display: flex;
  width: 16rem;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgb(105, 158, 164); /* Add a border width */
  border-radius: 5px;
  padding: 10px; /* Add padding */
  background-color: rgba(93, 166, 185, 0.418); /* Add a background color */
  margin-left: auto; /* Add this to center the box horizontally */
  margin-right: auto; /* Add this to center the box horizontally */
}

input[type="range"].volume-slider {
  width: 100%;
  max-width: 200px;
  margin-left: 1.5rem;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: inline-block;
  vertical-align: middle;
}

input[type="range"].volume-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: #d3d3d3;
  border-radius: 3px;
  position: relative;
}

input[type="range"].volume-slider::-moz-range-track {
  width: 100%;
  height: 8px;
  background: #d3d3d3;
  border-radius: 3px;
}

input[type="range"].volume-slider::-ms-track {
  width: 100%;
  height: 8px;
  background: #d3d3d3;
  border-radius: 3px;
}

input[type="range"].volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #0ddc14;
  border-radius: 50%;
  margin-top: -6px;
}

input[type="range"].volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #a0af4c;
  border-radius: 50%;
}

input[type="range"].volume-slider::-ms-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
}
</style>
