# TODO

## MISC

- [ ] handle missing IDBDatabase (retry queue database) at app start up or gracefully ignore error

## Retry Queue

Why don't we just rebuild the request and have a custom queue and give up on this bullshit Queue thing?

https://stackoverflow.com/questions/60117924/workbox-background-sync-doesnt-run-if-setting-onsync-callback

- [ ] UI

  - [ ] badge with watch to changes
  - [x] count
  - [ ] notify added to queue instead of failed request

- [ ] delete request
- [ ] retry one request

### Retry Answer To Consider

To achieve the functionality you've described, we'll need to implement several pieces of logic within the service worker. We'll use Workbox's Queue class to manage the background sync queue and TypeScript for type safety. Below is the code with the necessary additions and modifications:

```typescript
import { Queue } from 'workbox-background-sync';

interface StoredRequest {
  url: string;
  headers: HeadersInit;
  body: any;
  method: string;
}

// Define a type for the message event data
interface MessageEventData {
  command: string;
}

self.addEventListener('message', async (event: ExtendableMessageEvent) => {
  console.log('Received message', event.data);
  const eventData = event.data as MessageEventData;
  if (eventData.command === 'SYNC') {
    await replayBgSyncQueue();
  }
});

const replayBgSyncQueue = async () => {
  const queue = retryQueue as Queue<StoredRequest>;
  let entry;
  while ((entry = await queue.shiftRequest())) {
    try {
      await fetch(entry.request);
      console.log(`Request for ${entry.request.url} has been replayed successfully`);
    } catch (error) {
      console.error(
        `Request for ${entry.request.url} failed to replay, putting it back in the queue`,
        error
      );
      await queue.unshiftRequest(entry);
    }
  }
};

const refreshToken = async (): Promise<string | null> => {
  // TODO: Implement token refresh logic here
  // This is a placeholder for the actual token refresh logic
  return Promise.resolve('new_token');
};

// Setup retry queue for POST requests
const retryQueue = new Queue<StoredRequest>('retry-queue', {
  maxRetentionTime: 3 * 24 * 60, // 3 days in minutes
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
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
  },
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'POST' || !event.request.url.includes('/items/Movements')) {
    return;
  }

  const handlePostRequest = async (event: FetchEvent) => {
    try {
      const response = await fetch(event.request.clone());
      if (!response.ok) {
        throw new Error('Server response was not ok');
      }
      return response;
    } catch (error) {
      console.error('Failed to send data, adding to retryQueue', error);
      await retryQueue.pushRequest({ request: event.request.clone() });
      return new Response('', { status: 503 });
    }
  };

  event.respondWith(handlePostRequest(event));
});
```

Please note that the `refreshToken` function is a placeholder and should be implemented with the actual logic to obtain a new token. The `onSync` callback in the `Queue` options is used to handle the retry logic when the background sync event occurs. The `fetch` event listener intercepts POST requests to '/items/Movements' and uses the `handlePostRequest` function to manage the request and potential retries.

This code assumes that the service worker has access to the necessary APIs to manage authentication tokens, which may not be the case in a real-world scenario. Typically, service workers do not have direct access to `localStorage` and would need to communicate with the client pages to manage authentication tokens. If this is the case, you would need to implement a message-passing mechanism between the service worker and the client pages to handle token refreshes.
