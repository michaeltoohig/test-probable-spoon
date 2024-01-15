import { defineStore } from 'pinia';
import { addToQueue, deleteFromQueue, getQueue, initQueue } from '../service-worker/retry-queue';
import type { Movement } from '../services/directus';

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
    async addItem(payload: Movement) {
      await addToQueue(payload);
    },
    async deleteItem(id: number) {
      await deleteFromQueue(id);
    },
  },
 });