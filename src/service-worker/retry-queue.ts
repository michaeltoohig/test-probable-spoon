import { openDB } from 'idb';
import { RETRY_QUEUE } from '../constants';

export const initQueue = async () => {
  console.log('[Queue] Init');
  await openDB(RETRY_QUEUE, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('queue')) {
        console.log('[Queue] Creating store')
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    },
  });
};

export const addToQueue = async (request: Request) => {
  const payload = await request.json();
  console.log('[Queue] Add one', payload);
  const db = await openDB(RETRY_QUEUE, 1);
  const tx = db.transaction('queue', 'readwrite');
  const id = Date.now()
  await tx.store.add({
    'id': id,
    payload,
  });
  await tx.done;
};

export const deleteFromQueue = async (id: number) => {
  console.log('[Queue] Delete one', id)
  const db = await openDB(RETRY_QUEUE, 1);
  const tx = db.transaction('queue', 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export const getQueue = async () => {
  console.log('[Queue] Get all')
  const db = await openDB(RETRY_QUEUE, 1);
  const tx = db.transaction('queue', 'readonly');
  const queue = await tx.store.getAll();
  await tx.done;
  return queue;
};
