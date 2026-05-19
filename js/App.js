// 1. ШИНЭ ЛАБУУДЫГ ЭНД НЭМЖ ӨГӨВ
const pages = {
  'index.html':   'pages/home.html',
  'menu.html':    'pages/menu.html',
  'order.html':   'pages/order.html',
  'about.html':   'pages/about.html',
  'contact.html': 'pages/contact.html',
  'lab9.html':    'pages/lab9.html',   // Лаб 9 хуудас
  'lab11.html':   'pages/lab11.html',  // Лаб 11 хуудас
  'lab12.html':   'pages/lab12.html',  // Лаб 12 хуудас
  'lab13.html':   'pages/lab13.html'   // Лаб 13 хуудас
};

function loadPage(href, pushState = true) {
  const filename = href.split('/').pop() || 'index.html';
  const src = pages[filename];
  if (!src) return;

  const content = document.getElementById('page-content');
  content.classList.add('loading');

  fetch(src)
    .then(r => r.text())
    .then(html => {
      content.classList.remove('loading');
      content.innerHTML = html;
      updateActiveNav(filename);
      if (pushState) history.pushState({ page: filename }, '', href);
      initPageScripts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(() => {
      content.classList.remove('loading');
    });
}

function updateActiveNav(filename) {
  document.querySelectorAll('nav a').forEach(a => {
    const aFile = a.getAttribute('data-page');
    a.classList.toggle('active', aFile === filename);
  });
}

document.addEventListener('click', e => {
  const a = e.target.closest('nav a, [data-nav]');
  if (!a) return;
  e.preventDefault();
  const page = a.getAttribute('data-page') || a.getAttribute('data-nav');
  if (page) loadPage(page);
});

window.addEventListener('popstate', e => {
  if (e.state?.page) loadPage(e.state.page, false);
});

function initTabs(container) {
  const btns   = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = container.querySelector('#' + btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

function initCarousel(wrap) {
  const track  = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dots   = wrap.querySelectorAll('.car-dot');
  let current  = 0;
  let timer;

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  }

  wrap.querySelector('.car-prev')?.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  wrap.querySelector('.car-next')?.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetTimer(); }));

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  goTo(0);
  resetTimer();

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(current + (diff > 0 ? 1 : -1)); resetTimer(); }
  });
}

function initOrderForm() {
  const form    = document.querySelector('.order-form');
  if (!form) return;

  const prices = { 'Бургер': 5000, 'Пицца': 8000, 'Гоймон': 4000, 'Шөл': 3500, 'Салад': 3000, 'Стейк': 12000 };

  const selFood = form.querySelector('#food-select');
  const selQty  = form.querySelector('#food-qty');
  const rowFood = document.getElementById('sum-food');
  const rowQty  = document.getElementById('sum-qty');
  const rowTotal= document.getElementById('sum-total');
  const delivFee= 1000;

  function updateSummary() {
    const food  = selFood?.value;
    const qty   = parseInt(selQty?.value) || 1;
    const price = prices[food] || 0;
    const total = price * qty + (price ? delivFee : 0);
    if (rowFood)   rowFood.textContent  = food  ? `${food} × ${qty}` : '—';
    if (rowQty)    rowQty.textContent   = price ? `${(price * qty).toLocaleString()}₮` : '—';
    if (rowTotal) rowTotal.textContent = price ? `${total.toLocaleString()}₮` : '—';
  }

  selFood?.addEventListener('change', updateSummary);
  selQty?.addEventListener('input', updateSummary);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#cust-name')?.value;
    if (!name || !selFood?.value) return;
    form.style.display = 'none';
    const msg = document.querySelector('.success-msg');
    if (msg) {
      msg.innerHTML = `✅ <strong>${name}</strong> таны захиалга хүлээн авлаа! Ойролцоогоор 20-30 минутад бэлэн болно.`;
      msg.style.display = 'block';
    }
  });
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.innerHTML = '<div style="text-align:center;padding:30px;font-size:1.5rem;">✅ Таны мессеж илгээгдлээ!</div>';
  });
}

function initCounters() {
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current  = 0;
    const step   = Math.ceil(target / 50);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (el.dataset.suffix || '');
      if (current >= target) clearInterval(interval);
    }, 30);
  });
}

function initPageScripts() {
  document.querySelectorAll('.tabs-container').forEach(initTabs);
  document.querySelectorAll('.carousel-wrap').forEach(initCarousel);
  initOrderForm();
  initContactForm();
  initCounters();
}

const hamburger = document.querySelector('.hamburger');
const nav       = document.querySelector('nav');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
});

document.addEventListener('DOMContentLoaded', () => {
  loadPage('index.html', true);
  history.replaceState({ page: 'index.html' }, '', 'index.html');
});