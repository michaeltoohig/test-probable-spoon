<script setup lang="ts">
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import { HandThumbUpIcon } from '@heroicons/vue/24/solid';

interface OnRegisteredSWParams {
 swUrl: string;
 r: ServiceWorkerRegistration | null;
}

// replaced dyanmicaly
const reloadSW: any = '__RELOAD_SW__';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisterError(error: Error) {
    console.log('sw err', error);
  },
  onRegisteredSW({ swUrl, r }: OnRegisteredSWParams) {
    // eslint-disable-next-line no-console
    console.log(`Service Worker at: ${swUrl}`, reloadSW);
    if (reloadSW === 'true') {
      r &&
        setInterval(async () => {
          // eslint-disable-next-line no-console
          console.log('Checking for sw update');
          await r.update();
        }, 20000 /* 20s for testing purposes */);
    } else {
      // eslint-disable-next-line no-console
      console.log(`SW Registered: ${r}`, r);
    }
  },
});

async function close() {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>

<template>
  <div class="fixed z-[100] bottom-16 left-0 p-4 w-full">
    <div v-if="offlineReady || needRefresh" class="pwa-toast alert" role="alert">
      <HandThumbUpIcon v-if="offlineReady" class="shrink-0 w-6 h-6" />
      <InformationCircleIcon v-else class="shrink-0 w-6 h-6" />
      <div v-if="offlineReady">
        <h3 class="font-bold">Offline Ready</h3>
        <span class="font-normal">This app can work while offline so you don't have to worry about network to do you work.</span>
      </div>
      <span v-if="offlineReady"></span>
      <span v-else> New content available, click <i>reload</i> to update. </span>
      <div>
        <button class="btn btn-sm" @click="close">Okay</button>
        <button class="btn btn-sm btn-primary" v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>
