<template>
  <div class="btm-nav bg-default">
    <router-link :to="{ name: 'profile' }" tag="button" class="flex">
      <div v-if="avatar" class="w-5">
        <img alt="user profile image" :src="avatar" class="rounded-full" />
      </div>
      <UserIcon v-else class="h-5 w-5" />
      <span class="btm-nav-label">Profile</span>
    </router-link>
    <router-link :to="{ name: 'movements-new' }" tag="button" class="flex">
      <PlusCircleIcon class="h-12 w-12" />
    </router-link>
    <router-link :to="{ name: 'retry' }" tag="button" class="flex">
      <QueueListIcon class="h-5 w-5" />
      <span class="btm-nav-label">Queue</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { HomeIcon, UserIcon, QueueListIcon } from '@heroicons/vue/24/solid';
import { PlusCircleIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/authStore.ts';

const authStore = useAuthStore();
const { avatar } = storeToRefs(authStore);
</script>

