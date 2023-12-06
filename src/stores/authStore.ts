import { defineStore, acceptHMRUpdate } from 'pinia';
import { Ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { directus } from '../services/directus';

// @see https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
export const EMAIL_REGEX =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export type AuthStoreState = {
  last_page: string | null;
  user: Ref<UserType | null>;
  avatar: string | null;
  loading: boolean;
  error: any;
};

export type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
};

export type LoginForm = {
  email: string;
  password: string;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    last_page: null,
    user: useStorage('user', null),
    avatar: null,
    loading: false,
    error: null,
  }),
  getters: {
    isLoggedIn(): boolean {
      return this.user !== null;
    },
    fullName(): string | null {
      if (this.user === null) return null;
      return `${this.user.first_name} ${this.user.last_name}`;
    },
  },
  actions: {
    resetErrors() {
      // used between authentication page navigation changes
      this.error = null;
      this.loading = false;
    },
    async logout() {
      try {
        await directus.auth.logout();
      } finally {
        this.user = null;
        // await directus.auth.static(staticToken);
      }
    },
    async getCurrentUser() {
      try {
        const me = await directus.users.me.read();
        this.user = me as UserType;
        if (this.user.avatar) {
          this.avatar = `${import.meta.env.VITE_DIRECTUS_URL}/assets/${this.user.avatar}`;
        } else {
          this.avatar = 'https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg';
        }

        // if (user.email !== undefined) {
        // } else {
        //   await directus.auth.static(staticToken);
        // }
      } catch (err) {
        console.error('Get Current User Failed', err);
        throw err;
        // await directus.auth.static(staticToken);
      }
    },
    async login(credentials: LoginForm) {
      try {
        this.loading = true;
        await directus.auth.login({ ...credentials });
        await this.getCurrentUser();
        return;
        // if (this.last_page) {
        //   // this.router.push(this.last_page);
        // } else {
        //   // this.router.push({ name: 'map' });
        // }
      } catch (err: any) {
        // correct for missing auth after the failed login attempt
        // await directus.auth.static(staticToken);
        // handle the error
        console.error('User Login Failed', err);
        const error = err.response?.data?.errors[0]?.extensions?.code || err;
        if (error == 'INVALID_CREDENTIALS' || error == 'Error: Invalid user credentials.') {
          this.error = 'INVALID_CREDENTIALS'; // TODO i18n
        } else {
          console.error('Unhandled error', err);
          this.error = err;
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
