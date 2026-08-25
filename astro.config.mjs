// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    resolve: {
      alias: {
        '@db': fileURLToPath(new URL('./db', import.meta.url)),
      },
    },
  },
});
