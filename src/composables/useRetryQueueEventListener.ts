import { onMounted, onUnmounted } from 'vue';
import { RETRY_MESSAGE_KEY } from '../constants';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { useRetryQueueStore } from '../stores/retryQueueStore';

export default function useRetryQueueEventListener() {
  const retryStore = useRetryQueueStore();
  const notifyStore = useNotifyStore();

  const notifyRetryQueueEvent = (event: any) => {
    console.log('retry queue event', event);
    if (event.data && event.data.type === RETRY_MESSAGE_KEY) {
      // Update `isSyncing` status to mark end of SW side of work
      retryStore.setRetryComplete();

      // Notify user of results
      const successCount = event.data?.success || 0;
      if (successCount > 0) {
        notifyStore.notify(
          `${successCount} container movements in the retry queue have been successfully submitted.`,
          NotificationType.Success
        );
      }
      const failureCount = event.data?.failure || 0;
      if (failureCount > 0) {
        notifyStore.notify(
          `${failureCount} container movements in the retry queue have failed to submit. Try again later.`,
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
