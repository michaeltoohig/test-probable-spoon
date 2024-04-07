import { ref, onMounted, onUnmounted } from 'vue';

// TODO this is not the best it could be some newer APIs exist for some browsers.

export default function useOnlineStatus() {
  const isOnline = ref(navigator.onLine);

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return { isOnline };
};