<template>
  <label class="swap swap-rotate">
    <input type="checkbox" @change="$theme.toggleDark" />
    <SunIcon class="swap-on w-6 h-6"/>
    <MoonIcon class="swap-off w-6 h-6"/>  
  </label>
</template>

<script setup lang="ts">
// @ts-ignore
import { useThemeManager } from '@/plugins/themeManager';
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid';

const $theme = useThemeManager();
</script>