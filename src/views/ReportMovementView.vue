<template>
  <div class="add-movement">
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">Container</span>
        <span class="label-text-alt">Alt label</span>
      </label>
      <select v-model="selected" @change="e => changeTheme(e)" class="select select-primary w-full max-w-xs">
        <option disabled selected>Select a theme!</option>
        <option v-for="theme in themes" :key="theme">{{ theme }}</option>
      </select>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { directus } from "@/services/directus";
import { ref } from "vue";

const themes = ['red', 'white', 'blue'];
const selected = ref(null);
const changeTheme = (e) => {
  console.log(e)
};

</script>

<style scoped lang="scss">
.add-movement {
  // min-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
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
