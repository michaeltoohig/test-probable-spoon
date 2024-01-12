/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin, Queue } from 'workbox-background-sync';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { RETRY_QUEUE, RETRY_MESSAGE_KEY } from '../constants';
import { compileScript } from 'vue/compiler-sfc';
import { addToQueue, deleteFromQueue, getQueue } from './retry-queue';
import { openDB } from 'idb';
import ts from 'typescript';

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;

// Listen for user request to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST || []);

// clean old assets
cleanupOutdatedCaches();

// let allowlist: undefined | RegExp[]
// if (import.meta.env.DEV)
//   allowlist = [/^\/$/]

// to allow work offline
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('index.html')
    // { allowlist },
  )
);

// Cache API GET requests
const matchDirectusApiCb = ({ url }) => {
  return (
    url.origin === 'http://localhost:8055' &&
    (url.pathname === '/items/Containers' ||
      url.pathname === '/items/Locations' ||
      url.pathname === '/items/MovementCodes' ||
      url.pathname === '/items/Movements')
  );
};
registerRoute(
  matchDirectusApiCb,
  new StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Add failed POST requests to queue.
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'POST') {
    return;
  }

  if (!event.request.url.includes('/items/Movements')) {
    return;
  }

  const bgSyncLogic = async (event: FetchEvent) => {
    try {
      const response = await fetch(event.request.clone());
      if (!response.ok) {
        throw new Error('Server error was not ok');
      }
      return response;
    } catch (error) {
      console.error('Failed to send data, adding to retry queue', error);
      await addToQueue(event.request.clone())
      throw error;
      // await retryQueue.pushRequest({ request: event.request.clone() });
    }
  };

  event.respondWith(bgSyncLogic(event));
});

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'REPLAY_QUEUE') {
    console.log('got retry message', event.data);
    const authToken = event.data.payload.authToken;
    replayQueue(authToken);
  }
});

const replayQueue = async (authToken: string) => {
  console.log('Replay queue begin');
  const queue = await getQueue();
  for (const item of queue) {
    try {
      console.log('retrying item', item);
      // TODO use server host envvar
      await fetch(`http://localhost:8055/items/Movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(item.payload)
      });
      console.log('Success retry; will delete', item.id);
      await deleteFromQueue(item.id);
      // TODO notify success
    } catch (error) {
      // Request fails, leave it in the queue
      console.error('Failed to replay item', error);
      // TODO notify failure
    }
  }
};