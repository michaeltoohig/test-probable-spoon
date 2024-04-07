<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import ReloadPrompt from './components/ReloadPrompt.vue';
import Notifications from './components/Notifications.vue';
import { onBeforeMount } from 'vue';
import { storedUser, useAuthStore } from './stores/authStore';
import useOnlineStatus from './composables/useOnlineStatus';
import router from './router';
import { useRetryQueueStore } from './stores/retryQueueStore';
import useRetryQueueEventListener from './composables/useRetryQueueEventListener.ts';
import useInstallPromptEventListeners from './composables/useInstallPromptEventListeners.ts';

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);

const queueStore = useRetryQueueStore();
queueStore.init();

// setup app event listener for sw events
useRetryQueueEventListener();
// setup event listeners for sw install prompt
useInstallPromptEventListeners();

// const { isOnline } = useOnlineStatus();

onBeforeMount(async () => {
  console.log('TODO [App] Checking preferred color theme');

  console.info('[App] Checking auth onBeforeMount');
  if (storedUser.value) {
    // previous login exists
    try {
      // update user
      await authStore.getMe();
    } catch (err) {
      console.log('[App] failed to get user', err);
    }
  } else {
    // none exists
  }
  
  // XXX old logic for reference until confirm new auth flow working
  // if (isOnline && isLoggedIn.value) {
  //   try {
  //     await authStore.getMe();
  //   } catch (err: any) {
  //     await authStore.logout();
  //     authStore.error = 'Login Expired'; // TODO i18n
  //     router.push({ name: 'login' });
  //   }
  // }
});
</script>

<template>
  <RouterView />
  <ReloadPrompt />
  <Notifications />
</template>
