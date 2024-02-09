import { defineStore, acceptHMRUpdate } from 'pinia';
import { Ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { directus } from '../services/directus';
import defaultAvatar from '../assets/default-avatar.png?url';

// @see https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
export const EMAIL_REGEX =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

interface AuthStoreState {
  last_page: string | null;
  // user: UserType | null;
  // avatar: string | null;
  loading: boolean;
  error: any;
};

interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
};

export interface CredentialsType {
  email: string;
  password: string;
  remember: boolean;
};

export const storedUser: Ref<string | null> = useStorage('user', null);

const authToken: Ref<string | null> = useStorage('auth_token', null);

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    last_page: null,
    // user: null,
    // avatar: null,
    loading: false,
    error: null,
  }),
  getters: {
    user(): UserType | null {
      if (!storedUser.value) return null;
      return storedUser.value ? JSON.parse(storedUser.value) as UserType : null;
    },
    fullName(): string | null {
      if (this.user === null) return null;
      return `${this.user.first_name} ${this.user.last_name}`;
    },
    avatar(): string | null {
      if (!this.user) return null;
      return this.user.avatar ? `${import.meta.env.VITE_DIRECTUS_URL}/assets/${this.user.avatar}` : defaultAvatar;
    },
    authToken(): string | null {
      return authToken.value;
    },
    isLoggedIn(): boolean {
      // fails to update due to 'auth_token' not watched for changes  
      return authToken.value !== null;
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
        // this.user = null;
        authToken.value = null;
        storedUser.value = null;
      }
    },
    // async getCurrentUser() {
    //   try {
    //     const me = await directus.users.me.read();
    //     storedUser.value = JSON.stringify(me);
    //     this.user = JSON.parse(storedUser.value) as UserType;
    //     if (this.user.avatar) {
    //       // @ts-expect-errors
    //       this.avatar = `${import.meta.env.VITE_DIRECTUS_URL}/assets/${this.user.avatar}`;
    //     } else {
    //       this.avatar = defaultAvatar;
    //     }
    //   } catch (err) {
    //     console.error('Get Current User Failed', err);
    //     throw err;
    //   }
    // },
    async getMe() {
      try {
        const me = await directus.users.me.read() as any;
        const user: UserType = {
          id: me.id,
          first_name: me.first_name,
          last_name: me.last_name,
          email: me.email,
          avatar: me.avatar,
        };
        storedUser.value = JSON.stringify(user);
      } catch (err) {
        console.log('[AUTH] error fetching me', err);
        throw err;
      }
    },
    async login(credentials: CredentialsType) {
      try {
        this.loading = true;
        await directus.auth.login({ ...credentials });
        // await this.getCurrentUser();
        await this.getMe();
        return;
        // if (this.last_page) {
        //   // this.router.push(this.last_page);
        // } else {
        //   // this.router.push({ name: 'map' });
        // }
      } catch (err: any) {
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

// no active pinia yet
// if (storedUser.value) {
//   const authStore = useAuthStore();
//   authStore.user = JSON.parse(storedUser.value) as UserType;
//   authStore.getCurrentUser();
// }

// @ts-expect-errors
if (import.meta.hot) {
  // @ts-expect-errors
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
