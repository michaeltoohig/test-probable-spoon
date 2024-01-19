<script setup lang="ts">
import useOnlineStatus from '../composables/useOnlineStatus';
import { SignalSlashIcon } from '@heroicons/vue/24/solid';

const { isOnline } = useOnlineStatus();
</script>

<template>
  <div v-if="!isOnline" class="navbar bg-error min-h-0 h-6">
    <div class="navbar-start"></div>
    <div class="navbar-center">
      <SignalSlashIcon class="w-5 h-5 text-white me-1" />
      <span class="text-white font-bold">You Are Offline</span>
    </div>
    <div class="navbar-end"></div>
  </div>
</template>
