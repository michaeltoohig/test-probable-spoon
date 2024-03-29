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
          <span class="label-text text-lg font-semibold leading-tight">Area</span>
        </label>
        <select
          v-model="area"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select an Area!</option>
          <option v-for="a in areas" :key="a.id" :value="a.name">
            {{ a.name }}
          </option>
        </select>
      </div>
      
      <div class="form-control w-full max-w-lg col-span-2">
        <label class="label">

          <span class="label-text text-lg font-semibold leading-tight">Location</span>
        </label>
        <select
          v-model="location"
          v-bind="locationAttrs"
          :disabled="!area"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select a location from {{ area }}!</option>
          <option v-for="loc in areaLocations" :key="loc.id" :value="loc.id">
            {{ loc.name }}
          </option>
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
          :disabled="!location"
          class="select select-primary w-full max-w-lg"
        >
          <option disabled selected>Select a movement code!</option>
          <option v-for="mc in filteredMovementCodes" :key="mc.id" :value="mc.id">{{ mc.name }}</option>
        </select>
        <label v-if="'movement_code' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.movement_code }}</span>
        </label>
      </div>

      <div class="form-control w-full max-w-lg col-span-2">
        <label class="label cursor-pointer">
          <span class="label-text">Filter Movement Codes</span> 
          <input type="checkbox" v-model="showFilteredMovementCodes" class="checkbox" />
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
        <input class="input input-primary w-full max-w-lg" type="date" v-model="date" />
        <label v-if="'date_reported' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.date_reported }}</span>
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
          <select v-model="minute" class="select select-bordered w-full join-item">
            <option disabled selected>Minute</option>
            <option v-for="min in minutes" :key="min">{{ min }}</option>
          </select>
        </div>
        <label v-if="'date_reported' in errors" class="label">
          <span class="label-text-alt text-red-500">{{ errors.date_reported }}</span>
        </label>
      </div>

      <div class="form-control col-span-2">
        <input type="submit" class="btn btn-primary" value="Submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { directus } from '../services/directus';
import { formatISO, getHours, getMinutes, sub, isFuture, parseISO, parse } from 'date-fns';
import { useForm } from '@vorms/core';
import { NotificationType, useNotifyStore } from '../stores/notifyStore';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { storeToRefs } from 'pinia';
import { useRetryQueueStore } from '../stores/retryQueueStore';
import useContainers from '../composables/useContainers';
import useMovementCodes from '../composables/useMovementCodes';
import useLocations from '../composables/useLocations';
import useOnlineStatus from '../composables/useOnlineStatus';

const router = useRouter();
const retryStore = useRetryQueueStore();
const notifyStore = useNotifyStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { isOnline } = useOnlineStatus();

const minutes = Array.from({ length: 60 }, (_, i) => i);
const hours = Array.from({ length: 24 }, (_, i) => i);

const { containers, promise: containerPromise } = useContainers();
const { movementCodes, promise: movementCodesPromise } = useMovementCodes();
const { areas, locations, promise: locationsPromise } = useLocations();
const area = ref(null);
const areaLocations = computed(() => {
  if (!area.value) return [];
  return locations.value.filter((loc) => loc.area.name === area.value);
});

onMounted(async () => {
  await containerPromise;
  await movementCodesPromise;
  await locationsPromise;
});

