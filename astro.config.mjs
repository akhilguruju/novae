import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://akhilguruju.github.io',
  base: '/novae',
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
