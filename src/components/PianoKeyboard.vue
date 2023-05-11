<!-- PianoKeyboard.vue -->
<template>
  <div>
    <h1 class="title">Simple Synth</h1>
    <div class="waveform-selection">
      <button
        v-for="type in waveforms"
        :key="type"
        @click="
          setWaveformType(type as 'sine' | 'square' | 'triangle' | 'sawtooth')
        "
        :class="{ 'waveform-selected': synth.waveformType === type }"
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
          :isActive="activeKeys[note.label]"
        />
      </div>

      <VolumeSlider :initialVolume="volume" @volume-change="emitVolumeChange" />

      <div class="instruction-box">
        Use the keyboard to play a note or chord "A,S,W,D"
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted } from "vue";
import PianoKey from "./PianoKey.vue";
import VolumeSlider from "./VolumeSlider.vue";
import FrequencySlider from "./FrequencySlider.vue";

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
    const keyMap: { [key: string]: string | undefined } = {
      a: "C",
      w: "C#",
      s: "D",
      e: "D#",
      d: "E",
      f: "F",
      t: "F#",
      g: "G",
      y: "G#",
      h: "A",
      u: "A#",
      j: "B",
    };

    const activeKeys = reactive(
      Object.keys(keyMap).reduce((acc, key) => {
        acc[keyMap[key] as string] = false;
        return acc;
      }, {} as Record<string, boolean>)
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const noteLabel = keyMap[key];
      if (noteLabel) {
        const noteData = notes.find((n) => n.label === noteLabel);
        if (noteData) {
          playNote(noteData.frequency, noteData.label);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const noteLabel = keyMap[key];
      if (noteLabel) {
        stopNote(noteLabel);
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    });

    type Synth = {
      audioContext: AudioContext;
      oscillators: Record<string, OscillatorNode>;
      contextResumed: boolean;
      gainNode: GainNode | null;
      waveformType: "sine" | "square" | "triangle" | "sawtooth";
    };

    const synth: Synth = reactive({
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      oscillators: {},
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

    const playNote = async (frequency: number, label: string) => {
      await ensureAudioContextResumed();
      const noteData = notes.find((n) => n.label === label);
      if (noteData && !synth.oscillators[label]) {
        currentNote.value = noteData.label;
        const oscillator = synth.audioContext.createOscillator();
        oscillator.type = synth.waveformType;
        oscillator.frequency.value = frequency;
        if (synth.gainNode) {
          oscillator.connect(synth.gainNode);
        }
        oscillator.start();
        synth.oscillators[label] = oscillator;
        activeKeys[label] = true;
      }
    };

    const stopNote = (label: string) => {
      if (synth.oscillators[label]) {
        synth.oscillators[label].stop();
        synth.oscillators[label].disconnect();
        delete synth.oscillators[label];
      }
      activeKeys[label] = false;
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
      getFrequencyForLabel,
      activeKeys,
    };
  },
});
</script>

<style scoped>
.piano-keyboard {
  display: flex;
  align-items: flex-start;
  background-color: #84cfd2;
  padding: 50px;
  border-radius: 10px;
  box-shadow: 1px 8px 6px rgb(57, 90, 99);
}

.key {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 2px 4px rgb(49, 108, 156);
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
}

.piano-container {
  margin-bottom: 250px;
}

.info-box-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.info-box {
  flex: 1;
  padding: 10px;
  margin: 10px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  background-color: #ffffffd8;
  border: 1px solid #0000007f;
  border-radius: 8px;
}

.waveform-selected {
  background-color: #00ffff !important;
}

.waveform-selection {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.waveform-selection button {
  background-color: #f0f0f0;
  border: 1px solid #0707077e;
  border-radius: 4px;
  color: #000000;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
  padding: 8px 12px;
  text-transform: capitalize;
  transition: background-color 0.2s;
}

.waveform-selection button:hover {
  background-color: #a2a1a1;
}

.waveform-selection button:active {
  background-color: #d0d0d0;
}

.title {
  font-size: 3rem;

  text-align: center;
  margin-bottom: 3rem;
  background-color: #f3ec78;
  background-image: linear-gradient(45deg, #ff00aa, #d9ff00);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
  -webkit-text-stroke-width: 1.5px;
  -webkit-text-stroke-color: black;
}
.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.instruction-box {
  background-color: #99e7ff;
  border: 1px solid #545454;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .piano-keyboard {
    padding: 20px;
    flex-wrap: wrap;
  }

  .key {
    height: 60px;
    width: 20px;
  }

  .title {
    font-size: 1.5rem;
  }

  /* Add any additional styles you want to adjust for mobile here */
}
</style>
