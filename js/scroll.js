/**
 * Scroll reveals + animated counters
 */
(function () {
  'use strict';

  // ─── Reveal observer ───
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — one-time reveal
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });
  });

  // ─── Counter animation ───
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(card) {
    if (card.classList.contains('counted')) return;
    card.classList.add('counted');

    const target = parseInt(card.dataset.target, 10);
    const valueEl = card.querySelector('.counter-value');
    const duration = target > 1000 ? 2200 : 1600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(eased * target);

      if (target >= 1000) {
        valueEl.textContent = current.toLocaleString();
      } else {
        valueEl.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.counter-card').forEach((card) => {
      counterObserver.observe(card);
    });
  });
})();
