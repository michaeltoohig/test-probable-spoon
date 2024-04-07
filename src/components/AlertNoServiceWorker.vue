<script setup lang="ts">
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const hasSW = ref(true);
if (!('serviceWorker' in navigator)) {
  hasSW.value = false;
}
</script>

<template>
  <div v-if="!hasSW" role="alert" class="alert alert-warning mb-2">
    <ExclamationCircleIcon class="w-6 h-6" />
    <div>
      <h3 class="font-bold">This browser is not recommended</h3>
      <div class="text-xs">Offline queue and other features won't work without service workers. This browser does not have them or has them disabled.</div>
    </div>
  </div>
</template>
