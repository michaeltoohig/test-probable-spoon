import { onMounted, onUnmounted } from 'vue';
import { RETRY_MESSAGE_KEY } from '../constants';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';

export default function useRetryQueueEventListener() {
  const notifyStore = useNotifyStore();

  const notifyRetryQueueEvent = (event: any) => {
    console.log('retry queue event', event);
    if (event.data && event.data.type === RETRY_MESSAGE_KEY) {
      const successCount = event.data?.success || 0;
      if (successCount > 0) {
        notifyStore.notify(
          `${successCount} container movements have been successfully submitted.`,
          NotificationType.Success
        );
      }
      const failureCount = event.data?.failure || 0;
      if (failureCount > 0) {
        notifyStore.notify(
          `${failureCount} container movements have failed to submit. Try again later.`,
          NotificationType.Error
        );
      }
    }
  };

  onMounted(() => {
    navigator.serviceWorker.addEventListener('message', notifyRetryQueueEvent);
  });

  onUnmounted(() => {
    navigator.serviceWorker.removeEventListener('message', notifyRetryQueueEvent);
  });
}
