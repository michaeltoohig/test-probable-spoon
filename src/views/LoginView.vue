<template>
  <div class="login">
    <div class="relative flex flex-col justify-center h-screen overflow-hidden">
      <div class="w-full p-6 m-auto bg-base-200 rounded-md shadow-md sm:max-w-lg">
        <AlertNoServiceWorker />
        <form @submit="handleSubmit" class="space-y-4">
          <div class="flex justify-start items-center">
            <img :src="lorry" class="w-16 h-16" />
            <h1 class="text-3xl font-semibold">Login</h1>
          </div>
          <div class="form-control w-full max-w-lg">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="Your Email"
              class="input input-bordered w-full max-w-lg"
            />
            <label v-if="'email' in errors" class="label">
              <span class="label-text-alt text-red-500">{{ errors.email }}</span>
            </label>
          </div>
          <div class="form-control w-full max-w-lg">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="Your Password"
              class="input input-bordered w-full max-w-lg"
            />
            <label v-if="'password' in errors" class="label">
              <span class="label-text-alt text-red-500">{{ errors.password }}</span>
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Remember me</span>
              <input type="checkbox" :checked="remember" class="checkbox" />
            </label>
          </div>

          <div v-if="error" role="alert" class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="form-control">
            <button type="submit" class="btn btn-primary" :disabled="loading">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import lorry from '/lorry.svg?url';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useForm } from '@vorms/core';
import { EMAIL_REGEX, useAuthStore } from '../stores/authStore';
import AlertNoServiceWorker from '../components/AlertNoServiceWorker.vue';

const authStore = useAuthStore();
const { error, loading } = storeToRefs(authStore);

const router = useRouter();

const { register, errors, handleSubmit } = useForm({
  initialValues: {
    email: '',
    password: '',
    remember: false,
  },
  async onSubmit(values) {
    try {
      await authStore.login(values);
      router.push({ name: 'home' });
    } catch (err: any) {
      console.log('xxx', err);
    }
  },
});

const { value: email, attrs: emailAttrs } = register('email', {
  validate(value: string) {
    if (!value) return 'auth.email-required'; // t('auth.email-required');
    return EMAIL_REGEX.test(value) ? undefined : 'auth.email-not-vaild'; // t('auth.email-not-vaild');
  },
});
const { value: password, attrs: passwordAttrs } = register('password', {
  validate(value: string) {
    if (!value) return 'auth.password-required'; // t('auth.password-required');
    if (value.length < 8) return 'auth.password-length-required'; // t('auth.password-length-required');
  },
});
const { value: remember } = register('remember');
</script>

<style scoped>
.login {
  min-height: calc(100vh - 48px);
  display: flex;
  gap: 1rem;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
}
</style>
