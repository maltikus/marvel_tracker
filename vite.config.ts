import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// For GitHub Pages project sites set base to '/<REPO-NAME>/'.
// Override at build time with BASE_PATH env (e.g. BASE_PATH=/mcu-tracker/).
// Uses HashRouter-style hash routing internally so deep links work regardless of base.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
