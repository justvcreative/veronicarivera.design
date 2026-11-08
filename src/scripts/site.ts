/* Site-wide behavior: theme (Auto/Light/Dark), the ThemeToggle disclosure and the phone menu. */

type Pref = 'light' | 'dark' | 'auto';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
const LABELS: Record<Pref, string> = { light: 'Light', dark: 'Dark', auto: 'Auto' };

function currentPref(): Pref {
  const p = root.getAttribute('data-theme-pref');
  return p === 'light' || p === 'dark' ? p : 'auto';
}

function applyTheme(pref: Pref, save = true) {
  const dark = pref === 'dark' || (pref === 'auto' && media.matches);
  root.setAttribute('data-theme-pref', pref);
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (save) {
    try {
      if (pref === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', pref);
    } catch { /* storage blocked: the choice lasts for this page only */ }
  }
  document.querySelectorAll<HTMLInputElement>('[data-theme-radio]').forEach((r) => { r.checked = r.value === pref; });
  const trigger = document.querySelector<HTMLButtonElement>('[data-theme-trigger]');
  trigger?.setAttribute('aria-label', `Theme: ${LABELS[pref]}`);
}

media.addEventListener('change', () => { if (currentPref() === 'auto') applyTheme('auto', false); });
applyTheme(currentPref(), false);

document.querySelectorAll<HTMLInputElement>('[data-theme-radio]').forEach((radio) => {
  radio.addEventListener('change', () => { if (radio.checked) applyTheme(radio.value as Pref); });
});

/* ThemeToggle disclosure (desktop) */
const toggle = document.querySelector<HTMLElement>('[data-theme-toggle]');
const trigger = toggle?.querySelector<HTMLButtonElement>('[data-theme-trigger]');
const panel = toggle?.querySelector<HTMLFieldSetElement>('[data-theme-panel]');
if (toggle && trigger && panel) {
  const open = () => {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    panel.querySelector<HTMLInputElement>('input:checked')?.focus();
  };
  const close = (refocus = true) => {
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (refocus) trigger.focus();
  };
  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  // Clicking a row (not just arrowing) closes the panel after choosing.
  panel.querySelectorAll('label').forEach((l) => l.addEventListener('click', (e) => {
    if ((e as MouseEvent).detail > 0) setTimeout(() => close(), 0);
  }));
  toggle.addEventListener('focusout', (e) => {
    const next = (e as FocusEvent).relatedTarget as Node | null;
    if (next && !toggle.contains(next)) close(false);
  });
  document.addEventListener('click', (e) => { if (!toggle.contains(e.target as Node)) close(false); });
}

/* Header height, for sticky offsets and anchor scrolling */
const header = document.querySelector<HTMLElement>('[data-nav]');
if (header) {
  const setH = () => {
    const bar = header.querySelector<HTMLElement>('.nav__bar');
    root.style.setProperty('--header-h', `${Math.round((bar ?? header).getBoundingClientRect().height + 1)}px`);
  };
  setH();
  new ResizeObserver(setH).observe(header);
}

/* Phone menu */
const nav = document.querySelector<HTMLElement>('[data-nav]');
const menuBtn = nav?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menuLabel = nav?.querySelector<HTMLElement>('[data-menu-label]');
if (nav && menuBtn && menuLabel) {
  const setOpen = (open: boolean) => {
    nav.toggleAttribute('data-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Close menu' : 'Open menu';
  };
  menuBtn.addEventListener('click', () => setOpen(!nav.hasAttribute('data-open')));
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.hasAttribute('data-open')) { setOpen(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 720px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* Parallax: [data-parallax="0.1"] moves by (its distance from the viewport center) × speed, clamped to
   [data-parallax-max] px (default 40); data-parallax-mode="scroll" measures from the page top and "down" from when it enters the screen; both only move down. [data-parallax-min] sets the smallest viewport width it runs at.
   Off with prefers-reduced-motion. Elements can be added later; call refreshParallax(). */
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
let parallaxEls: HTMLElement[] = [];
let parallaxRaf = 0;
function runParallax() {
  parallaxRaf = 0;
  const vh = window.innerHeight;
  for (const el of parallaxEls) {
    const minW = Number(el.dataset.parallaxMin ?? 0);
    if (still.matches || window.innerWidth < minW) { el.style.transform = ''; continue; }
    const r = (el.parentElement ?? el).getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const speed = Number(el.dataset.parallax ?? 0.1);
    const max = Number(el.dataset.parallaxMax ?? 40);
    // "scroll" mode: 0 at the top of the page, then drifts with the scroll (keeps things aligned on load).
    // "down": 0 until the element enters from the bottom of the screen, then drifts down as it rises.
    const mode = el.dataset.parallaxMode;
    const offset = mode === 'scroll' ? window.scrollY * speed
      : mode === 'down' ? Math.max(0, vh - r.top) * speed
      : (r.top + r.height / 2 - vh / 2) * speed;
    const y = mode === 'scroll' || mode === 'down' ? Math.max(0, Math.min(max, offset)) : Math.max(-max, Math.min(max, offset));
    el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }
}
export function refreshParallax() {
  parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  runParallax();
}
const queueParallax = () => { if (!parallaxRaf) parallaxRaf = requestAnimationFrame(runParallax); };
window.addEventListener('scroll', queueParallax, { passive: true });
window.addEventListener('resize', queueParallax);
still.addEventListener('change', runParallax);
refreshParallax();
