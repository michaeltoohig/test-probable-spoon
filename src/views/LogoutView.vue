<template>
  <div class="logout">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
authStore.logout();

const router = useRouter();
router.push({ name: 'login' });
</script>

<style scoped lang="scss"></style>
