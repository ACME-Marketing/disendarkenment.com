import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: 'https://disendarkenment.netlify.app',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'tap'
  },
  integrations: [
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
      serialize(item) {
        // Customize sitemap entries
        if (item.url.includes('/services/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/readiness-assessment')) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        } else if (item.url === 'https://disendarkenment.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        }
        return item;
      }
    }),
    partytown({
      config: {
        forward: ["gtag", "dataLayer.push"],
        debug: false
      }
    })
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['graphql', 'graphql-request']
          }
        }
      }
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});