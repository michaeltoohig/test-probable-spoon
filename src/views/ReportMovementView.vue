<template>
  <div class="add-movement">
    <h1 class="text-2xl font-semibold">Add New Container Movement</h1>

    <form class="grid grid-cols-2 gap-4" @submit="handleSubmit" @reset="handleReset">
      <div class="form-control w-full max-w-lg col-span-2">
        <label class="label">
          <span class="label-text text-lg font-semibold leading-tight">Container</span>
        </label>
        <select
          v-model="container"
          v-bind="containerAttrs"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select a container!</option>
          <option v-for="c in containers" :key="c.id" :value="c.id">{{ c.code }}</option>
        </select>
        <label v-if="'container' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.container }}</span>
        </label>
      </div>

      <div class="form-control w-full max-w-lg col-span-2">
        <label class="label">
          <span class="label-text text-lg font-semibold leading-tight">Location</span>
        </label>
        <select
          v-model="location"
          v-bind="locationAttrs"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select a location!</option>

          <optgroup v-for="(groupedLocations, areaName) in groupedLocations" :key="areaName" :label="areaName">
            <option v-for="loc in groupedLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </optgroup>
        </select>
        <label v-if="'location' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.location }}</span>
        </label>
      </div>

      <div class="form-control w-full max-w-lg col-span-2">
        <label class="label">
          <span class="label-text text-lg font-semibold leading-tight">Movement Code</span>
        </label>
        <select
          v-model="movementCode"
          v-bind="movementCodeAttrs"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select a movement code!</option>
          <option v-for="mc in movementCodes" :key="mc.id" :value="mc.id">{{ mc.code }}</option>
        </select>
        <label v-if="'movement_code' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.movement_code }}</span>
        </label>
      </div>

      <div class="form-control w-full max-w-lg col-span-2 md:col-span-1">
        <label class="label">
          <span class="label-text text-lg font-semibold leading-tight">Date</span>
        </label>
        <div class="join join-vertical md:join-horizontal mb-3">
          <button @click.prevent="setSelectedDate('now')" class="btn join-item">Now</button>
          <button @click.prevent="setSelectedDate('today')" class="btn join-item">Today</button>
          <button @click.prevent="setSelectedDate('yesterday')" class="btn join-item">
            Yesterday
          </button>
        </div>
        <input
          class="input input-primary w-full max-w-lg"
          type="date"
          v-model="date"
        />
        <label v-if="'reported_at' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.reported_at }}</span>
        </label>
      </div>

      <div class="form-control w-full max-w-lg col-span-2 md:col-span-1">
        <label class="label">
          <span class="label-text text-lg font-semibold leading-tight">Time</span>
        </label>
        <div class="join join-vertical md:join-horizontal mb-3">
          <button @click.prevent="setSelectedTime('5')" class="btn join-item">5 Min Ago</button>
          <button @click.prevent="setSelectedTime('10')" class="btn join-item">10 Min Ago</button>
        </div>
        <div class="join font-semibold">
          <select v-model="hour" class="select select-bordered w-full join-item">
            <option disabled selected>Hour</option>
            <option v-for="hour in hours" :key="hour">{{ hour }}</option>
          </select>
          <select
            v-model="minute"
            class="select select-bordered w-full join-item"
          >
            <option disabled selected>Minute</option>
            <option v-for="min in minutes" :key="min">{{ min }}</option>
          </select>
        </div>
        <label v-if="'reported_at' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.reported_at }}</span>
        </label>
      </div>

      <div class="form-control col-span-2">
        <input type="submit" class="btn btn-primary" value="Submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { directus } from '@/services/directus';
import { formatISO, getHours, getMinutes, sub, isFuture, parseISO, parse } from 'date-fns';
import { useForm } from '@vorms/core';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const notifyStore = useNotifyStore();

// Setup initial select values

const minutes = Array.from({ length: 60 }, (_, i) => i);
const hours = Array.from({ length: 24 }, (_, i) => i);

const containers = ref([]);
directus
  .items('Containers')
  .readByQuery({
    limit: -1,
    fields: ['id', 'code', 'type'],
    sort: 'code',
  })
  .then((resp: any) => {
    containers.value = resp.data;
  });

