# veronicarivera.design

Veronica Rivera's portfolio: a static [Astro](https://astro.build) site published with GitHub Pages.

## Work on it

```bash
npm install
npm run dev        # http://localhost:4321  (add -- --host to view on other devices)
npm run build      # the static site, in dist/
npm run preview    # serve dist/ to check the build
```

## Where things live

- `src/content/case-studies/*.mdx`: the case studies (one template: `src/pages/work/[slug].astro`)
- `src/pages/`: Home, About, Work, Contact, 404
- `src/components/`: design system components; `src/components/cs/` is the Case Study set
- `src/styles/tokens.css`: design tokens (Light and Dark)
- `src/data/site.ts`: social links, résumé link, Formspree endpoint
- `public/images/`: WebP images at 1x and 2x, made by `npm run images` from Penpot exports in `scripts/source/` (not committed)

Pushing to `main` builds and deploys the site (`.github/workflows/deploy.yml`).
