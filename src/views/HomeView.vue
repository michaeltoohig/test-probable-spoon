<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import containerMovementImgSrc from '../assets/container-movement.png?url';

const notifyStore = useNotifyStore();
notifyStore.notify("Hello Home Page!!!", NotificationType.Info)

function getSpecialUrl() {
  fetch('https://random-data-api.com/api/users/random_user')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) =>
      console.log('There was a problem with the fetch operation: ' + error.message)
    );
}

const router = useRouter();
const goToNewMovement = () => {
  router.push({ name: 'movements-new' });
};
</script>

<template>
  <div class="flex flex-col justify-start items-center">
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
