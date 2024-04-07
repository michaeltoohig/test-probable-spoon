<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SwapTheme from './SwapTheme.vue';
import { ArrowLeftStartOnRectangleIcon, ArrowRightEndOnRectangleIcon, SparklesIcon } from '@heroicons/vue/24/solid';
import { useInstallPromptStore } from '../stores/installPromptStore';
import { storeToRefs } from 'pinia';
import { Bars3CenterLeftIcon as MenuIcon } from '@heroicons/vue/24/solid';
import { useAuthStore } from '../stores/authStore';

const installPromptStore = useInstallPromptStore();
const { installPromptAvailable } = storeToRefs(installPromptStore);

const authStore = useAuthStore();
const { isLoggedIn } = storeToRefs(authStore);
</script>

<template>
  <div :class="[true ? 'navbar bg-primary text-primary-content' : 'navbar bg-error text-error-content']">
    <div class="navbar-start">
      <div v-if="false" class="tooltip tooltip-bottom" data-tip="You are Offline!">
        <RouterLink to="/" class="btn btn-ghost text-xl">South Sea Cargo</RouterLink>
      </div>
      <RouterLink v-else to="/" class="btn btn-ghost text-xl">South Sea Cargo</RouterLink>
    </div>
    <div class="navbar-center">
    </div>
    <div class="navbar-end">
      <SwapTheme class="me-1"/>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <MenuIcon class="w-6 h-6" />
          <div v-if="installPromptAvailable" class="badge badge-xs badge-error" ></div>
        </div>
        <ul
          class="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-primary rounded-box w-52"
        >
          <li v-if="installPromptAvailable">
            <a href="#" @click="installPromptStore.showInstallPrompt">
              <SparklesIcon class="w-5 h-5" />
              Install App!
              <span class="badge badge-xs badge-error"></span>
            </a>
          </li>
          <div v-if="installPromptAvailable" class="divider my-0 px-3"></div>
          <li>
            <RouterLink v-if="isLoggedIn" :to="{ name: 'logout' }">
              <ArrowLeftStartOnRectangleIcon class="w-5 h-5" />
              Logout
            </RouterLink>
            <RouterLink v-else :to="{ name: 'login' }">
              <ArrowRightEndOnRectangleIcon class="w-5 h-5" />
              Login
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
