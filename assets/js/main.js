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
// WHATSAPP LEAD MODAL (captura antes de redirecionar)
// ============================================
const WA_DEFAULT_MSG = `Olá, gostaria de saber mais sobre a ${CONFIG.HOTEL_NAME}.`;
let _waReturnUrl = null;

function injectWaFormModal() {
  if (document.getElementById('waFormModal')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
<div class="wa-form-modal" id="waFormModal" role="dialog" aria-modal="true" aria-labelledby="waFormTitle">
  <div class="wa-form-box">
    <button type="button" class="wa-form-close" onclick="closeWaForm()" aria-label="Fechar">&times;</button>
    <div class="wa-form-header">
      <div class="wa-form-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>
      <div>
        <h3 id="waFormTitle">Falar pelo WhatsApp</h3>
        <p>Preencha seus dados e te chamamos em instantes.</p>
      </div>
    </div>
    <form class="wa-form" id="waLeadForm" onsubmit="submitWaForm(event)" novalidate>
      <div class="fg">
        <label for="waf-nome">Nome *</label>
        <input id="waf-nome" name="nome" type="text" required autocomplete="name" placeholder="Seu nome completo">
      </div>
      <div class="fg">
        <label for="waf-email">E-mail *</label>
        <input id="waf-email" name="email" type="email" required autocomplete="email" inputmode="email" placeholder="voce@email.com">
      </div>
      <div class="fg">
        <label for="waf-telefone">Telefone / WhatsApp *</label>
        <input id="waf-telefone" name="telefone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="(00) 00000-0000">
      </div>
      <button type="submit" class="wa-form-submit">Continuar para o WhatsApp</button>
      <p class="wa-form-disclaimer">Resposta rápida em horário comercial. Seus dados são tratados com confidencialidade.</p>
    </form>
  </div>
</div>`;
  document.body.appendChild(wrapper.firstElementChild);
  document.getElementById('waFormModal').addEventListener('click', e => {
    if (e.target.id === 'waFormModal') closeWaForm();
  });
}

function openWaForm(returnUrl) {
  injectWaFormModal();
  _waReturnUrl = returnUrl || null;
  const modal = document.getElementById('waFormModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('waf-nome')?.focus(), 320);
}

function closeWaForm() {
  document.getElementById('waFormModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function _validateWaField(input, type) {
  const v = (input.value || '').trim();
  let ok = v.length >= 2;
  if (type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
  input.classList.toggle('invalid', !ok);
  return ok;
}

function submitWaForm(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.elements['nome'];
  const email = form.elements['email'];
  const telefone = form.elements['telefone'];

  const valid = [
    _validateWaField(nome, 'text'),
    _validateWaField(email, 'email'),
    _validateWaField(telefone, 'tel')
  ].every(Boolean);
  if (!valid) {
    form.querySelector('.invalid')?.focus();
    return;
  }

  const data = {
    nome: nome.value.trim(),
    email: email.value.trim(),
    telefone: telefone.value.trim()
  };

  // GTM — conversão form_submit
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_submit',
    form_type: 'whatsapp_modal',
    form_name: 'whatsapp_lead',
    lead_type: 'whatsapp',
    hotel: CONFIG.HOTEL_NAME,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone
  });

  // Webhook em background (não bloqueia o redirecionamento — preserva o gesto do clique em mobile)
  sendToWebhook({ tipo: 'whatsapp_lead', ...data }).catch(() => {});

  const url = _waReturnUrl || `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(WA_DEFAULT_MSG)}`;
  closeWaForm();
  form.reset();
  window.open(url, '_blank', 'noopener');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    const href = link.getAttribute('href');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Se o modal de reservas estiver aberto, fecha antes de abrir o de lead
      if (typeof closeBooking === 'function' && document.getElementById('bkModal')?.classList.contains('open')) {
        closeBooking();
      }
      openWaForm(href);
    });
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('waFormModal')?.classList.contains('open')) {
    closeWaForm();
  }
});

// ============================================
// SET MIN DATE on date inputs
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.min) input.min = today;
  });
});
