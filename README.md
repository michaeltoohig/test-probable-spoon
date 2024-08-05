# South Sea Cargo Drivers App

Offline-first PWA for drivers to report container movements from remote, offline locations.

<hr>

## Custom Plugins

### Vue DaisyUI Theme Manager

This plugin allows you to change the theme of your application at runtime.<br>
It also allows you to watch for system theme changes and update the theme accordingly.<br>

Initiate the plugin with the default theme and the dark theme.
Theme options are from Daisiy UI themes as well as some custom added themes.
Check all the built-in [DaisyUI Themes](https://daisyui.com/docs/themes/). <br>
Create your own custom daisy ui theme [here](https://daisyui.com/theme-generator/) and add it to the
`tailwind.config.js` file!

You can find the detailed [API documentation here](https://github.com/kaandesu/vite-vue-ultimate-starter/tree/master/src/plugins/themeManager/README.md).

<hr>

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
# Type-check and build the app
npm run build
# Built the app
npm run build-only
# Build the app and run the unit & e2e tests (headless)
npm run build-test
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
# Runs the unit tests
npm run test:unit
# Runs the tests in watch mode
npm run test:unit:watch
# Runs the tests in watch mode with coverage
npm run coverage
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install
# When testing on CI, must build the project first
npm run build
# Runs all the end-to-end tests
npm run test:e2e
# Runs all the end-to-end tests headlessly
npm run test:e2e:headless
# Runs the tests only on Desktop
npm run test:e2e:desktop
# Runs the tests only on Mobile
npm run test:e2e:mobile
```

### Inspect after build

```sh
# Inspect the vite build on localhost
npm run vite:inspect
# Inspect the rollup bundle on localhost
npm run rollup:inspect

```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Help

```sh
npm run help
```

