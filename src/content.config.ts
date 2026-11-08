import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One MDX file per case study; every case study renders through src/pages/work/[slug].astro.
const caseStudies = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    next: z.string(),
    /** One line used on the previous case study's Next band. */
    teaser: z.string(),
    card: z.object({
      title: z.string(),
      eyebrow: z.string(),
      summary: z.string(),
      image: z.string(),
      alt: z.string(),
      tags: z.array(z.string()),
    }),
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      lead: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      /** Optional background photo behind the hero text, with its credit. */
      photo: z.string().optional(),
      photoCredit: z.string().optional(),
      photoCreditUrl: z.string().optional(),
      /** How the key visual sits: a framed image (shadow) or a free composite. */
      visual: z.enum(['composite', 'framed']).default('composite'),
    }),
    sections: z.array(z.object({ id: z.string(), title: z.string() })),
  }),
});

export const collections = { caseStudies };
