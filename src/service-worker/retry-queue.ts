import { openDB } from 'idb';

export const initQueue = async () => {
  await openDB('ssc-retry-queue', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    },
  });
};

export const addToQueue = async (request: Request) => {
  const payload = await request.json();
  const db = await openDB('ssc-retry-queue', 1);
  const tx = db.transaction('queue', 'readwrite');
  const id = Date.now()
  await tx.store.add({
    'id': id,
    payload,
  });
  await tx.done;
};

export const deleteFromQueue = async (id: number) => {
  const db = await openDB('ssc-retry-queue', 1);
  const tx = db.transaction('queue', 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export const getQueue = async () => {
  const db = await openDB('ssc-retry-queue', 1);
  const tx = db.transaction('queue', 'readonly');
  const queue = await tx.store.getAll();
  await tx.done;
  return queue;
};
