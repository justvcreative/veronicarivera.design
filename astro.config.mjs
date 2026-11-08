// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Static output for GitHub Pages at the custom domain (served from the root, so no `base`).
export default defineConfig({
  site: 'https://veronicarivera.design',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [mdx()],
  devToolbar: { enabled: false },
});
