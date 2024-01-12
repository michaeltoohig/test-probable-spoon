<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import ReloadPrompt from './components/ReloadPrompt.vue';
import Notifications from './components/Notifications.vue';
import { onBeforeMount } from 'vue';
import { useAuthStore } from './stores/authStore';
import useOnlineStatus from './composables/useOnlineStatus';
import router from './router';
import { useRetryQueueStore } from './stores/retryQueueStore';
import useRetryQueueEventListener from './composables/useRetryQueueEventListener.ts';
const { isOnline } = useOnlineStatus();

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);

const queueStore = useRetryQueueStore();

// setup app side event listener for sw events
useRetryQueueEventListener();

onBeforeMount(async () => {
  console.info('[App] Checking auth onBeforeMount');
  if (isOnline && isLoggedIn.value) {
    try {
      await authStore.getCurrentUser();
    } catch (err: any) {
      await authStore.logout();
      authStore.error = 'Login Expired'; // TODO i18n
      router.push({ name: 'login' });
    }
  }

  await queueStore.init();
});
</script>

<template>
  <RouterView />
  <ReloadPrompt />
  <Notifications />
</template>
