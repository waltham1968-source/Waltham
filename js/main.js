(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('main section[id]');
  let previousScroll = 0;
  let scheduled = false;

  function closeMenu() {
    if (!toggle || !drawer) return;
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!toggle || !drawer) return;
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) closeMenu();
      else openMenu();
    });
    drawerLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function updateNavigation() {
    const scroll = window.scrollY;
    const drawerOpen = drawer && drawer.classList.contains('open');

    if (nav) {
      nav.classList.toggle('scrolled', scroll > 35 || drawerOpen);
      if (!drawerOpen && scroll > window.innerHeight * 0.7 && scroll > previousScroll + 6) {
        nav.classList.add('hidden');
      } else if (scroll < previousScroll - 6 || scroll < window.innerHeight * 0.7) {
        nav.classList.remove('hidden');
      }
    }

    const marker = scroll + window.innerHeight * 0.35;
    sections.forEach(function (section) {
      const active = marker >= section.offsetTop && marker < section.offsetTop + section.offsetHeight;
      if (!active) return;
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
      });
    });

    previousScroll = scroll;
    scheduled = false;
  }

  window.addEventListener('scroll', function () {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateNavigation);
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });

    reveals.forEach(function (element, index) {
      element.style.transitionDelay = Math.min(index % 4, 3) * 70 + 'ms';
      observer.observe(element);
    });
  } else {
    reveals.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  updateNavigation();
})();
