import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://novaeglamp.com',
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
