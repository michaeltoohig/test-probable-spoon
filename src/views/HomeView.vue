<script setup lang="ts">
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
  <main>
    <button @click="getSpecialUrl">
      Get User
    </button>
    <TheWelcome />
  </main>
</template>
