// ============================================
// POUSADA SOLAR DONA DORA — main.js
// Vanilla JS, no dependencies
// ============================================

const CONFIG = {
  WEBHOOK_URL: 'https://webhook.cidigitalmarketing.com/webhook/4f596ba5-158b-4c54-9958-0cf8353907ec',
  WA_NUMBER: '5537999996427',
  HOTEL_NAME: 'Pousada Solar Dona Dora',
  MOTOR_BASE: 'https://reservas.pousadasolardonadora.com.br'
};

// ============================================
// MOTOR DE RESERVAS — Foco Multimídia
// URL pattern: /search/YYYY-MM-DD/YYYY-MM-DD/adults[-childAge1-childAge2]
// ============================================
function buildBookingURL(checkin, checkout, adults, childAges) {
  let guestStr = String(adults || 2);
  if (childAges && childAges.length) {
    guestStr += '-' + childAges.join('-');
  }
  if (!checkin || !checkout) {
    return null;
  }
  return `${CONFIG.MOTOR_BASE}/search/${checkin}/${checkout}/${guestStr}`;
}

function bookFromHero() {
  const ci = document.getElementById('book-checkin')?.value;
  const co = document.getElementById('book-checkout')?.value;
  if (!ci || !co) {
    alert('Preencha as datas de check-in e check-out para verificar disponibilidade.');
    return;
  }
  const guests = document.getElementById('book-guests')?.value || '2';
  const url = buildBookingURL(ci, co, guests);
  window.open(url, '_blank', 'noopener');
}

// ============================================
// WEBHOOK
// ============================================
async function sendToWebhook(payload) {
  if (!CONFIG.WEBHOOK_URL || CONFIG.WEBHOOK_URL.includes('[')) return;
  try {
    await fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotel: CONFIG.HOTEL_NAME,
        origem_pagina: document.title,
        url: location.href,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });
  } catch (e) { console.warn('Webhook error:', e); }
}

// ============================================
// MOBILE MENU
// ============================================
const ham = document.getElementById('ham');
const mob = document.getElementById('mobnav');

if (ham && mob) {
  ham.addEventListener('click', () => {
    const isOpen = mob.classList.toggle('open');
    ham.classList.toggle('open');
    ham.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

function closeMob() {
  if (mob) {
    mob.classList.remove('open');
    ham?.classList.remove('open');
    ham?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// ============================================
// REVEAL — Intersection Observer (no libs)
// ============================================
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

// ============================================
// FILTROS (Galeria)
// ============================================
function filterGal(cat, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gal-g .gi').forEach(gi => {
    gi.style.display = (cat === 'all' || gi.dataset.cat === cat) ? '' : 'none';
  });
}

// ============================================
// LIGHTBOX
// ============================================
let lbCur = 0;
const LB_SRCS = Array.from(document.querySelectorAll('.gal-g .gi img')).map(img => img.src);

function openLB(i) {
  if (!LB_SRCS.length) return;
  lbCur = i;
  const lb = document.getElementById('lb');
  if (!lb) return;
  document.getElementById('lbImg').src = LB_SRCS[i];
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  document.getElementById('lb')?.classList.remove('open');
  document.body.style.overflow = '';
}
function navLB(d) {
  if (!LB_SRCS.length) return;
  lbCur = (lbCur + d + LB_SRCS.length) % LB_SRCS.length;
  document.getElementById('lbImg').src = LB_SRCS[lbCur];
}
document.getElementById('lb')?.addEventListener('click', e => {
  if (e.target === document.getElementById('lb')) closeLB();
});
document.addEventListener('keydown', e => {
  if (!document.getElementById('lb')?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') navLB(-1);
  if (e.key === 'ArrowRight') navLB(1);
});

// ============================================
// BOOKING MODAL
// ============================================
function openBooking() {
  document.getElementById('bkModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBooking() {
  document.getElementById('bkModal')?.classList.remove('open');
  document.body.style.overflow = '';
}
function updateChildAges() {
  const n = parseInt(document.getElementById('bk-children')?.value || '0');
  const container = document.getElementById('bkChildAges');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const fg = document.createElement('div');
    fg.className = 'fg';
    fg.innerHTML = `<label>Idade crianca ${i + 1}</label>
      <select id="bk-child-${i}">
        ${Array.from({ length: 13 }, (_, a) => `<option value="${a}">${a} ${a === 1 ? 'ano' : 'anos'}</option>`).join('')}
      </select>`;
    container.appendChild(fg);
  }
}
function submitBooking(e) {
  e.preventDefault();
  const ci = document.getElementById('bk-checkin').value;
  const co = document.getElementById('bk-checkout').value;
  const adults = document.getElementById('bk-adults').value;
  const nChildren = parseInt(document.getElementById('bk-children')?.value || '0');
  const childAges = [];
  for (let i = 0; i < nChildren; i++) {
    const age = document.getElementById(`bk-child-${i}`)?.value;
    if (age !== undefined) childAges.push(age);
  }
  const url = buildBookingURL(ci, co, adults, childAges);
  window.open(url, '_blank', 'noopener');
  closeBooking();
}
document.getElementById('bkModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('bkModal')) closeBooking();
});

// ============================================
// COOKIE BANNER
// ============================================
if (localStorage.getItem('ck_status')) {
  document.getElementById('cookieBanner')?.remove();
}
function acceptCookies() {
  localStorage.setItem('ck_status', 'accepted');
  document.getElementById('cookieBanner').style.display = 'none';
}
function declineCookies() {
  localStorage.setItem('ck_status', 'declined');
  document.getElementById('cookieBanner').style.display = 'none';
}

// ============================================
// FORMS
// ============================================
async function submitContact(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  await sendToWebhook({ tipo: 'contato', ...data });
  e.target.reset();
  document.getElementById('okMsg')?.classList.add('show');
  setTimeout(() => document.getElementById('okMsg')?.classList.remove('show'), 6000);
}
async function submitPkgForm(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  await sendToWebhook({ tipo: 'reserva_pacote', pacote: document.title, ...data });
  e.target.reset();
  document.getElementById('pkgOk')?.classList.add('show');
}

// ============================================
// WHATSAPP BUBBLE
// ============================================
setTimeout(() => {
  const bubble = document.getElementById('waBubble');
  if (bubble) bubble.classList.add('show');
}, 3000);

// ============================================
// SET MIN DATE on date inputs
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.min) input.min = today;
  });
});
