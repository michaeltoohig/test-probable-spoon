<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import TheWelcome from '../components/TheWelcome.vue'

function getSpecialUrl() {
  fetch("https://random-data-api.com/api/users/random_user")
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.log('There was a problem with the fetch operation: ' + error.message));
}
</script>

<template>
  <header>
    <NavBar />
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
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
  padding: 1rem;
}
</style>