<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import ReloadPrompt from './components/ReloadPrompt.vue';
import Notifications from './components/Notifications.vue';
import { onBeforeMount } from 'vue';
import { useAuthStore } from './stores/authStore';
import useOnlineStatus from './composables/useOnlineStatus';
import router from './router';

const { isOnline } = useOnlineStatus();

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);

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
});
</script>

<template>
  <RouterView />
  <ReloadPrompt />
  <Notifications />
</template>
