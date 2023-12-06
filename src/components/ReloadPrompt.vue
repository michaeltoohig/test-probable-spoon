<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { pwaInfo } from 'virtual:pwa-info';

// eslint-disable-next-line no-console
// console.log('pwaInfo', pwaInfo);

// replaced dyanmicaly
const reloadSW: any = '__RELOAD_SW__';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisterError(error) {
    console.log('sw err', error);
  },
  onRegisteredSW(swUrl, r) {
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
  <div class="fixed z-[100] bottom-0 left-0 p-4 w-full">
    <div v-if="offlineReady || needRefresh" class="pwa-toast alert" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span v-if="offlineReady"> App ready to work offline </span>
      <span v-else> New content available, click <i>reload</i> to update. </span>
      <div>
        <button class="btn btn-sm" @click="close">Ignore For Now</button>
        <button class="btn btn-sm btn-primary" v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>
