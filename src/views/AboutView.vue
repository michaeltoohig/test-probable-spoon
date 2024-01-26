<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core';

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date);
</script>

<template>
  <div class="about">
    <div class="container mockup-code max-w-xs">
      <pre data-prefix="$"><code>// This is an about page built at: {{ date }} ({{ timeAgo }})</code></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .about {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    justify-content: center;
    align-content: center;
  }
}

.about {
  padding: 5rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}
</style>

