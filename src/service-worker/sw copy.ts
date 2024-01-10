/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { Queue } from 'workbox-background-sync';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { RETRY_QUEUE, RETRY_MESSAGE_KEY } from '../constants';

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

// Setup retry queue for POST requests
const retryQueue = new Queue(RETRY_QUEUE, {
  maxRetentionTime: 3 * 24 * 60,
});

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
      // await retryQueue.pushRequest({
      //   request: event.request.clone(),
      //   metadata: {
      //     url: event.request.url,
      //     method: event.request.method,
      //     headers: event.request.headers,
      //   },
      // });
    }
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
  };

  event.respondWith(bgSyncLogic(event));
});

const refreshToken = () => {
  // Get the current auth token from local storage; requires user to login recently to work.
  const storedToken = localStorage.getItem('auth_token');
  return storedToken;
};

const fetchRequest = async (requestData: any) => {
  return await fetch(requestData.url, {
    method: requestData.method,
    headers: requestData.headers,
  });
};

const replayBgSyncQueue = async () => {
  const requestData = await retryQueue.popRequest();
  if (!requestData) {
    console.log('No requests in queue');
    break;
  }

  try {
    // const response = await fetch(requestData.url, {
    //   method: requestData.method,
    //   headers: requestData.headers,
    // });
    response = await fetchRequest(requestData);
    
    if (response.status === 401) {
      const newToken = refreshToken();
      requestData.heaaders.set('Authorization', `Bearer ${newToken}`);
      response = await fetchRequest(requestData);

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


interface MessageEventData {
  command: string;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('Received message', event.data);
  const eventData = event.data as MessageEventData;
  if (eventData.command === 'SYNC') {
    await replayBgSyncQueue();
  }
});
