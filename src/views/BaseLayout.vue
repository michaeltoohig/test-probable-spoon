<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import NavBottom from '../components/NavBottom.vue';
</script>

<template>
  <header>
    <NavBar />
  </header>
  <main style="margin-bottom: 64px; padding-bottom: 12px">
    <RouterView />
  </main>
  <NavBottom />
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

main {
  min-height: calc(100vh - 68px);
  padding: 1rem;
}
</style>
