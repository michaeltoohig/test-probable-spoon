<script setup lang="ts">
import { useRouter } from 'vue-router';
import containerMovementImgSrc from '../assets/container-movement.png?url';
import { useNotifyStore } from '../stores/notifyStore';

import { useRetryQueueStore } from '../stores/retryQueueStore';
import { storeToRefs } from 'pinia';
import { onBeforeMount, onBeforeUnmount } from 'vue';

const notifyStore = useNotifyStore();

const queueStore = useRetryQueueStore();
const { count } = storeToRefs(queueStore);

const syncPendingRequests = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      command: 'SYNC',
    });
    // may need a delay
    await queueStore.updateCount();
  }
}


// function getSpecialUrl() {
//   fetch('https://random-data-api.com/api/users/random_user')
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => console.log(data))
//     .catch((error) =>
//       console.log('There was a problem with the fetch operation: ' + error.message)
//     );
// }

// const test = (event) => {
//   console.log('got from sw', test);
// };

// onBeforeMount(() => {
//   window.addEventListener('message', test);
// });

// onBeforeUnmount(() => {
//   window.removeEventListener('message', test);
// });

const router = useRouter();
const goToNewMovement = () => {
  router.push({ name: 'movements-new' });
};
</script>

<template>
  <div class="flex flex-col justify-start items-center">
    <div class="card card-w-md bg-base-100 shadow-xl mb-3">
      count {{ count }}
      <button class="btn btn-primary" @click="syncPendingRequests">Sync</button>
    </div>
    <div
      @click="goToNewMovement"
      class="cursor-pointer card max-w-md bg-base-100 shadow-xl image-full mb-3"
    >
      <figure><img :src="containerMovementImgSrc" alt="Record New Container Movement" /></figure>
      <div class="card-body w-full h-full flex justify-center align-center">
        <h2 class="card-title text-3xl text-center self-center">
          Record New<br />Container Movement
        </h2>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
