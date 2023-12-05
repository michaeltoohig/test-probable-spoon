// import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
// import { clientsClaim } from 'workbox-core'
// import { NavigationRoute, registerRoute } from 'workbox-routing'
// import { CacheFirst } from 'workbox-strategies';
// import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// declare let self: ServiceWorkerGlobalScope

// console.log('claims 234')

// // self.__WB_MANIFEST is default injection point
// precacheAndRoute(self.__WB_MANIFEST)

// // clean old assets
// cleanupOutdatedCaches()

// let allowlist: undefined | RegExp[]
// if (import.meta.env.DEV)
//   allowlist = [/^\/$/]

// // to allow work offline
// registerRoute(new NavigationRoute(
//   createHandlerBoundToURL('index.html'),
//   { allowlist },
// ))

// self.skipWaiting()
// clientsClaim()

// const matchCb = ({ url }) => {
//   return url.origin === 'https://random-data-api.com';
// };

// registerRoute(matchCb, new CacheFirst({
//   plugins: [
//     new CacheableResponsePlugin({
//       statuses: [0, 200]
//     })
//   ]
// }));

/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

console.log('prompt345671');

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

const matchCb = ({ url }) => {
  console.log('ur', url);
  return url.origin === 'https://random-data-api.com';
};

registerRoute(
  matchCb,
  new CacheFirst({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
