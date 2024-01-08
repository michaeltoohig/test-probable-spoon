<script setup lang="ts">
import { useRouter } from 'vue-router';
import containerMovementImgSrc from '../assets/container-movement.png?url';
import { useNotifyStore } from '../stores/notifyStore';

const notifyStore = useNotifyStore();
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
