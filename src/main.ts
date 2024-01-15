import { createApp } from 'vue';
// @ts-ignore
import App from './App.vue';
import router from './router';
// import { useRouter } from 'vue-router'
// import type { Router as RouterType } from 'vue-router'
import { createPinia } from 'pinia';
import { createThemeManager } from './plugins/themeManager';
import './assets/main.css';
import './assets/style.css';

const app = createApp(App)
  .use(router)
  .use(createThemeManager({ light: 'winter', dark: 'night', watchSystemTheme: true }));

const pinia = createPinia();
// pinia.use(({ store }) => {
//   const raw_router = useRouter();
//   console.log('a', raw_router)
//   store.router = markRaw(raw_router);
// });
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // router: RouterType;
  }
}
app.use(pinia);

app.mount('#app');
