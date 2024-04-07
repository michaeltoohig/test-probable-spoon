<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import NavBottom from '../components/NavBottom.vue';
import AlertNoServiceWorker from '../components/AlertNoServiceWorker.vue';
import OfflineNoticeBar from '../components/OfflineNoticeBar.vue';
</script>

<template>
  <header>
    <NavBar />
  </header>
  <OfflineNoticeBar />
  <main class="mb-16">
    <AlertNoServiceWorker />
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