const movementCodes = ref([]);
directus
  .items('MovementCodes')
  .readByQuery({
    limit: -1,
    fields: ['id', 'code'],
  })
  .then((resp: any) => {
    movementCodes.value = resp.data;
  });

const locations = ref<Array<{ id: string; name: string; area: { name: string } }>>([]);
directus
  .items('Locations')
  .readByQuery({
    limit: -1,
    fields: ['id', 'name', 'area.id', 'area.name'],
  })
  .then((resp: any) => {
    locations.value = resp.data;
  });
const groupedLocations = computed(() => {
  return locations.value.reduce(
    (grouped: { [key: string]: Array<{ id: string; name: string }> }, location) => {
      const key = location.area.name;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(location);
      return grouped;
    },
    {}
  );
});

// Setup form validation

const { errors, register, handleSubmit, handleReset, validateField } = useForm({
  initialValues: {
    container: '',
    location: '',
    movement_code: '',
    reported_at: formatISO(new Date()),
  },
  async validate(values) {
    const response = await directus.items("Movements").readByQuery({
      filter: {
        container: {
          _eq: values.container
        },
        location: {
          _eq: values.location
        },
        movement_code: {
          _eq: values.movement_code
        },
        date_created: {
          _gte: '$NOW(-5 minutes)'
        },
      }
    })
    if (response.data.length > 0) {
      return {
        container: 'The container was recently moved to this location already; do not repeat movements.',
      };
    }
    if (isFuture(values.reported_at)) {
      return {
        reported_at: 'The date & time must be in the past!',
      };
    }
  },
  async onSubmit(data) {
    try {
      await directus.items("Movements").createOne(data);
      notifyStore.notify('Container movement recorded successfully', NotificationType.Success);
      router.push({ name: 'home' });
    } catch (err) {
      console.error(err);
      notifyStore.notify('Something went wrong', NotificationType.Error);
    }
  },
});
const { value: container, attrs: containerAttrs } = register('container', {
  validate(value) {
    if (!value) {
      return 'Container is required!';
    }
  },
});
const { value: location, attrs: locationAttrs } = register('location', {
  validate(value) {
    if (!value) {
      return 'Location is required!';
    }
  },
});
const { value: movementCode, attrs: movementCodeAttrs } = register('movement_code', {
  validate(value) {
    if (!value) {
      return 'Movement Code is required!';
    }
  },
});
const { value: reported_at } = register('reported_at', {
  validate(value) {
    if (!value) {
      return 'Date is required!';
    }
    if (isFuture(parseISO(value))) {
      return 'Date must be in the past!';
    }
  },
});
// const { value: time } = register('time', {
//   validate(value) {
//     if (!value) {
//       return 'Time is required!';
//     }
//   },
// });
// watch([date, time], () => {
//   validateField('time');
// });

const date = ref(formatISO(new Date(), { representation: 'date' }))
const hour = ref(getHours(new Date()));
const minute = ref(getMinutes(new Date()));
watch([date, hour, minute], () => {
  console.log(hour.value, minute.value);
  console.log(parse(`${hour.value}:${minute.value}:00+1100`, 'HH:mm:ssxx', parseISO(date.value)))
  reported_at.value = formatISO(parse(`${hour.value}:${minute.value}:00+1100`, 'HH:mm:ssxx', parseISO(date.value)))
  validateField('reported_at');
});

const setSelectedTime = (value: string) => {
  let date = new Date();
  if (value === '5') {
    date = sub(new Date(), { minutes: 5 });
  } else if (value === '10') {
    date = sub(new Date(), { minutes: 10 });
  }
  hour.value = getHours(date);
  minute.value = getMinutes(date);
  // time.value = formatISO(date, { representation: 'time' });
};

const setSelectedDate = (day: string) => {
  if (day === 'now') {
    date.value = formatISO(new Date(), { representation: 'date' });
    setSelectedTime('now');
  } else if (day === 'today') {
    date.value = formatISO(new Date(), { representation: 'date' });
  } else if (day === 'yesterday') {
    date.value = formatISO(sub(new Date(), { days: 1 }), { representation: 'date' });
  }
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
  text-align: center;
}
</style>
