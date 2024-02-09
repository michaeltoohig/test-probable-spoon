import { defineStore, storeToRefs } from 'pinia';
import { addToQueue, deleteFromQueue, getQueue, initQueue } from '../service-worker/retry-queue';
import type { Movement } from '../services/directus';
import { useAuthStore } from './authStore';
import { NotificationType, useNotifyStore } from './notifyStore';
import { RETRY_MESSAGE_KEY } from '../constants';

interface RetryQueueItem {
  id: number;
  payload: any;
}

interface State {
  items: RetryQueueItem[];
  isSyncing: boolean;
  isSyncingTimer: any | null;
};

export const useRetryQueueStore = defineStore('queue', {
  state: (): State => ({
    items: [],
    isSyncing: false,
    isSyncingTimer: null,
  }),
  getters: {
    count(): number {
      return this.items.length;
    },
  },
  actions: {
    async init() {
      await initQueue();
      await this.getItems();
    },
    async getItems() {
      const items = await getQueue();
      this.items = items;
    },
    async addItem(payload: Movement) {
      await addToQueue(payload);
    },
    async deleteItem(id: number) {
      await deleteFromQueue(id);
    },
    async syncRetryQueue() {
      console.log('[Retry] Sending message to retry queue');
      const authStore = useAuthStore();
      const notifyStore = useNotifyStore();
      const authToken = authStore.authToken;
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        if (!authToken) {
          notifyStore.notify('Failed to retry queue; you are not logged in.', NotificationType.Error);
          return;
        }
        navigator.serviceWorker.controller.postMessage({
          type: RETRY_MESSAGE_KEY,
          payload: {
            authToken,
          },
        });
        this.isSyncing = true;
        // A failsafe to stop isSyncing in case of unexpected error from SW
        this.isSyncingTimer = setTimeout(async () => {
          await this.setRetryComplete();
        }, 10000);
      }
    },
    async setRetryComplete() {
      console.log('[Retry] Updating retry state as complete');
      clearTimeout(this.isSyncingTimer);
      this.isSyncing = false;
      await this.getItems();
    },
  },
 });