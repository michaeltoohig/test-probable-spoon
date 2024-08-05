<script setup lang="ts">
import lorry from '/lorry.svg?url';
import { useRouter } from 'vue-router';
// @ts-ignore
import containerMovementImgSrc from '../assets/container-movement.png?url';
import { storeToRefs } from 'pinia';
import { useInstallPromptStore } from '../stores/installPromptStore';
import CardInstallApp from '../components/CardInstallApp.vue';

const router = useRouter();
const goToNewMovement = () => {
  router.push({ name: 'movements-new' });
};

const installPromptStore = useInstallPromptStore();
const { installPromptAvailable } = storeToRefs(installPromptStore);
</script>

<template>
  <div class="flex flex-col justify-start items-center">
    <div class="hidden flex-col items-center justify-center mb-3">
      <img :src="lorry" class="w-16 h-16 -mt-6 -mb-4 mx-auto" />
      <span class="text-3xl font-bold">Drivers</span>
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

    <CardInstallApp class="max-w-md mb-3" v-if="installPromptAvailable" />
  </div>
</template>

<style scoped></style>
