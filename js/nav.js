/**
 * Sticky nav, smooth scroll, mobile burger
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const links = document.getElementById('nav-links');

    // ─── Scroll → frosted glass ───
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ─── Burger toggle ───
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      links.classList.toggle('open');
    });

    // ─── Close menu on link click ───
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        links.classList.remove('open');
      });
    });

    // ─── Smooth scroll for all anchor links ───
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = nav.offsetHeight + 10;
          const y = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  });
})();
