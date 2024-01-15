/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import type { URL } from 'url';
import { RETRY_MESSAGE_KEY } from '../constants';
import { addToQueue, deleteFromQueue, getQueue } from './retry-queue';

// @ts-expect-error
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;

// Listen for user request to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// self.__WB_MANIFEST is default injection point
// self.__WB_MANIFEST.push({url: 'favicon.svg'});
// self.__WB_MANIFEST.push({url: 'default-avatar.png'});
console.log('precache', self.__WB_MANIFEST);
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
const matchDirectusApiCb = ({ url }: { url: URL }) => {
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
      const clonedrequest = event.request.clone();
      const payload = await clonedrequest.json();
      await addToQueue(payload);
      throw error;
    }
  };

  event.respondWith(bgSyncLogic(event));
});

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('SW received message', event.data);
  if (event.data && event.data.type === RETRY_MESSAGE_KEY) {
    const authToken = event.data.payload.authToken;
    replayQueue(authToken);
  }
});

const replayQueue = async (authToken: string) => {
  console.log('Replay queue begin');
  let successCount = 0;
  let failureCount = 0;
  const queue = await getQueue();
  for (const item of queue) {
    try {
      console.log('retrying item', item);
      // TODO use server host envvar
      await fetch(`${DIRECTUS_URL}/items/Movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(item.payload)
      });
      console.log('Success retry; will delete', item.id);
      await deleteFromQueue(item.id);
      successCount += 1;
    } catch (error) {
      // Request fails, leave it in the queue
      console.error('Failed to replay item', error);
      failureCount += 1;
    }
  }
  console.log('end replayQueue');
  messageClientsRetryResults(successCount, failureCount);
};

const messageClientsRetryResults = (success: number = 0, failure: number = 0) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) =>
      client.postMessage({
        type: RETRY_MESSAGE_KEY,
        success: success,
        failure: failure,
      })
    );
  });
};