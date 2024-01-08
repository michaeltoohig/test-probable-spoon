import { defineStore } from 'pinia';
import { openDB } from 'idb';
// import { RETRY_QUEUE } from '../constants';

interface RetryRequest {
  id: number;
  data: any;
}

interface State {
  requests: RetryRequest[];
};

export const useRetryQueueStore = defineStore('queue', {
  state: (): State => ({
    requests: [],
  }),
  getters: {
    count(): number {
      return this.requests.length;
    },
  },
  actions: {
    async getRequests() {
      const db = await openDB('workbox-background-sync');
      const items = await db.transaction('requests').objectStore('requests').getAll()
      this.requests = items;
    },
  },
 });