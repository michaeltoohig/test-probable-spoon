import { defineStore } from 'pinia';
import { deleteFromQueue, getQueue, initQueue } from '../service-worker/retry-queue';

interface RetryQueueItem {
  id: number;
  payload: any;
}

interface State {
  items: RetryQueueItem[];
};

export const useRetryQueueStore = defineStore('queue', {
  state: (): State => ({
    items: [],
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
    async deleteItem(id: number) {
      await deleteFromQueue(id);
    },
  },
 });