<template>
  <div class="logout w-full h-screen flex flex-col items-center justify-center">
    <h2 class="font-light text-xl mb-3">Logging Out</h2>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { onMounted } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.logout();
  } finally {
    router.push({ name: 'login' });
  }
})
</script>