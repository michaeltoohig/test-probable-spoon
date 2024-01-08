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
              <th>ID</th>
              <th>Container</th>
              <th>Area</th>
              <th>Location</th>
              <th>MC</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover" v-for="m in retries" :key="m.id">
              <td>{{ m.id }}</td>
              <td>{{ m.data.container.code }}</td>
              <td>{{ m.data.location.area.name }}</td>
              <td>{{ m.data.location.name }}</td>
              <td>{{ m.data.movement_code.code }}</td>
              <td>{{ printDate(m.data.date_reported) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useNotifyStore } from '../stores/notifyStore';
import { format, parseISO } from 'date-fns';
import { useRetryQueueStore } from '../stores/retryQueueStore';
import useContainers from '../composables/useContainers';
import useMovementCodes from '../composables/useMovementCodes';
import useLocations from '../composables/useLocations';
import { ArrowPathIcon, HandThumbUpIcon, InformationCircleIcon } from '@heroicons/vue/24/solid';
import { storeToRefs } from 'pinia';

const retryStore = useRetryQueueStore();

const queueStore = useRetryQueueStore();
const { count } = storeToRefs(queueStore);

const isSyncPendingRequests = ref(false);
const syncPendingRequests = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      command: 'SYNC',
    });
    isSyncPendingRequests.value = true;
    // TODO cancel timeout if success early
    setTimeout(async () => {
      await getRequests()
      isSyncPendingRequests.value = false;
    }, 2000);
  }
}

function arrayBufferToJson(arrayBuffer: ArrayBuffer) {
   const uint8Array = new Uint8Array(arrayBuffer);
   const decoder = new TextDecoder();
   const jsonString = decoder.decode(uint8Array);
   return JSON.parse(jsonString);
}

const { containers, promise: containerPromise } = useContainers();
const { movementCodes, promise: movementCodesPromise } = useMovementCodes();
const { locations, promise: locationsPromise } = useLocations();

interface Retry {
  id: number;
  data: any;
}

const retries = ref<Retry[]>([]);
const getRequests = async () => {
  await retryStore.getRequests();
  retries.value = retryStore.requests.map((r) => {
    const data = arrayBufferToJson(r.requestData.body);
    data.container = containers.value.find((c) => c.id === data.container);
    data.movement_code = movementCodes.value.find((mc) => mc.id === data.movement_code);
    data.location = locations.value.find((l) => l.id === data.location);
    return {
      id: r.id,
      data: data,
    }
  });
};

onMounted(async () => {
  await containerPromise;
  await movementCodesPromise;
  await locationsPromise;
  await getRequests()
});

const printDate = (value: string) => {
  return format(parseISO(value), 'eee, d LLL p');
};
</script>
