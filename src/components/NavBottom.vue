<template>
  <div class="btm-nav bg-default">
    <button class="flex" @click="goTo('profile')">
      <UserIcon class="h-5 w-5 me-1"/>
      <span class="btm-nav-label">Profile</span>
    </button>
    <button class="flex" @click="goTo('movements-new')">
      <PlusCircleIcon class="h-12 w-12"/>      
    </button>
    <button class="flex" @click="goTo('retry')">
      <QueueListIcon class="h-5 w-5 me-1"/>
      <span class="btm-nav-label">Queue</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, UserIcon, QueueListIcon } from '@heroicons/vue/24/solid';
import { PlusCircleIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
const router = useRouter();

const goTo = (name: string) => {
  router.push({ name });
};
</script>