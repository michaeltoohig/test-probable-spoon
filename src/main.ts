import { createApp } from 'vue';
// @ts-ignore
import App from './App.vue';
import router from './router';
// import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import { createThemeManager } from './plugins/themeManager';
import './assets/main.css';
import './assets/style.css';
// import biMessages from '../locales/bi.json';
// import enMessages from '../locales/en.json';

// const messages = {
//   bi: biMessages,
//   en: enMessages,
// };

// const i18n = createI18n({
//   locale: 'bi',
//   fallbackLocale: 'bi',
//   messages,
// });

const app = createApp(App)
  .use(router)
  .use(createThemeManager({ light: 'winter', dark: 'night', watchSystemTheme: true }));
  // .use(i18n)

const pinia = createPinia();

app.use(pinia);

app.mount('#app');
