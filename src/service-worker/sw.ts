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
import { useRetryQueueStore } from '../stores/retryQueueStore';

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

// Retry Failed POST requests
// const bgSyncPlugin = new BackgroundSyncPlugin(RETRY_QUEUE, {
//   maxRetentionTime: 60 * 24 * 3, // Retry for max of 3 days
// });
// bgSyncPlugin

// const statusPlugin = {
//   fetchDidSucceed: ({ response }) => {
//     if (response.status >= 500) {
//       throw new Error('Server error');
//     }
//     return response;
//   },
// };

// registerRoute(
//   '/items/Movements',
//   new NetworkOnly({
//     plugins: [
//       statusPlugin,
//       bgSyncPlugin,
//     ]
//   })
// )

const retryQueue = new Queue(RETRY_QUEUE, {
  maxRetentionTime: 3 * 24 * 60,
});

setInterval(() => {
  console.log('test msg');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({
      type: "TEST",
      payload: {
        count: 777,
      },
    }));
  });
}, 2000);

const retryEndpoints = ['/items/Movements'];
self.addEventListener('fetch', (event) => {


  if (event.request.method !== 'POST') {
    return;
  }
  
  if (!retryEndpoints.some((path: string) => event.request.url.includes(path))) {
    return;
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      if (response.status == 401) {
        console.log('[retry] auth error')
        const newToken = refreshToken();
        const clonedRequest = event.request.clone();
        clonedRequest.headers.set('Authorization', `Bearer ${newToken}`);

        const response = await fetch(clonedRequest);
        if (response.status >= 500) {
          throw new Error('Server error.');
        }
        return response;
      }
      return response;
    } catch (error) {
      const newRequest = new Request(event.request, {
        headers: {
          ...event.request.headers,
          'Authorization': 'Bearer force-auth-fail',
        },
      });
      // const clonedRequest = event.request.clone();
      // clonedRequest.headers.set('Authorization', 'Bearer force-auth-fail');
      await retryQueue.pushRequest({ request: newRequest });
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

const refreshToken = () => {
  // Get the current auth token from local storage; requires user to login recently to work.
  const storedToken = localStorage.getItem('auth_token');
  return storedToken;
};

const replayBgSyncQueue = () => {
  retryQueue.
  retryQueue.replayRequests().then(() => {
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
