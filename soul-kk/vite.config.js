import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    eslint({
      failOnWarning: false,
      failOnError: true,
      emitWarning: true,
      emitError: true,
    }),
  ],
});
