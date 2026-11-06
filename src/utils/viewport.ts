/**
 * Keeps the app exactly as tall as the *visible* area of the screen.
 *
 * Why: in Chrome on Android, `100vh` is the height with the URL bar hidden,
 * so the bottom navigation ends up behind Chrome's toolbar / the Android
 * system navigation buttons. visualViewport.height is always the real
 * visible height, so we expose it as --app-height and use it on the root.
 * (In an installed PWA the value is simply the full window height.)
 */
export function initViewportHeight(): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  let raf = 0;

  const apply = () => {
    raf = 0;
    const vv = window.visualViewport;
    const h = Math.round(vv ? vv.height : window.innerHeight);
    if (h > 0) root.style.setProperty('--app-height', `${h}px`);
    // Page must never scroll itself; only #main-scroll-viewport scrolls.
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', () => setTimeout(schedule, 150));
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
}
