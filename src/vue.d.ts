// src/vue.d.ts
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export {};
