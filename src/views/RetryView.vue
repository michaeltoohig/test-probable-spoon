<template>
  <div class="grid gap-4">
    
    <div class="col-auto">
      <h2 class="text-2xl font-semibold leading-tight mb-0">Retry Queue</h2>
      <small class="text-lg font-light leading-tight mt-0">Container Movements Not Yet Saved</small>
    </div>

    <div class="col-auto">

      <div role="alert" class="alert shadow-lg">
        <HandThumbUpIcon v-if="count === 0" class="h-6 w-6"/>
        <ArrowPathIcon v-else-if="isSyncPendingRequests" class="h-6 w-6"/>
        <InformationCircleIcon v-else class="h-6 w-6"/>
        <div class="w-full">
          <span v-if="count === 0">All container movements are submitted.</span>
          <span v-else-if="!isSyncPendingRequests">{{ count }} container movements have not been submitted.</span>
          <div v-else>
            <span>Submitting container movements.</span>
            <progress class="progress w-full"></progress>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" :disabled="count === 0 || isSyncPendingRequests" @click="syncPendingRequests">Sync Now</button>
      </div>

      <div class="divider"></div>

      <div v-if="count > 0" class="overflow-x-auto">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th class="px-2 max-w-[22px]"></th>
              <th>Container</th>
              <th>Area</th>
              <th>Location</th>
              <th>MC</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover" v-for="retry in retries" :key="retry.id">
              <td class="px-2 max-w-[22px]">
                <label for="delete_retry_modal" @click="setSelected(retry)" class="btn btn-ghost btn-xs">
                  <TrashIcon class="h-4 w-4" />
                </label>
              </td>
              <td>{{ retry.data.container.code }}</td>
              <td>{{ retry.data.location.area.name }}</td>
              <td>{{ retry.data.location.name }}</td>
              <td>{{ retry.data.movement_code.code }}</td>
              <td>{{ printDate(retry.data.date_reported) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <input type="checkbox" id="delete_retry_modal" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Remove From Retry Queue?</h3>
        <ul class="py-4">
          <li class="font-semilight tracking-wider"><span class="font-bold tracking-normal me-1">Container:</span> {{ selected?.data.container.code }}</li>
          <li class="font-semilight tracking-wider"><span class="font-bold tracking-normal me-1">Area:</span> {{ selected?.data.location.area.name }}</li>
          <li class="font-semilight tracking-wider"><span class="font-bold tracking-normal me-1">Location:</span> {{ selected?.data.location.name }}</li>
          <li class="font-semilight tracking-wider"><span class="font-bold tracking-normal me-1">MC:</span> {{ selected?.data.movement_code.code }}</li>
        </ul>
        <div class="modal-action flex row justify-between">
          <label for="delete_retry_modal" class="btn btn-error" @click="deletedSelected">
            Delete
          </label>
          <label for="delete_retry_modal" class="btn">Close</label>
        </div>
      </div>
      <label class="modal-backdrop" for="delete_retry_modal">Close</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { format, parseISO } from 'date-fns';
import { useRetryQueueStore } from '../stores/retryQueueStore';
import useContainers from '../composables/useContainers';
import useMovementCodes from '../composables/useMovementCodes';
import useLocations from '../composables/useLocations';
import { ArrowPathIcon, HandThumbUpIcon, InformationCircleIcon } from '@heroicons/vue/24/solid';
import { storeToRefs } from 'pinia';
import { RETRY_MESSAGE_KEY } from '../constants';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { TrashIcon } from '@heroicons/vue/24/solid'
import { deleteFromQueue } from '../service-worker/retry-queue';

const retryStore = useRetryQueueStore();
const notifyStore = useNotifyStore();
const queueStore = useRetryQueueStore();
const { count } = storeToRefs(queueStore);

const selected = ref<RetryItem>();
const setSelected = (item: RetryItem) => {
  selected.value = item;
};
const deletedSelected = async () => {
  if (!selected.value) return;
  await deleteFromQueue(selected.value.id);
  notifyStore.notify('Container movement successfully removed from retry queue', NotificationType.Info);
  selected.value = undefined;
  await getRetryQueue();
}
const isSyncPendingRequests = ref(false);
const syncPendingRequests = async () => {
  console.log('[retry] Message replay queue')
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      notifyStore.notify('Failed to retry queue.', NotificationType.Error);
      return;
    }
    console.log('[retry] Got auth token')
    navigator.serviceWorker.controller.postMessage({
      type: RETRY_MESSAGE_KEY,
      payload: {
        authToken,
      },
    });
    isSyncPendingRequests.value = true; // this could be a value in the store, no? yes, then when we send the message from sw it also stops the loading progress bar because we have actual knowledge the requests are complete.
    // TODO remove; we now know how to send message from sw to client
    setTimeout(async () => {
      await getRetryQueue()
      isSyncPendingRequests.value = false;
    }, 2000);
  }
}

const { containers, promise: containerPromise } = useContainers();
const { movementCodes, promise: movementCodesPromise } = useMovementCodes();
const { locations, promise: locationsPromise } = useLocations();

interface RetryItem {
  id: number;
  data: any;
}

const retries = ref<RetryItem[]>([]);
const getRetryQueue = async () => {
  await retryStore.getItems();
  retries.value = retryStore.items.map((item) => {
    const data = item.payload;
    data.container = containers.value.find((c) => c.id === data.container);
    data.movement_code = movementCodes.value.find((mc) => mc.id === data.movement_code);
    data.location = locations.value.find((l) => l.id === data.location);
    return {
      id: item.id,
      data: data,
    }
  });
};

onMounted(async () => {
  await containerPromise;
  await movementCodesPromise;
  await locationsPromise;
  await getRetryQueue()
});

const printDate = (value: string) => {
  return format(parseISO(value), 'eee, d LLL p');
};
</script>
