import { reactive, ref } from 'vue';
import type { DaisyThemes, ThemeOptions } from './index';
const isDark = ref<boolean>(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
);
const defaults = reactive<ThemeOptions>({
  light: 'winter',
  dark: 'night',
  watchSystemTheme: true,
});
const currentTheme = ref<DaisyThemes>('winter');
const pluginInitiated = ref<boolean>(false);
export { defaults, currentTheme, pluginInitiated, isDark };
