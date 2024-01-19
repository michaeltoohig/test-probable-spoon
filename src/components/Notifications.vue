<template>
  <div class="toast toast-center toast-top z-50">
    <div
      v-for="(notification, i) in notifications"
      :key="i"
      :class="notification.type"
      class="shadow-lg flex row justify-start items-center overflow-auto whitespace-normal"
    >
      <button
        @click.prevent="notifyStore.removeNotification(notification)"
        type="button"
        class="-mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <XMarkIcon class="w-6 h-6" />
      </button>
      <span class="text-wrap min-w-[260px]">&nbsp;{{ notification.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { useNotifyStore } from '../stores/notifyStore';

const notifyStore = useNotifyStore();
const { notifications } = storeToRefs(notifyStore);
</script>
