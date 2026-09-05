const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('#header');
const menu = document.querySelector('#mobile-menu');
const toggle = document.querySelector('#menu-toggle');
function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation'); }
toggle.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });
const sticky = () => header.classList.toggle('scrolled', scrollY > 100);
addEventListener('scroll', sticky, { passive: true }); sticky();
if ('IntersectionObserver' in window && !reduced.matches) {
  const reveals = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pending'); reveals.unobserve(e.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); reveals.observe(el); });
  document.documentElement.classList.add('motion-enabled');
}
const tabs = [...document.querySelectorAll('[data-direction]')];
function selectDirection(index) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(index === i));
    tab.tabIndex = index === i ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = index !== i;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDirection(index));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { e.preventDefault(); selectDirection(next); tabs[next].focus(); }
  });
});
const video = document.querySelector('#overview-video');
const videoError = document.querySelector('#video-error');
video.addEventListener('error', () => { videoError.hidden = false; });
video.querySelector('source').addEventListener('error', () => { videoError.hidden = false; });
video.addEventListener('loadeddata', () => { videoError.hidden = true; });
const stage = document.querySelector('#molecule-stage');
let loaded = false;
async function loadMolecule() {
  if (loaded) return; loaded = true;
  try { const module = await import('./molecule.js'); module.createMolecule(stage, reduced); }
  catch { document.querySelector('#molecule-fallback').hidden = false; document.querySelector('.molecule-controls').hidden = true; }
}
if ('IntersectionObserver' in window) {
  const lazy = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { loadMolecule(); lazy.disconnect(); } }, { rootMargin: '250px' });
  lazy.observe(stage);
} else loadMolecule();