// Setup form validation
const { errors, register, handleSubmit, handleReset, validateField } = useForm({
  initialValues: {
    container: '',
    location: '',
    movement_code: '',
    date_reported: formatISO(new Date()),
    reported_by: user.value?.id,
  },
  async validate(values) {
    if (!values.container || !values.location || !values.movement_code) {
      return;
    }

    // When offline no need to validate as it will fail to POST
    if (!isOnline) return;

    try {
      const response = await directus.items('Movements').readByQuery({
        filter: {
          container: {
            // @ts-ignore
            _eq: values.container,
          },
          location: {
            // @ts-ignore
            _eq: values.location,
          },
          movement_code: {
            // @ts-ignore
            _eq: values.movement_code,
          },
          date_created: {
            _gte: '$NOW(-5 minutes)',
          },
        },
      });

      if (response.data && response.data.length > 0) {
        notifyStore.notify(
          'This container movement was already recorded recently.',
          NotificationType.Error
        );
        return {
          container: 'This container movement was already recorded recently.',
          location: 'This container movement was already recorded recently.',
          movement_code: 'This container movement was already recorded recently.',
        };
      }
    } catch (err) {
      // if offline then don't alert the error
      console.error(err);
      notifyStore.notify('Something went wrong validating form', NotificationType.Error);
      return false;
    }
  },
  async onSubmit(data: any) {
    // it appears isOnline is not respected as the service worker thinks it is online when testing.
    if (isOnline) {
      console.log('[Movement] Submitting online');
      try {
        await directus.items('Movements').createOne(data);
        notifyStore.notify('Container movement recorded successfully', NotificationType.Success);
        console.log('[Movement] Retrying queue post successsfull submit');
        await retryStore.syncRetryQueue();
        router.push({ name: 'home' });
      } catch (err) {
        console.error(err);
        notifyStore.notify('Something went wrong. The request was added to the retry queue.', NotificationType.Error);
        router.push({ name: 'retry' });
      } finally {
        await retryStore.getItems();
      }
    } else {
      console.log('[Movement] Adding to retry queue offline');
      await retryStore.addItem(data);
      notifyStore.notify('The movement was added to retry queue.', NotificationType.Info);
      router.push({ name: 'retry' });
    }
  },
});
const { value: container, attrs: containerAttrs } = register('container', {
  validate(value) {
    if (value == '') {
      console.log('v');
      return 'Container is required!';
    }
  },
});
const { value: location, attrs: locationAttrs } = register('location', {
  validate(value) {
    if (value == '') {
      return 'Location is required!';
    }
  },
});
const { value: movementCode, attrs: movementCodeAttrs } = register('movement_code', {
  validate(value) {
    if (value == '') {
      return 'Movement Code is required!';
    }
  },
});
const { value: date_reported } = register('date_reported', {
  validate(value) {
    if (value == '') {
      return 'Date is required!';
    }
    if (isFuture(parseISO(value))) {
      return 'Date must be in the past!';
    }
  },
});

const date = ref(formatISO(new Date(), { representation: 'date' }));
const hour = ref(getHours(new Date()));
const minute = ref(getMinutes(new Date()));
watch([date, hour, minute], () => {
  date_reported.value = formatISO(
    parse(`${hour.value}:${minute.value}:00+1100`, 'HH:mm:ssxx', parseISO(date.value))
  );
  validateField('date_reported');
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

const selectedLocationType = computed(() => {
  if (!location.value) return;
  return locations.value.find((l) => l.id === location.value)?.type;
});
const showFilteredMovementCodes = ref(true);
const filteredMovementCodes = computed(() => {
  if (!selectedLocationType.value) return;
  if (!showFilteredMovementCodes.value) return movementCodes.value;
  if (selectedLocationType.value == 'customer') {
    return movementCodes.value.filter((mc) => mc.code.startsWith('D'));
  } else if (selectedLocationType.value == 'container-yard') {
    return movementCodes.value.filter((mc) => mc.code.startsWith('T'));
  } else if (selectedLocationType.value == 'workshop') {
    return movementCodes.value.filter((mc) => mc.code.startsWith('SNTR'));
  } else if (selectedLocationType.value == 'port') {
    const loadCodes = movementCodes.value
      .filter((mc) => mc.code.startsWith('L'))
      .map((mc) => ({ ...mc, name: `${mc.name} - On Barge` }));
    const transferCodes = movementCodes.value
      .filter((mc) => mc.code.startsWith('T'))
      .map((mc) => ({ ...mc, name: `${mc.name} - On Land` }));
    return [...loadCodes, ...transferCodes];
  } else {
    return movementCodes.value;
  }
});
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
