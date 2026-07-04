// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Canonical URLs, Open Graph URLs, and the sitemap all derive from this.
  site: 'https://drigoalexander.vercel.app',

  integrations: [sitemap(), vue()],

  vite: {
    plugins: [tailwindcss()]
  }
});
