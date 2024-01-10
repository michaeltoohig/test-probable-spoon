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

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;

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



// https://stackoverflow.com/questions/67497413/communicating-a-successful-workbox-background-sync-replay-to-open-clients
/*
async function postSuccessMessage(response) {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    // Customize this message format as you see fit.
    client.postMessage({
      type: 'REPLAY_SUCCESS',
      url: response.url,
    });
  }
}

async function customReplay() {
  let entry;
  while ((entry = await this.shiftRequest())) {
    try {
      const response = await fetch(entry.request.clone());
      // Optional: check response.ok and throw if it's false if you
      // want to treat HTTP 4xx and 5xx responses as retriable errors.

      postSuccessMessage(response);
    } catch (error) {
      await this.unshiftRequest(entry);

      // Throwing an error tells the Background Sync API
      // that a retry is needed.
      throw new Error('Replaying failed.');
    }
  }
}

const bgSync = new BackgroundSyncPlugin('api-queue', {
  onSync: customReplay,
});

// Now add bgSync to a Strategy that's associated with
// a route you want to retry:
registerRoute(
  ({url}) => url.pathname === '/api_endpoint',
  new NetworkOnly({plugins: [bgSync]}),
  'POST'
);
*/


// Seems like to call onSync we need to use the official message trigger 'workbox-background-sync:sync' or something
// We can not use `replayRequests` as that always uses their own logic


const retryEndpoints = ['/items/Movements'];
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'POST') {
    return;
  }

  if (!retryEndpoints.some((path: string) => event.request.url.includes(path))) {
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
      await retryQueue.pushRequest({ request: event.request.clone() });
      return new Response('', { status: 503 });
    }
  };

  event.respondWith(bgSyncLogic(event));
});

const retryQueue = new Queue(RETRY_QUEUE, {
  maxRetentionTime: 3 * 24 * 60,
  onSync: async ({ queue }) => {
    console.log('in onSync');
    let entry;
    while (entry = await queue.shiftRequest()) {
      try {
        const response = await fetch(entry.request.clone());
        if (!response.ok) {
          throw new Error('Failed to replay request');
        }
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            const newHeaders = new Headers(entry.request.headers);
            newHeaders.set('Authorization', `Bearer ${newToken}`);
            const newRequest = new Request(entry.request.url, {
              method: entry.request.method,
              headers: newHeaders,
              body: entry.request.body,
              mode: 'same-origin', // Adjust if needed
            });
            await fetch(newRequest);
          } else {
            throw new Error('Failed to refresh token');
          }
        }
      } catch (error) {
        console.error(`Failed to replay request: ${entry.request.url}`, error);
        await queue.unshiftRequest(entry);
      }
    }
  }
});

interface MessageEventData {
  command: string;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('Received message', event.data);
  const eventData = event.data as MessageEventData;
  if (eventData.command === 'SYNC') {
    replayBgSyncQueue();
  }
});
// test

const replayBgSyncQueue = async () => {
  console.log('replay start');
  let entry;
  while (entry = await retryQueue.shiftRequest()) {
    console.log('Got entry', entry);
    try {
      await fetch(entry.request.clone());
    } catch (error) {
      await retryQueue.unshiftRequest(entry);
    }
  }
  // retryQueue
  //   .replayRequests()
  //   .then(() => {
  //     console.log('success replay');
  //   })
  //   .catch(() => {
  //     console.error('failed replay');
  //   });
};

// const retryEndpoints = ['/items/Movements'];
// self.addEventListener('fetch', (event: FetchEvent) => {
//   if (event.request.method !== 'POST') {
//     return;
//   }

//   if (!retryEndpoints.some((path: string) => event.request.url.includes(path))) {
//     return;
//   }

//   const bgSyncLogic = async (event: FetchEvent) => {
//     try {
//       const response = await fetch(event.request.clone());
//       if (!response.ok) {
//         throw new Error('Server error was not ok');
//       }
//       return response;
//     } catch (error) {
//       console.error('Failed to send data, adding to retry queue', error);
//       await retryQueue.pushRequest({ request: event.request.clone() });
//       return new Response('', { status: 503 });
      // await retryQueue.pushRequest({
      //   request: event.request.clone(),
      //   metadata: {
      //     url: event.request.url,
      //     method: event.request.method,
      //     headers: event.request.headers,
      //   },
      // });
//    }
    // try {
    //   const response = await fetch(event.request.clone());
    //   if (response.status == 401) {
    //     console.log('[retry] auth error');
    //     const newToken = refreshToken();
    //     const clonedRequest = event.request.clone();
    //     clonedRequest.headers.set('Authorization', `Bearer ${newToken}`);

    //     const response = await fetch(clonedRequest);
    //     if (response.status >= 500) {
    //       throw new Error('Server error.');
    //     }
    //     return response;
    //   }
    //   return response;
    // } catch (error) {
    //   const newRequest = new Request(event.request, {
    //     headers: {
    //       ...event.request.headers,
    //       Authorization: 'Bearer force-auth-fail',
    //     },
    //   });
    //   // const clonedRequest = event.request.clone();
    //   // clonedRequest.headers.set('Authorization', 'Bearer force-auth-fail');
    //   await retryQueue.pushRequest({ request: newRequest });
    //   return error;
    // }
//   };

//   event.respondWith(bgSyncLogic(event));
// });

const refreshToken = () => {
  // Get the current auth token from local storage; requires user to login recently to work.
  const storedToken = localStorage.getItem('auth_token');
  return storedToken;
};

// interface StoredRequest {
//   url: string;
//   headers: HeadersInit;
//   body: any;
//   method: string;
// }

// interface MessageEventData {
//   command: string;
// }

// self.addEventListener('message', (event: ExtendableMessageEvent) => {
//   console.log('Received message', event.data);
//   const eventData = event.data as MessageEventData;
//   if (eventData.command === 'SYNC') {
//     replayBgSyncQueue();
//   }
// });

// const replayBgSyncQueue = async () => {
//   retryQueue
//     .replayRequests()
//     .then(() => {
//       console.log('success replay');
//     })
//     .catch(() => {
//       console.error('failed replay');
//     });
  // const queue = retryQueue as Queue<StoredRequest>;
  // let entry;
  // while (entry = await queue.shiftRequest()) {
  //   try {
  //     await fetch(entry.request);
  //     console.log(`Request for ${entry.request.url} has been replayed successfully`);
  //   } catch (error) {
  //     console.error(`Request for ${entry.request.url} failed to replay, putting it back in the queue`, error);
  //     await queue.unshiftRequest(entry);
  //   }
  // }
// };

// const messageClientsRetryResults = (success: number = 0, failure: number = 0) => {
//   self.clients.matchAll().then((clients) => {
//     clients.forEach((client) =>
//       client.postMessage({
//         type: RETRY_MESSAGE_KEY,
//         success: success,
//         failure: failure,
//       })
//     );
//   });
// };
