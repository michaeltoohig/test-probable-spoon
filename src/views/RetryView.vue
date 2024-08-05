<template>
  <div class="grid gap-4">

    <div class="col-auto">
      <h2 class="text-2xl font-semibold leading-tight mb-0">Retry Queue</h2>
      <small class="text-lg font-light leading-tight mt-0">Container Movements Not Yet Saved</small>
    </div>

    <div class="col-auto">
      <div v-if="isLoggedIn" role="alert" class="alert shadow-lg">
        <HandThumbUpIcon v-if="count === 0" class="h-6 w-6"/>
        <ArrowPathIcon v-else-if="isSyncing" class="h-6 w-6"/>
        <InformationCircleIcon v-else class="h-6 w-6"/>
        <div class="w-full">
          <span v-if="count === 0">All container movements are submitted.</span>
          <span v-else-if="!isSyncing">{{ count }} container movements have not been submitted.</span>
          <div v-else>
            <span>Submitting container movements.</span>
            <progress class="progress w-full"></progress>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" :disabled="count === 0 || isSyncing" @click="syncPendingRequests">Sync Now</button>
      </div>
      <div v-else role="alert" class="alert shadow-lg">
        <InformationCircleIcon class="h-6 w-6"/>
        <div class="w-full">
          <span>You must login again. Then, you can submit these container movements.</span>
        </div>
        <router-link :to="{ name: 'login' }" class="btn btn-sm btn-warning">Login</router-link>
      </div>

      <div class="divider"></div>

      <div v-if="count > 0" class="overflow-x-auto">
        <table class="hidden md:table">
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
        <ul class="timeline timeline-vertical md:hidden">
          <li v-for="retry in retries" :key="retry.id">
            <hr />
            <div class="timeline-start timeline-box shadow">
              <div class="flex justify-between items-center">
                <div class="badge badge-neutral">{{ retry.data.movement_code.code }}</div>
                <label for="delete_retry_modal" @click="setSelected(retry)" class="btn btn-error btn-outline btn-xs">
                  <TrashIcon class="h-4 w-4" />
                </label>
              </div>

              <div class="card-title">{{ retry.data.container.code }}</div>
              <div class="card-title">{{ retry.data.location.name }}</div>
              <div class="card-subtitle">{{ retry.data.location.area.name }}</div>
            </div>
            <div class="timeline-middle">
              <CheckCircleIcon class="w-5 h-5" />
            </div>
            <div class="timeline-end">
              {{ printDate(retry.data.date_reported) }}
            </div>
            <hr />
          </li>
        </ul>
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
          <label for="delete_retry_modal" class="btn btn-error" @click="deleteSelected">
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
import { onMounted, ref, watch } from 'vue';
import { format, parseISO } from 'date-fns';
import { useRetryQueueStore } from '../stores/retryQueueStore';
import useContainers from '../composables/useContainers';
import useMovementCodes from '../composables/useMovementCodes';
import useLocations from '../composables/useLocations';
import { ArrowPathIcon, CheckCircleIcon, HandThumbUpIcon } from '@heroicons/vue/24/solid';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import { storeToRefs } from 'pinia';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { TrashIcon } from '@heroicons/vue/24/solid'
import { deleteFromQueue } from '../service-worker/retry-queue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore);
const notifyStore = useNotifyStore();
const retryStore = useRetryQueueStore();
const { count, isSyncing } = storeToRefs(retryStore);

const selected = ref<RetryItem>();
const setSelected = (item: RetryItem) => {
  selected.value = item;
};
const deleteSelected = async () => {
  if (!selected.value) return;
  await deleteFromQueue(selected.value.id);
  notifyStore.notify('Container movement successfully removed from retry queue', NotificationType.Info);
  selected.value = undefined;
  await getRetryQueue();
}

const syncPendingRequests = async () => {
  console.log('[Retry] manually triggering retry queue');
  await retryStore.syncRetryQueue();
}

watch(isSyncing, async (newValue: boolean) => {
  if (!newValue) {
    console.log('[Retry] Updating queue UI');
    await getRetryQueue();
  }
});

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
