import { defineStore } from 'pinia';

interface State {
  defferedPrompt: any | null;
};

export const useInstallPromptStore = defineStore('install', {
  state: (): State => ({
    defferedPrompt: null,
  }),
  getters: {
    installPromptAvailable(): boolean {
      return this.defferedPrompt !== null && typeof this.defferedPrompt.prompt === 'function';
    },
  },
  actions: {
    async showInstallPrompt() {
      console.log('[App] Opening install prompt');
      this.defferedPrompt.prompt();
      const { outcome } = await this.defferedPrompt.userChoice;
      console.log(`[App] Prompt response: ${outcome}`);
      this.defferedPrompt = null;
    },
  }
});