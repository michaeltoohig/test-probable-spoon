<template>
  <div class="btm-nav bg-default">
    <router-link :to="{ name: 'retry' }">
      <div class="indicator">
        <QueueListIcon class="h-5 w-5" />
        <span v-show="count" class="badge badge-xs badge-primary indicator-item">{{ count }}</span>
      </div>
      <span class="btm-nav-label">Queue</span>
    </router-link>
    <router-link :to="{ name: 'movements-new' }">
      <PlusCircleIcon class="h-12 w-12" />
    </router-link>
    <router-link :to="{ name: 'profile' }">
      <div v-if="avatar">
        <img alt="user profile image" :src="avatar" class="rounded-full object-cover w-5 h-5" />
      </div>
      <UserIcon v-else class="h-5 w-5" />
      <span class="btm-nav-label">Profile</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { UserIcon, QueueListIcon } from '@heroicons/vue/24/solid';
import { PlusCircleIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/authStore.ts';
import { useRetryQueueStore } from '../stores/retryQueueStore';
// import { onMounted, onUnmounted, ref } from 'vue';

const authStore = useAuthStore();
const { avatar } = storeToRefs(authStore);

const retryStore = useRetryQueueStore();
const { count } = storeToRefs(retryStore);

// XXX An ugly interval instead of watch
// const timer = ref();
// onMounted(async () => {
//   timer.value = setInterval(async () => {
//     await retryStore.getItems();
//   }, 1000)
// });

// onUnmounted(() => {
//   clearInterval(timer.value);
// });
</script>

