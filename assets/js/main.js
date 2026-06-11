/* =========================================================
   AGORA — Main script
   - i18n EN/ES with localStorage
   - Mobile nav toggle
   - Dropdown navigation
   - Reveal-on-scroll
   ========================================================= */
(function () {
  'use strict';
  
  const SHOW_SUCCESS_STORIES = false;

  const STORAGE_KEY = 'agora_lang';
  const DEFAULT_LANG = 'en';

  // ---------- i18n ----------
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function applyTranslations(lang) {
    const dict = (window.AGORA_I18N && window.AGORA_I18N[lang]) || {};
    document.documentElement.setAttribute('lang', lang)
    const ssItem = document.getElementById('nav-success-stories');
    if (ssItem) ssItem.style.display = SHOW_SUCCESS_STORIES ? '' : 'none';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        // Allow HTML in some keys (e.g. with <strong>)
        if (el.dataset.i18nHtml === 'true' || /<[a-z][\s\S]*>/i.test(dict[key])) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key && dict[key] !== undefined) {
          el.setAttribute(attr, dict[key]);
        }
      });
    });

    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
  }

  // ---------- Mobile nav ----------
  function setupMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---------- Dropdown ----------
  function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach((dd) => {
      const toggle = dd.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;

      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        // Close all other dropdowns first
        dropdowns.forEach((other) => {
          const ot = other.querySelector('.nav-dropdown-toggle');
          if (ot && ot !== toggle) ot.setAttribute('aria-expanded', 'false');
        });
        toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });

    document.addEventListener('click', () => {
      dropdowns.forEach((dd) => {
        const t = dd.querySelector('.nav-dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdowns.forEach((dd) => {
          const t = dd.querySelector('.nav-dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // ---------- Language switcher ----------
  function setupLangSwitcher() {
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    setupDropdowns();
    setupLangSwitcher();
    applyTranslations(getLang());
    setupReveal();
  });
})();
