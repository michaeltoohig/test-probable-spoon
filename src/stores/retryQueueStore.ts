import { defineStore } from 'pinia';
import { openDB } from 'idb';
import { RETRY_QUEUE } from '../constants';

interface State {
  count: number;
};

export const useRetryQueueStore = defineStore('queue', {
  state: (): State => ({
    count: 0,
  }),
  actions: {
    setCount(count: number) {
      this.count = count;
    },
    async updateCount() {
      const db = await openDB('requests');
      const count = await db.transaction(RETRY_QUEUE).objectStore(RETRY_QUEUE).count();
      console.log("found count", count);
      this.count = count;
    },
  },
 });