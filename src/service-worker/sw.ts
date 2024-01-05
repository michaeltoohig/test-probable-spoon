/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin, Queue } from 'workbox-background-sync';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { RETRY_QUEUE } from '../constants';

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope

interface BackgroundSyncEvent extends ExtendableEvent {
  tag: string;
}

interface PeriodicBackgroundSyncEvent extends ExtendableEvent {
	tag: string;
}

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
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('index.html'),
  // { allowlist },
));


// registerRoute(
//   ({ request }) => request.mode === 'navigate',
//   () => {
//     const defaultBase = '/index.html';
//     return caches
//   }
// )

// Cache API Get requests
const matchDirectusApiCb = ({ url }) => {
  return (url.origin === 'http://localhost:8055' && (url.pathname === '/items/Containers' || url.pathname === '/items/Locations' || url.pathname === '/items/MovementCodes' || url.pathname === '/items/Movements')) 
};
registerRoute(
  matchDirectusApiCb,
  new StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      })
    ]
  })
)

// const bgSyncPlugin = new BackgroundSyncPlugin('sscQueue', {
//   maxRetentionTime: 60 * 24 * 3, // Retry for max of 3 days
// });

// // const matchPostMovementCb = ({ url, request }) => {
// //   console.log('r', request)
// //   // return url.origin === 'http://localhost:8055' && url.pathname === '/items/Movements'
// //   return true
// // }
// registerRoute(
//   /http:\/\/localhost:8055/,
//   new NetworkOnly({
//     plugins: [bgSyncPlugin]
//   }),
//   'POST',
// );

const sscQueuePosts = new Queue(RETRY_QUEUE, {
  maxRetentionTime: 3 * 24 * 60,
});
const pathsToQueue = ['/items/Movements'];

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'POST') {
    return;
  }
  
  if (!pathsToQueue.some((path: string) => event.request.url.includes(path))) {
    return;
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      await sscQueuePosts.pushRequest({ request: event.request });
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

const replayBgSyncQueue = () => {
  sscQueuePosts.replayRequests().then(() => {
    console.log("success replay");
  })
  .catch(() => {
    console.error("failed replay");
  })
};

self.addEventListener('message', (event) => {
  console.log('Received message', event.data);
  if (event.data.command === 'SYNC') {
    replayBgSyncQueue();
  }
});


// // example only
// const matchCb = ({ url }) => {
//   return url.origin === 'https://random-data-api.com';
// };

// registerRoute(
//   matchCb,
//   new CacheFirst({
//     plugins: [
//       new CacheableResponsePlugin({
//         statuses: [0, 200],
//       }),
//     ],
//   })
// );
