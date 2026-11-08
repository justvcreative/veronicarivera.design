/**
 * Site-wide settings. Fill in the empty URLs: footer icons and the résumé button
 * are only shown once they have a real address.
 */
export const SITE = {
  name: 'Veronica Rivera',
  role: ['Product Designer', 'Design Technologist'],
  tagline: 'Designing with Intent. Building at Scale',
  email: 'justvcreative@gmail.com',
  url: 'https://veronicarivera.design',
  /** Résumé as a PDF export of the Google Doc (downloads). Empty hides the button. */
  resumeUrl: 'https://docs.google.com/document/d/14PxPK2RKXNYInvX3daIQ4qKPyrJx3SE23aUNYuCgIwE/export?format=pdf',
  /** Contact form endpoint (form service). Empty: the form explains it isn't connected yet. */
  formEndpoint: 'https://formspree.io/f/maeegwnw',
};

export type SocialIcon = 'linkedin' | 'github' | 'dribbble' | 'instagram' | 'tiktok' | 'envelope';
/** Footer icon links, in the design system's order. Empty href = not shown yet. */
export const SOCIAL: { label: string; href: string; icon: SocialIcon }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vriveradesign/', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/justvcreative', icon: 'github' },
  { label: 'Dribbble', href: '', icon: 'dribbble' }, // hidden for now; restore https://dribbble.com/vriveradesign to bring it back,
  { label: 'Instagram', href: 'https://www.instagram.com/vriveradesign/', icon: 'instagram' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@justvcreative', icon: 'tiktok' },
  { label: 'Email', href: `mailto:${SITE.email}`, icon: 'envelope' },
];

export const NAV = [
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];
