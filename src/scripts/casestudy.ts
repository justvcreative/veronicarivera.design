/* Case study behavior: section tracking, the phone section bar and menu, Back to top,
   the slideshows, and the step/slide viewer dialog. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Current section (side nav and section bar) ---------- */
const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-cs-section]'));
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-cs-link]'));
const barNum = document.querySelector<HTMLElement>('[data-cs-bar-num]');
const barName = document.querySelector<HTMLElement>('[data-cs-bar-name]');

function setCurrent(id: string) {
  links.forEach((a) => {
    if (a.dataset.csLink === id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  const i = sections.findIndex((s) => s.id === id);
  if (i >= 0 && barNum && barName) {
    barNum.textContent = String(i + 1).padStart(2, '0');
    barName.textContent = sections[i].querySelector('.cs-section__title')?.lastChild?.textContent ?? '';
  }
}
function updateCurrent() {
  const line = window.innerHeight * 0.3;
  let current = sections[0]?.id;
  for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
  if (current) setCurrent(current);
}
/* ---------- Hero key visual parallax: it drifts down a little slower than the page ---------- */
const heroImg = document.querySelector<HTMLImageElement>('.cs-hero__visual img');
const heroBox = heroImg?.parentElement;
function updateParallax() {
  if (!heroImg || !heroBox) return;
  if (reduceMotion.matches) { heroImg.style.transform = ''; return; }
  const rect = heroBox.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return; // off screen: nothing to do
  const phone = window.innerWidth < 768;
  const max = phone ? 24 : 56;
  const shift = Math.min(max, Math.max(0, window.scrollY * (phone ? 0.08 : 0.12)));
  heroImg.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
}
reduceMotion.addEventListener('change', updateParallax);

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateCurrent(); updateTop(); updateParallax(); ticking = false; });
}, { passive: true });
window.addEventListener('resize', updateParallax);

/* ---------- Section bar and menu (phones and tablets) ---------- */
const barToggle = document.querySelector<HTMLButtonElement>('[data-cs-bar-toggle]');
const menu = document.querySelector<HTMLElement>('[data-cs-menu]');
const menuClose = document.querySelector<HTMLButtonElement>('[data-cs-menu-close]');
function setMenu(open: boolean, refocus = true) {
  if (!menu || !barToggle) return;
  menu.hidden = !open;
  barToggle.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector<HTMLAnchorElement>('a[aria-current="true"]')?.focus();
  else if (refocus) barToggle.focus();
}
barToggle?.addEventListener('click', () => setMenu(!!menu?.hidden));
menuClose?.addEventListener('click', () => setMenu(false));
menu?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); setMenu(false); } });
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false, false)));
document.addEventListener('click', (e) => {
  if (menu && !menu.hidden && !menu.parentElement?.contains(e.target as Node)) setMenu(false, false);
});

// Moving focus to a section after a nav jump keeps keyboard and screen reader users in place.
links.forEach((a) => a.addEventListener('click', () => {
  const target = document.getElementById(a.dataset.csLink!);
  if (target) {
    target.setAttribute('tabindex', '-1');
    setTimeout(() => target.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 400);
  }
}));

/* ---------- Back to top: after about two screens ---------- */
const topBtn = document.querySelector<HTMLAnchorElement>('[data-cs-top]');
function updateTop() { if (topBtn) topBtn.hidden = window.scrollY < window.innerHeight * 2; }
topBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  document.getElementById('main')?.focus({ preventScroll: true });
});
updateCurrent();
updateTop();
updateParallax();

/* ---------- Viewer dialog ---------- */
type ViewerItem = { label: string; title: string; text: string; img: string; w: number; h: number; w2: number; alt: string };
const dialog = document.querySelector<HTMLDialogElement>('[data-viewer]');
let items: ViewerItem[] = [];
let index = 0;
let opener: HTMLElement | null = null;

