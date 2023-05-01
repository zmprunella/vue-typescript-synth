<template>
  <div class="keyboard-container">
    <div class="current-note">
      {{ currentNote }}
    </div>

    <div class="keyboard">
      <div
        v-for="(note, index) in notes"
        :key="index"
        :class="['key', note.type]"
        @mousedown="playNote(note.frequency, note.label)"
        @mouseup="stopNote()"
      ></div>
    </div>
    <div class="volume-slider">
      <label for="volume">Volume:</label>
      <input
        type="range"
        id="volume"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        @input="updateVolume"
        class="volume-slider"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "PianoKeyboard",
  setup() {
    const volume = ref(1); // Initialize volume to 1 (max)
    const currentNote = ref("");

    const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
    const blackKeys = ["C#", "D#", null, "F#", "G#", "A#", null];

    function generateNotesArray() {
      const notes = [];
      let octave = 3;
      let frequency = 130.81; // Start at C1 frequency
      const frequencyRatio = Math.pow(2, 1 / 12);

      for (let i = 0; i < 25; i++) {
        const isWhite = (i % 12) % 2 === 0 || i % 12 === 5;
        const noteType = isWhite ? "white" : "black";
        const noteLabel = isWhite
          ? whiteKeys[(i % 12) - Math.floor(i / 12) * 2]
          : blackKeys[(i % 12) - Math.floor(i / 12) * 2];

        const note = {
          type: noteType,
          frequency,
          label: noteLabel ? noteLabel + octave : "", // Only add octave number if noteLabel is not null
        };

        notes.push(note);

        frequency *= frequencyRatio;

        if (i % 12 === 11) {
          octave++;
        }
      }

      return notes;
    }

    const notes = generateNotesArray();

    const audioContext = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();

    const oscillator = ref<OscillatorNode | null>(null);

    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    function playNote(frequency: number, noteLabel: string) {
      currentNote.value = noteLabel;
      oscillator.value = audioContext.createOscillator();
      oscillator.value.frequency.value = frequency;
      oscillator.value.type = "sine";
      oscillator.value.connect(gainNode);
      oscillator.value.start();
    }

    function stopNote() {
      if (oscillator.value) {
        oscillator.value.stop();
        oscillator.value.disconnect();
        oscillator.value = null;
      }
    }

    function updateVolume() {
      gainNode.gain.value = volume.value;
    }

    function resumeAudioContext() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (audioContext.state === "suspended") {
        audioContext.resume().then(() => {
          console.log("AudioContext resumed successfully");
          gainNode.connect(audioContext.destination); // Connect gainNode to destination after resume
        });
      }
    }

    return {
      notes,
      playNote,
      stopNote,
      volume,
      updateVolume,
      resumeAudioContext,
      currentNote,
    };
  },
});
</script>

<style>
.keyboard {
  display: flex;
  align-items: flex-start;
}

.key {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.white {
  background-color: white;
  height: 100px;
  width: 30px;
  border: 1px solid black;
  z-index: 1;
}

.black {
  background-color: black;
  height: 70px;
  width: 20px;
  margin-left: -10px;
  margin-right: -10px;
  z-index: 2;
}

.keyboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

.volume-slider {
  margin: 3rem;
}

input[type="range"].volume-slider {
  width: 100%;
  max-width: 200px;
  margin-left: 1rem;
  background: transparent;
  cursor: pointer;
}

input[type="range"].volume-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: #d3d3d3;
  border-radius: 3px;
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
  background: #4caf50;
  border-radius: 50%;
  margin-top: -6px;
}

input[type="range"].volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
}

input[type="range"].volume-slider::-ms-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
}

.current-note {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 50px;
  font-size: 1.5rem;
  text-align: center;
}
</style>
