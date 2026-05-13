(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[scroll] GSAP not loaded - falling back to IntersectionObserver only');
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const navContainer = document.querySelector('.chapter-nav');

  // Build chapter dots
  if (navContainer) {
    chapters.forEach((chap) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'chapter-nav__dot';
      dot.dataset.target = chap.id;
      dot.dataset.label = chap.dataset.label || chap.id;
      dot.setAttribute('aria-label', 'Go to ' + (chap.dataset.label || chap.id));
      dot.addEventListener('click', () => {
        chap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      navContainer.appendChild(dot);
    });
  }

  function setActiveChapter(index) {
    chapters.forEach((c, i) => c.classList.toggle('is-active', i === index));
    if (navContainer) {
      Array.from(navContainer.children).forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
  }

  // ---- Reveal on first sight (one-shot) ----
  // Mark chapter as seen as soon as any part enters the viewport. This drives
  // the fade-in animation. We use a generous rootMargin so even tall chapters
  // (like Chapter 8) reveal immediately when their top enters the viewport.
  const seenObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-seen');
          seenObs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );
  chapters.forEach((c) => seenObs.observe(c));

  // ---- Active chapter tracking (for nav dot) ----
  // Use the chapter whose top crosses an activation line near the top of the
  // viewport. This works correctly for tall chapters too, where ratio-based
  // detection would never let them win.
  const ACTIVATION_LINE = 0.25; // 25% down the viewport

  function updateActive() {
    const lineY = window.innerHeight * ACTIVATION_LINE;
    let activeIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      const r = chapters[i].getBoundingClientRect();
      // The active chapter is the last one whose top is at or above the line
      if (r.top <= lineY) activeIdx = i;
    }
    setActiveChapter(activeIdx);
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateActive();
      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // Initial state
  updateActive();
  // Also force-mark the first chapter as seen so it's visible on load even
  // before any scroll happens.
  if (chapters[0]) chapters[0].classList.add('is-seen');

  // GSAP scroll-triggered effects (subtle parallax on chapter labels)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    chapters.forEach((c) => {
      const label = c.querySelector('.chapter__label');
      if (!label) return;
      gsap.to(label, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: c,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // Smooth-scroll for in-page anchor clicks
  document.querySelectorAll('a[href^="#chapter"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
