import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import envCompatible from 'vite-plugin-env-compatible';

const pathSrc = path.resolve(__dirname, './src/');
const components = path.resolve(__dirname, './src/components/');
const pages = path.resolve(__dirname, './src/pages/');
const shared = path.resolve(__dirname, './src/shared/');

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      vuex: 'vuex/dist/vuex.esm-bundler.js',
      '@': pathSrc,
      '@p': pages,
      '@s': shared,
      '@c': components,
    },
  },
  plugins: [vue(), envCompatible()],
  build: {
    outDir: 'dist', // This will correctly point to a dist folder in the parent directory
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // Automatically import the variables.less file in every component
        additionalData: `@import "${path.resolve(
          __dirname,
          'src/assets/less/variables.less'
        )}";`,
      },
    },
  },
});
