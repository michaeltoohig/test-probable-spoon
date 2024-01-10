<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SwapTheme from './SwapTheme.vue';

</script>

<template>
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start"></div>
    <div class="navbar-center">
      <RouterLink to="/" class="btn btn-ghost text-xl">South Sea Cargo</RouterLink>
    </div>
    <div class="navbar-end">
      <SwapTheme />
      <div class="dropdown dropdown-end">
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
          <div class="hidden divider my-0 px-3"></div>
          <li><RouterLink :to="{ name: 'logout' }">Logout</RouterLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>