function itemFrom(el: HTMLElement): ViewerItem {
  const d = el.dataset;
  return { label: d.viewerLabel!, title: d.viewerTitle!, text: d.viewerText!, img: d.viewerImg!, w: +d.viewerW!, h: +d.viewerH!, w2: +d.viewerW2!, alt: d.viewerAlt ?? '' };
}
function renderViewer() {
  if (!dialog) return;
  const it = items[index];
  const q = <T extends HTMLElement>(s: string) => dialog.querySelector<T>(s)!;
  q('[data-viewer-label]').textContent = it.label;
  q('[data-viewer-title]').textContent = it.title;
  q('[data-viewer-text]').textContent = it.text;
  q('[data-viewer-count]').textContent = `${index + 1} / ${items.length}`;
  q('[data-viewer-dots]').innerHTML = items.map((_, i) => `<i${i === index ? ' data-on' : ''}></i>`).join('');
  const img = q<HTMLImageElement>('[data-viewer-img]');
  img.src = `/images/${it.img}.webp`;
  img.srcset = `/images/${it.img}.webp ${it.w}w, /images/${it.img}@2x.webp ${it.w2}w`;
  img.sizes = '(min-width: 1000px) 912px, 100vw';
  img.width = it.w; img.height = it.h; img.alt = it.alt;
  const media = q('[data-viewer-media]');
  media.toggleAttribute('data-fit', it.h / it.w < 1.2); // tall screens scroll; others fit
  media.scrollTop = 0;
  q<HTMLButtonElement>('[data-viewer-prev]').hidden = items.length < 2;
  q<HTMLButtonElement>('[data-viewer-next]').hidden = items.length < 2;
  q<HTMLButtonElement>('[data-viewer-prev]').setAttribute('aria-label', `Previous ${it.label.startsWith('Step') ? 'step' : 'slide'}`);
  q<HTMLButtonElement>('[data-viewer-next]').setAttribute('aria-label', `Next ${it.label.startsWith('Step') ? 'step' : 'slide'}`);
}
function openViewer(list: ViewerItem[], start: number, from: HTMLElement) {
  if (!dialog) return;
  items = list; index = start; opener = from;
  renderViewer();
  dialog.showModal();
  dialog.querySelector<HTMLButtonElement>('[data-viewer-close]')?.focus();
}
function step(delta: number) {
  if (!items.length || items.length < 2) return;
  index = (index + delta + items.length) % items.length;
  renderViewer();
  // Same motion as the slideshow: the new image comes in from the direction of travel, the text fades up.
  if (!dialog) return;
  const anim: [string, string][] = [
    ['[data-viewer-img]', delta > 0 ? 'is-entering-next' : 'is-entering-prev'],
    ['[data-viewer-title]', 'is-text-entering'],
    ['[data-viewer-text]', 'is-text-entering'],
  ];
  for (const [sel, cls] of anim) {
    const el = dialog.querySelector<HTMLElement>(sel);
    if (!el) continue;
    el.classList.remove('is-entering-next', 'is-entering-prev', 'is-text-entering');
    void el.offsetWidth;
    el.classList.add(cls);
  }
}
if (dialog) {
  dialog.querySelector('[data-viewer-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-viewer-prev]')?.addEventListener('click', () => step(-1));
  dialog.querySelector('[data-viewer-next]')?.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
  // Escape closes natively; return focus to whatever opened the viewer.
  dialog.addEventListener('close', () => { opener?.focus(); document.body.style.overflow = ''; });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  new MutationObserver(() => { document.body.style.overflow = dialog.open ? 'hidden' : ''; }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
}

// Process steps
const stepButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-viewer-open="steps"]'));
stepButtons.forEach((b, i) => b.addEventListener('click', () => openViewer(stepButtons.map(itemFrom), i, b)));

/* ---------- Slideshows ---------- */
document.querySelectorAll<HTMLElement>('[data-slideshow]').forEach((show) => {
  const slides = Array.from(show.querySelectorAll<HTMLElement>('[data-slide]'));
  const captions = Array.from(show.querySelectorAll<HTMLElement>('[data-slide-caption]'));
  const dots = Array.from(show.querySelectorAll<HTMLButtonElement>('[data-slide-dot]'));
  const count = show.querySelector<HTMLElement>('[data-slide-count]');
  const pause = show.querySelector<HTMLButtonElement>('[data-slide-pause]')!;
  let current = 0;
  let playing = !reduceMotion.matches;
  let held = false; // paused while hovered or focused
  let timer: number | undefined;

  // dir: 1 = forward (comes in from the right), -1 = back (from the left)
  const go = (i: number, dir: 1 | -1 = i >= current ? 1 : -1) => {
    const next = (i + slides.length) % slides.length;
    if (next === current) return;
    current = next;
    slides.forEach((s, n) => (s.hidden = n !== current));
    captions.forEach((c, n) => (c.hidden = n !== current));
    for (const el of [slides[current], captions[current]]) {
      if (!el) continue;
      el.classList.remove('is-entering-next', 'is-entering-prev');
      void el.offsetWidth; // restart the animation
      el.classList.add(dir === 1 ? 'is-entering-next' : 'is-entering-prev');
    }
    dots.forEach((d, n) => (n === current ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    if (count) count.textContent = String(current + 1);
  };
  const schedule = () => {
    window.clearInterval(timer);
    if (playing && !held) timer = window.setInterval(() => go(current + 1, 1), 7000);
  };
  const setPlaying = (p: boolean) => {
    playing = p;
    pause.setAttribute('aria-pressed', String(!p));
    pause.querySelector<HTMLElement>('[data-pause-icon]')!.hidden = !p;
    pause.querySelector<HTMLElement>('[data-play-icon]')!.hidden = p;
    pause.querySelector<HTMLElement>('[data-pause-label]')!.textContent = p ? 'Pause' : 'Play';
    schedule();
  };

  show.querySelector('[data-slide-prev]')?.addEventListener('click', () => { go(current - 1, -1); schedule(); });
  show.querySelector('[data-slide-next]')?.addEventListener('click', () => { go(current + 1, 1); schedule(); });
  dots.forEach((d, n) => d.addEventListener('click', () => { go(n); schedule(); }));
  pause.addEventListener('click', () => setPlaying(!playing));
  const expand = show.querySelector<HTMLButtonElement>('[data-slide-expand]');
  expand?.addEventListener('click', () => {
    setPlaying(false);
    openViewer(slides.map(itemFrom), current, expand);
  });
  show.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('.cs-slides__stage, .cs-slides__dots')) {
      if (e.key === 'ArrowLeft') { go(current - 1, -1); schedule(); }
      if (e.key === 'ArrowRight') { go(current + 1, 1); schedule(); }
    }
  });
  show.addEventListener('mouseenter', () => { held = true; schedule(); });
  show.addEventListener('mouseleave', () => { held = false; schedule(); });
  show.addEventListener('focusin', () => { held = true; schedule(); });
  show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget as Node)) { held = false; schedule(); } });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) setPlaying(false); });
  setPlaying(playing);
});
