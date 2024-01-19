<script setup lang="ts">
import { useInstallPromptStore } from '../stores/installPromptStore';
// @ts-ignore
import installAppGraphic from '../assets/undraw_app_installation.svg?url';

const installPromptStore = useInstallPromptStore();
</script>

<template>
  <div class="card card-side bg-base-100 shadow-xl">
    <figure class="w-1/2"><img :src="installAppGraphic" class="max-h-[200px]" alt="install app graphic"/></figure>
    <div class="card-body ps-0">
      <h2 class="card-title">Install The App!</h2>
      <p>Install the app. Make it available right on your home screen.</p>
      <div class="card-actions justify-end">
        <button @click="installPromptStore.showInstallPrompt" class="btn btn-primary">Install Now</button>
      </div>
    </div>
  </div>
</template>