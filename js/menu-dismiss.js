(() => {
  const menu = document.querySelector('.site-header #menu');
  const button = document.querySelector('.site-header .menu-button');
  if (!menu || !button) return;

  // Listen to page scrolling only: long dropdowns can still scroll internally.
  const closeMenu = () => {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };
  window.addEventListener('scroll', closeMenu, { passive: true });
})();
