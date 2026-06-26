/**
 * Waltham.no — main.js
 * Minimal, purposeful JavaScript. No distractions.
 */

(function () {
  'use strict';

  // ─── Navigation ──────────────────────────────────
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerLinks = navDrawer ? navDrawer.querySelectorAll('a') : [];

  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;

    // Add scrolled class for backdrop
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Hide nav on scroll down, show on scroll up (only past hero)
    if (scrollY > window.innerHeight * 0.5) {
      if (scrollY > lastScrollY + 4) {
        nav.classList.add('hidden');
      } else if (scrollY < lastScrollY - 4) {
        nav.classList.remove('hidden');
      }
    } else {
      nav.classList.remove('hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // ─── Mobile Menu ─────────────────────────────────
  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      const isOpen = navDrawer.classList.contains('open');
      navDrawer.classList.toggle('open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    drawerLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Active Nav Link Highlighting ────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function highlightActiveSection() {
    const scrollPos = window.scrollY + (window.innerHeight / 3);

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveSection, { passive: true });

  // ─── Smooth scroll for anchor links ──────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ─── Subtle fade-in on scroll ────────────────────
  // Uses IntersectionObserver — no jarring animations
  if ('IntersectionObserver' in window) {
    const style = document.createElement('style');
    style.textContent = `
      .fade-in {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
      }
      .fade-in.visible {
        opacity: 1;
        transform: none;
      }
    `;
    document.head.appendChild(style);

    // Apply fade-in to key elements
    const fadeTargets = document.querySelectorAll(
      '.timeline-item, .project-card, .quote-block, .writing-card, .sailing-milestone'
    );

    fadeTargets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── Staggered animation for grids ───────────────
  document.querySelectorAll('.projects-grid .project-card, .philosophy-quotes .quote-block, .writing-grid .writing-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 80) + 'ms';
  });

})();
