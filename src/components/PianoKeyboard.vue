<!-- PianoKeyboard.vue -->
<template>
  <div>
    <div class="waveform-selection">
      <button
        v-for="type in waveforms"
        :key="type"
        @click="
          setWaveformType(type as 'sine' | 'square' | 'triangle' | 'sawtooth')
        "
      >
        {{ type }}
      </button>
    </div>

    <div class="info-box-container">
      <div class="info-box">
        {{ currentNote }}
      </div>
      <div class="info-box empty-box">
        {{ currentNote ? getFrequencyForLabel(currentNote) : "N/A" }}
      </div>
    </div>
    <div class="piano-container">
      <div class="piano-keyboard">
        <PianoKey
          v-for="(note, index) in notes"
          :key="index"
          :note="note"
          :playNote="playNote"
          :stopNote="stopNote"
        />
      </div>

      <VolumeSlider :initialVolume="volume" @volume-change="emitVolumeChange" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import PianoKey from "./PianoKey.vue";
import VolumeSlider from "./VolumeSlider.vue";

export default defineComponent({
  name: "PianoKeyboard",
  components: {
    PianoKey,
    VolumeSlider,
  },
  setup() {
    const notes = [
      { label: "C", frequency: 261.63, type: "white" },
      { label: "C#", frequency: 277.18, type: "black" },
      { label: "D", frequency: 293.66, type: "white" },
      { label: "D#", frequency: 311.13, type: "black" },
      { label: "E", frequency: 329.63, type: "white" },
      { label: "F", frequency: 349.23, type: "white" },
      { label: "F#", frequency: 369.99, type: "black" },
      { label: "G", frequency: 392.0, type: "white" },
      { label: "G#", frequency: 415.3, type: "black" },
      { label: "A", frequency: 440.0, type: "white" },
      { label: "A#", frequency: 466.16, type: "black" },
      { label: "B", frequency: 493.88, type: "white" },
    ];

    type Synth = {
      audioContext: AudioContext;
      oscillator: OscillatorNode | null;
      contextResumed: boolean;
      gainNode: GainNode | null;
      waveformType: "sine" | "square" | "triangle" | "sawtooth"; // Update the type definition here
    };

    const synth: Synth = reactive({
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      oscillator: null,
      contextResumed: false,
      gainNode: null,
      waveformType: "sine",
    });

    const currentNote = ref("");
    const volume = ref(0.5);

    const ensureAudioContextResumed = async () => {
      if (synth.audioContext.state === "suspended") {
        await synth.audioContext.resume();
        synth.gainNode = synth.audioContext.createGain();
        synth.gainNode.connect(synth.audioContext.destination);
        synth.gainNode.gain.value = volume.value;
      }
    };

    const resumeAudioContext = () => {
      if (!synth.contextResumed) {
        synth.audioContext.resume().then(() => {
          synth.contextResumed = true;
        });
      }
    };

    const startOscillator = (frequency: number) => {
      if (synth.oscillator) {
        stopOscillator();
      }
      const oscillator = synth.audioContext.createOscillator();
      oscillator.type = synth.waveformType;
      oscillator.frequency.value = frequency;
      if (synth.gainNode) {
        oscillator.connect(synth.gainNode);
      }
      oscillator.start();
      synth.oscillator = oscillator;
    };

    const stopOscillator = () => {
      if (synth.oscillator) {
        synth.oscillator.stop();
        synth.oscillator.disconnect();
        synth.oscillator = null;
      }
    };

    const playNote = async (frequency: number, label: string) => {
      await ensureAudioContextResumed();
      const noteData = notes.find((n) => n.label === label);
      if (noteData) {
        currentNote.value = noteData.label; // Update the currentNote value
        startOscillator(noteData.frequency);
      }
    };

    const stopNote = () => {
      stopOscillator();
    };

    const updateVolume = (newVolume: number) => {
      volume.value = newVolume;
    };

    const emitVolumeChange = (newVolume: number) => {
      volume.value = newVolume;
      if (synth.gainNode) {
        synth.gainNode.gain.value = newVolume;
      }
    };

    const getFrequencyForLabel = (label: string) => {
      const noteData = notes.find((n) => n.label === label);
      return noteData ? noteData.frequency : "N/A";
    };

    const waveforms = ["sine", "square", "triangle", "sawtooth"];

    const setWaveformType = (
      type: "sine" | "square" | "triangle" | "sawtooth"
    ) => {
      synth.waveformType = type;
    };

    return {
      synth,
      notes,
      currentNote,
      playNote,
      stopNote,
      volume,
      updateVolume,
      emitVolumeChange,
      resumeAudioContext,
      setWaveformType,
      waveforms,
      getFrequencyForLabel, // Add this line
    };
  },
});
</script>

<style scoped>
.piano-keyboard {
  display: flex;
  align-items: flex-start;
  background-color: #7fbbbd;
  padding: 50px;
  border-radius: 10px;
  box-shadow: 1px 8px 6px rgb(82, 104, 110);
}

.key {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 4px 6px rgb(86, 135, 175);
}

.white {
  background-color: white;
  height: 120px;
  width: 40px;
  border: 2px solid #ccc;
  z-index: 1;
}

.black {
  background-color: black;
  height: 80px;
  width: 30px;
  margin-left: -15px;
  margin-right: -15px;
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
  background-color: #23447c;
}

.piano-container {
  margin-bottom: 200px;
}

.info-box-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.info-box {
  flex: 1;
  padding: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.waveform-selection {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.waveform-selection button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
  padding: 8px 12px;
  text-transform: capitalize;
  transition: background-color 0.3s;
}

.waveform-selection button:hover {
  background-color: #e0e0e0;
}

.waveform-selection button:active {
  background-color: #d0d0d0;
}
</style>
