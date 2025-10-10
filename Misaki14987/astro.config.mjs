// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom/server': 'preact/compat/server',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
  },
});
