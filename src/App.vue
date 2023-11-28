<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import ReloadPrompt from './components/ReloadPrompt.vue';
import { onBeforeMount } from 'vue';
import { useAuthStore } from './stores/authStore';
import router from './router';

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);

console.log('tt')

onBeforeMount(async () => {
  if (isLoggedIn.value) {
    console.log('t')
    try {
      await authStore.getCurrentUser();
    } catch(err: any) {
      await authStore.logout();
      authStore.error = 'Login Expired'; // TODO i18n
      router.push({ name: 'login' })
    }
  }
});
</script>

<template>
  <RouterView />
  <ReloadPrompt />
</template>
