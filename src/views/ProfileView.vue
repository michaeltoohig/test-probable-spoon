<template>
  <div class="grid gap-4 md:grid-cols-4">
    <div>
      <div class="card card-compact bg-base-300 border-base-300">
        <figure><img :src="avatar" alt="avatar" /></figure>
        <div class="card-body">
          <h2 class="card-title">{{ user.first_name }} {{ user.last_name }}</h2>
        </div>
      </div>
    </div>

    <div class="col-auto md:col-span-3">
      <!-- stats -->
      <div class="grid gap-4 grid-cols-2 md:grid-cols-3 w-full justify-center md:justify-start">
        <div class="stats">  
          <div class="stat bg-base-300 border-base-300 border">
            <div class="stat-title">Moves Today</div>
            <div class="stat-value">{{ movesToday }}</div>
          </div>
        </div>
        <div class="stats">
          <div class="stat bg-base-300 border-base-300 border">
            <div class="stat-title">Moves Week</div>
            <div class="stat-value">{{ movesWeek }}</div>
          </div>
        </div>
        <div class="stats">
          <div class="stat bg-base-300 border-base-300 border">
            <div class="stat-title">Moves Month</div>
            <div class="stat-value">{{ movesMonth }}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <h2 class="text-xl font-semibold">Movement History</h2>

      <div class="hidden md:block overflow-x-auto">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>MC</th>
              <th>Location</th>
              <th>Area</th>
              <th>Container</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover" v-for="m in recentMovements" :key="m.id">
              <td>{{ m.movement_code.name }}</td>
              <td>{{ m.location.name }}</td>
              <td>{{ m.location.area.name }}</td>
              <td>{{ m.container.code }}</td>
              <td>{{ printDate(m.date_reported) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="timeline timeline-vertical md:hidden">
        <li v-for="m in recentMovements" :key="m.id">
          <hr />
          <div class="timeline-start timeline-box shadow">
            <div class="badge badge-neutral">{{ m.movement_code.name }}</div>
            <div class="card-title">{{ m.container.code }}</div>
            <div class="card-title">{{ m.location.name }}</div>
            <div class="card-subtitle">{{ m.location.area.name }}</div>
          </div>
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-end">{{ printDate(m.date_reported) }}</div>
          <hr />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/authStore';
import { directus } from '../services/directus';
import type { Movement } from '../services/directus';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { format, formatISO, isAfter, parseISO, sub } from 'date-fns';

const notifyStore = useNotifyStore();

const authStore = useAuthStore();
const { user, avatar } = storeToRefs(authStore);

const recentMovements = ref<Movement[]>([]);
const fetchRecentMovements = async (userId: string) => {
  try {
    const response = await directus.items('Movements').readByQuery({
      limit: -1,
      fields: [
        '*',
        'container.id',
        'container.code',
        'location.id',
        'location.name',
        'location.area.id',
        'location.area.name',
        'movement_code.name',
      ],
      filter: {
        reported_by: {
          _eq: userId,
        },
        date_reported: {
          _gt: '$NOW(-30 days)',
        },
      },
      sort: ['-date_reported'],
    });
    return response.data;
  } catch (error) {
    console.error(error);
    notifyStore.notify('Error fetching recent container movements.', NotificationType.Error);
    return [];
  }
};

onMounted(async () => {
  recentMovements.value = await fetchRecentMovements(user.value.id);
});

const movesToday = computed(() => {
  const yesterday = sub(new Date(), { days: 1 });
  return recentMovements.value.filter((m) => isAfter(parseISO(m.date_reported), yesterday)).length;
});
const movesWeek = computed(() => {
  const lastWeek = sub(new Date(), { days: 7 });
  return recentMovements.value.filter((m) => isAfter(parseISO(m.date_reported), lastWeek)).length;
});
const movesMonth = computed(() => {
  return recentMovements.value.length;
});

const printDate = (value: string) => {
  return format(parseISO(value), 'eee, d LLL p');
};
</script>
