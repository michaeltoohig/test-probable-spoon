<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const avatarSrc = computed(() => {
  console.log(user.value);
  if (user.value?.avatar) {
    return `${import.meta.env.VITE_DIRECTUS_URL}/assets/${user.value.avatar}`;
  }
  return 'https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg';
});
</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </div>
        <ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-primary rounded-box w-52">
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/about">About</RouterLink></li>
          <li><RouterLink to="/theme-preview">Theme Preview</RouterLink></li>
          <li><RouterLink to="/movements/new">Add Container Movement</RouterLink></li>
        </ul>
      </div>
      <a class="btn btn-ghost text-xl">daisyUI</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
        <li><RouterLink to="/theme-preview">Theme Preview</RouterLink></li>
        <li><RouterLink to="/movements/new">Add Container Movement</RouterLink></li>
      </ul>
    </div>
    <div class="navbar-end">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="Tailwind CSS Navbar component" :src="avatarSrc" />
          </div>
        </div>
        <ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-primary rounded-box w-52">
          <li>
            <a class="justify-between">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><a>Settings</a></li>
          <li><RouterLink :to="{ name: 'logout' }">Logout</RouterLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>