/* ============================================
   E-BIKES Shopify Theme - Main JavaScript
   ============================================ */

'use strict';

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-on-scroll, .animate-from-left, .animate-from-right').forEach((el) => {
    observer.observe(el);
  });
}

/* ============================================
   HEADER - Mobile Menu & Cart Count
   ============================================ */
function initHeader() {
  const toggle = document.querySelector('.site-header__mobile-toggle');
  const mobileMenu = document.querySelector('.site-header__mobile-menu');
  const menuIconOpen = document.querySelector('.js-menu-icon-open');
  const menuIconClose = document.querySelector('.js-menu-icon-close');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      if (menuIconOpen) menuIconOpen.style.display = isOpen ? 'none' : 'block';
      if (menuIconClose) menuIconClose.style.display = isOpen ? 'block' : 'none';
    });
  }

  // Close mobile menu on link click
  mobileMenu && mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      if (menuIconOpen) menuIconOpen.style.display = 'block';
      if (menuIconClose) menuIconClose.style.display = 'none';
    });
  });

  // updateCartCount deferred to idle — see DOMContentLoaded block
}

function updateCartCount() {
  fetch('/cart.js')
    .then((r) => r.json())
    .then((cart) => {
      const badges = document.querySelectorAll('.site-header__cart-badge');
      badges.forEach((badge) => {
        badge.textContent = cart.item_count;
        badge.classList.toggle('site-header__cart-badge--hidden', cart.item_count === 0);
      });
    })
    .catch(() => {});
}

/* ============================================
   HERO SLIDER
   ============================================ */
const HERO_MOBILE_COPY = [
  { subtitle: 'Smart Commuting',  description: 'Engineered for city rides.' },
  { subtitle: 'Next-Gen E-Bikes', description: 'Performance & style.' }
];

function applyHeroMobileCopy() {
  if (window.innerWidth > 768) return;
  document.querySelectorAll('.hero-slider__slide').forEach(function(slide, i) {
    const copy = HERO_MOBILE_COPY[i];
    const sub = slide.querySelector('.hero-slider__subtitle');
    const desc = slide.querySelector('.hero-slider__description');
    // Hide subtitle on mobile — not enough vertical space
    if (sub) sub.style.display = 'none';
    if (desc && copy && copy.description) desc.textContent = copy.description;
  });
}

function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slider__slide');
  const dots = slider.querySelectorAll('.hero-slider__dot');
  const prevBtn = slider.querySelector('.hero-slider__arrow--prev');
  const nextBtn = slider.querySelector('.hero-slider__arrow--next');
  let current = 0;
  let autoplayTimer;
  const AUTOPLAY_DELAY = 5000;

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current] && dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current] && dots[current].classList.add('is-active');
    // No track transform needed — slides use opacity fade
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  // Init first slide
  if (slides.length > 0) {
    slides[0].classList.add('is-active');
    dots[0] && dots[0].classList.add('is-active');
  }

  applyHeroMobileCopy();

  prevBtn && prevBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo(current - 1);
    startAutoplay();
  });

  nextBtn && nextBtn.addEventListener('click', () => {
    stopAutoplay();
    goTo(current + 1);
    startAutoplay();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goTo(i);
      startAutoplay();
    });
  });

  // CTA is now an <a href> — no JS navigation needed

  startAutoplay();
}

/* ============================================
   PRODUCT TABS (Product Detail Page)
   ============================================ */
function initProductTabs() {
  const tabNav = document.querySelector('.product-tabs__nav');
  if (!tabNav) return;

  const buttons = tabNav.querySelectorAll('.product-tab-btn');
  const panels = document.querySelectorAll('.product-tab-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove('is-active'));
      panels.forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const panel = document.querySelector(`.product-tab-panel[data-tab="${target}"]`);
      if (panel) panel.classList.add('is-active');
    });
  });
}

/* ============================================
   QUANTITY SELECTOR (Product Detail Page)
   ============================================ */
function initQuantitySelector() {
  document.querySelectorAll('.quantity-controls').forEach((wrapper) => {
    const decreaseBtn = wrapper.querySelector('.quantity-btn--decrease');
    const increaseBtn = wrapper.querySelector('.quantity-btn--increase');
    const display = wrapper.querySelector('.quantity-display');
    const hiddenInput = wrapper.closest('form') && wrapper.closest('form').querySelector('input[name="quantity"]');

    if (!display) return;

    let qty = parseInt(display.textContent) || 1;

    function updateQty(newQty) {
      qty = Math.max(1, newQty);
      display.textContent = qty;
      if (hiddenInput) hiddenInput.value = qty;
    }

    decreaseBtn && decreaseBtn.addEventListener('click', () => updateQty(qty - 1));
    increaseBtn && increaseBtn.addEventListener('click', () => updateQty(qty + 1));
  });
}

/* ============================================
   ADD TO CART (AJAX)
   ============================================ */
function initAddToCart() {
  document.querySelectorAll('.js-add-to-cart').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const form = this.closest('form');
      const variantId = form
        ? form.querySelector('[name="id"]')?.value
        : this.dataset.variantId;
      const quantity = form
        ? parseInt(form.querySelector('[name="quantity"]')?.value || '1')
        : 1;

      if (!variantId) return;

      btn.disabled = true;
      btn.textContent = 'Adding...';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity }),
      })
        .then((r) => r.json())
        .then(() => {
          updateCartCount();
          showCartNotification('Added to cart!');
        })
        .catch(() => {
          showCartNotification('Something went wrong.', true);
        })
        .finally(() => {
          btn.disabled = false;
          btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to Cart';
        });
    });
  });
}

/* ============================================
   CART NOTIFICATION TOAST
   ============================================ */
let notifTimer;
function showCartNotification(message, isError = false) {
  let notif = document.querySelector('.cart-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.className = 'cart-notification';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.classList.toggle('is-error', isError);
  clearTimeout(notifTimer);
  notif.classList.add('is-visible');
  notifTimer = setTimeout(() => notif.classList.remove('is-visible'), 2800);
}

/* ============================================
   COLLECTION SORT
   ============================================ */
function initCollectionSort() {
  const sortSelect = document.querySelector('.js-sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', function () {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', this.value);
    window.location.href = url.toString();
  });

  // Set current value from URL
  const params = new URLSearchParams(window.location.search);
  const currentSort = params.get('sort_by');
  if (currentSort) sortSelect.value = currentSort;
}

/* ============================================
   CART PAGE - Item Removal & Quantity
   ============================================ */
function initCartPage() {
  if (!document.querySelector('.cart-page')) return;

  document.querySelectorAll('.js-cart-remove').forEach((btn) => {
    btn.addEventListener('click', function () {
      const key = this.dataset.key;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 }),
      })
        .then(() => location.reload())
        .catch(() => {});
    });
  });

  document.querySelectorAll('.js-cart-qty').forEach((input) => {
    input.addEventListener('change', function () {
      const key = this.dataset.key;
      const qty = parseInt(this.value);
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty }),
      })
        .then(() => location.reload())
        .catch(() => {});
    });
  });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Critical — run immediately (LCP path)
  initHeader();
  initHeroSlider();

  // Non-critical — defer to idle time
  const defer = typeof requestIdleCallback === 'function'
    ? (fn) => requestIdleCallback(fn)
    : (fn) => setTimeout(fn, 1);

  defer(() => {
    initScrollAnimations();
    updateCartCount();
    initProductTabs();
    initQuantitySelector();
    initAddToCart();
    initCollectionSort();
    initCartPage();
  });
});
