import { onMounted, onUnmounted } from 'vue';
import { useInstallPromptStore } from '../stores/installPromptStore';
import { storeToRefs } from 'pinia';

export default function useInstallPromptEventListeners() {
  const store = useInstallPromptStore();
  const { defferedPrompt } = storeToRefs(store);
  
  const beforeInstallPromptHandler = (event) => {
    event.preventDefault();
    defferedPrompt.value = event;
    console.log('[App] Install prompt event stashed');
  };

  const appInstalledHandler = () => {
    defferedPrompt.value = null;
    console.log('[App] Installed');
  };

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.addEventListener('appinstalled', appInstalledHandler);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.removeEventListener('appinstalled', appInstalledHandler);
  });
};