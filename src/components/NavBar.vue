<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useThemeManager } from '@/plugins/themeManager';

const $theme = useThemeManager();
const darkToggle = ref<HTMLInputElement>();
const isDarkMode = computed(() => {
  let { dark, light } = $theme.getDefaults();
  if ($theme.get() === dark) return 0;
  else if ($theme.get() === light) return 1;
  else {
    if (darkToggle.value) darkToggle.value.indeterminate = true;
  }
  return 2;
});

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </div>
        <ul
          class="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-primary rounded-box w-52"
        >
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/about">About</RouterLink></li>
          <li><RouterLink to="/theme-preview">Theme Preview</RouterLink></li>
          <li><RouterLink to="/movements/new">Add Container Movement</RouterLink></li>
        </ul>
      </div>
      <RouterLink to="/" class="btn btn-ghost text-xl">SSC</RouterLink>
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
      <label class="cursor-pointer grid place-items-center me-1">
        <input
          type="checkbox"
          @change="$theme.toggleDark"
          class="toggle theme-controller bg-base-content row-start-1 col-start-1 col-span-2"
        />
        <svg
          class="col-start-1 row-start-1 stroke-base-100 fill-base-100"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <path
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
        <svg
          class="col-start-2 row-start-1 stroke-base-100 fill-base-100"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </label>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="Tailwind CSS Navbar component" :src="avatarSrc" />
          </div>
        </div>
        <ul
          class="mt-3 z-[100] p-2 shadow menu menu-sm dropdown-content bg-primary rounded-box w-52"
        >
          <li>
            <a class="justify-between">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><RouterLink :to="{ name: 'logout' }">Logout</RouterLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
