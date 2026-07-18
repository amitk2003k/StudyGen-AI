/**
 * StudyGen AI – script.js
 * ─────────────────────────────────────────────────────────────
 * Responsibilities:
 *  1. Sticky navbar scroll behaviour
 *  2. Hamburger menu (mobile)
 *  3. Active nav-link highlight on scroll (Intersection Observer)
 *  4. Scroll-triggered reveal animations
 *  5. Animated stat counters
 *  6. FAQ accordion
 * ─────────────────────────────────────────────────────────────
 * Stack: Vanilla JS (ES6+) – no dependencies
 */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. STICKY NAVBAR — add "scrolled" class when page scrolls
  ──────────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 12) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load


  /* ────────────────────────────────────────────────────────────
     2. HAMBURGER MENU
  ──────────────────────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    navOverlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  /* Close menu when any nav-link is clicked */
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });


  /* ────────────────────────────────────────────────────────────
     3. ACTIVE NAV LINK HIGHLIGHT (IntersectionObserver)
  ──────────────────────────────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          allNavLinks.forEach(function (link) {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + id
            );
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });


  /* ────────────────────────────────────────────────────────────
     4. SCROLL REVEAL ANIMATIONS
        Adds "visible" class to elements with .fade-in,
        .slide-up, .feature-card, .step-item,
        .testimonial-card, .stat-item as they enter viewport.
  ──────────────────────────────────────────────────────────── */
  const revealSelectors = [
    '.fade-in',
    '.slide-up',
    '.feature-card',
    '.step-item',
    '.testimonial-card',
    '.stat-item',
  ];

  const revealElements = document.querySelectorAll(revealSelectors.join(','));

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // only animate once
        }
      });
    },
    {
      threshold: 0.12,
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ────────────────────────────────────────────────────────────
     5. ANIMATED STAT COUNTERS
        Elements: .stat-value with data-target and data-suffix
  ──────────────────────────────────────────────────────────── */
  const statValues = document.querySelectorAll('.stat-value[data-target]');
  let countersStarted = false;

  /**
   * Eases a number from 0 to `target` over `duration` ms.
   * @param {HTMLElement} el
   * @param {number} target
   * @param {string} suffix
   * @param {number} duration
   */
  function animateCounter(el, target, suffix, duration) {
    const startTime = performance.now();

    function tick(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(ease * target);
      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  /**
   * Start counters the first time the stats section enters view.
   */
  const statsSection = document.getElementById('stats');

  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !countersStarted) {
          countersStarted = true;
          statValues.forEach(function (el) {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            animateCounter(el, target, suffix, 1800);
          });
          statsObserver.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    statsObserver.observe(statsSection);
  }


  /* ────────────────────────────────────────────────────────────
     6. FAQ ACCORDION
        Each .faq-question button toggles its paired .faq-answer.
        Only one item can be open at a time (single-open mode).
  ──────────────────────────────────────────────────────────── */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId   = btn.getAttribute('aria-controls');
      const answer     = document.getElementById(answerId);

      /* Close all other open items first */
      faqQuestions.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          const otherId     = otherBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      /* Toggle the clicked item */
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });


  /* ────────────────────────────────────────────────────────────
     7. SMOOTH SCROLL for all internal anchor links
        (CSS scroll-behavior handles most cases; this JS fallback
         ensures correct offset accounting for the fixed navbar.)
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
