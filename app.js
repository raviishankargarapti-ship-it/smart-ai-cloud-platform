/* ============================================================
   NexusAI — Smart AI Cloud Platform  |  app.js
   ============================================================ */

/* ── PARTICLES ── */
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const left  = Math.random() * 100;
    const dur   = 10 + Math.random() * 14;
    const delay = Math.random() * 12;
    const dx    = ((Math.random() - 0.5) * 200).toFixed(1) + 'px';
    p.style.cssText = `left:${left}%;bottom:-10px;animation-duration:${dur}s;animation-delay:-${delay}s;--dx:${dx}`;
    container.appendChild(p);
  }
})();


/* ── NAVBAR scroll shrink & hamburger ── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.padding = '0';
  } else {
    navbar.style.padding = '';
  }
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// close mobile nav on link click
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}));


/* ── SMOOTH SCROLL helper ── */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ── ANIMATE ON SCROLL ── */
const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      aosObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos]').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.1 + 's';
  aosObserver.observe(el);
});


/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isFloat = target % 1 !== 0;
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;
    el.textContent = isFloat ? value.toFixed(2) : Math.round(value).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.counter').forEach(animateCounter);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

const statsBar = document.getElementById('statsBar');
if (statsBar) statsObserver.observe(statsBar);


/* ── LIVE DASHBOARD COUNTERS ── */
const reqEl = document.getElementById('reqCounter');
const gpuEl = document.getElementById('gpuCounter');

if (reqEl && gpuEl) {
  let req = 0, gpu = 0;
  const targetReq = 1842;
  const targetGpu = 73;

  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      req = Math.round(targetReq * e);
      gpu = Math.round(targetGpu * e);
      reqEl.textContent = req.toLocaleString();
      gpuEl.textContent = gpu + '%';
      if (p < 1) requestAnimationFrame(tick);
      else startLiveTick();
    }
    requestAnimationFrame(tick);
  }, 600);

  function startLiveTick() {
    setInterval(() => {
      req += Math.round((Math.random() - 0.48) * 40);
      req  = Math.max(800, Math.min(2800, req));
      reqEl.textContent = req.toLocaleString();
    }, 1200);
    setInterval(() => {
      gpu += Math.round((Math.random() - 0.48) * 3);
      gpu  = Math.max(40, Math.min(99, gpu));
      gpuEl.textContent = gpu + '%';
    }, 1800);
  }
}


/* ── CANVAS TRAFFIC CHART ── */
const canvas = document.getElementById('trafficChart');
if (canvas) {
  const ctx = canvas.getContext('2d');

  const chartData = {
    '24h': generateData(24, 800, 2400),
    '7d':  generateData(28, 600, 3200),
    '30d': generateData(30, 400, 4000),
  };
  let currentKey = '24h';

  function generateData(n, min, max) {
    return Array.from({ length: n }, () => min + Math.random() * (max - min));
  }

  function drawChart(key) {
    const data = chartData[key];
    const W = canvas.offsetWidth || 560;
    const H = canvas.offsetHeight || 120;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range  = maxVal - minVal || 1;
    const pad    = { t: 10, b: 20, l: 10, r: 10 };
    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;

    const pts = data.map((v, i) => ({
      x: pad.l + (i / (data.length - 1)) * chartW,
      y: pad.t + (1 - (v - minVal) / range) * chartH,
    }));

    // gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, H);
    grad.addColorStop(0,   'rgba(0,212,255,0.25)');
    grad.addColorStop(1,   'rgba(0,212,255,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p, i) => {
      if (i === 0) return;
      const prev = pts[i - 1];
      const cpX = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
    });
    ctx.lineTo(pts[pts.length - 1].x, H - pad.b);
    ctx.lineTo(pts[0].x, H - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p, i) => {
      if (i === 0) return;
      const prev = pts[i - 1];
      const cpX  = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
    });
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // axis labels
    ctx.fillStyle = '#8892a4';
    ctx.font      = '10px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    const labelCount = Math.min(data.length, 8);
    const step = Math.floor((data.length - 1) / (labelCount - 1));
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.min(i * step, data.length - 1);
      const x   = pts[idx].x;
      const label = key === '24h' ? `${(23 - idx)}h` : key === '7d' ? `D${idx + 1}` : `W${Math.ceil((idx + 1) / 7)}`;
      ctx.fillText(label, x, H - 4);
    }
  }

  window.setChartTab = function(btn, key) {
    document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentKey = key;
    drawChart(key);
  };

  // draw on load and resize
  drawChart('24h');
  window.addEventListener('resize', () => drawChart(currentKey));
}


/* ── BILLING TOGGLE ── */
window.toggleBilling = function() {
  const annual = document.getElementById('billingToggle').checked;
  document.querySelectorAll('.price-val').forEach(el => {
    const val = annual ? el.dataset.annual : el.dataset.monthly;
    el.textContent = val;
  });
};


/* ── MODAL ── */
const modalOverlay = document.getElementById('modalOverlay');
const modal        = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

const MODAL_TEMPLATES = {
  signup: `
    <h2>Create your account</h2>
    <p>Get started for free — no credit card required.</p>
    <div class="modal-form">
      <input type="text"  placeholder="Full name"    />
      <input type="email" placeholder="Work email"   />
      <input type="password" placeholder="Password (8+ chars)" />
      <button class="btn-large btn-accent" onclick="handleAuth('signup')">Create account →</button>
    </div>
    <div class="modal-divider">or</div>
    <div class="modal-switch">Already have an account? <a onclick="openModal('signin')">Sign in</a></div>
  `,
  signin: `
    <h2>Welcome back</h2>
    <p>Sign in to your NexusAI dashboard.</p>
    <div class="modal-form">
      <input type="email" placeholder="Work email" />
      <input type="password" placeholder="Password" />
      <button class="btn-large btn-accent" onclick="handleAuth('signin')">Sign in →</button>
    </div>
    <div class="modal-divider">or</div>
    <div class="modal-switch">Don't have an account? <a onclick="openModal('signup')">Sign up free</a></div>
  `,
};

window.openModal = function(type) {
  const tpl = MODAL_TEMPLATES[type];
  if (!tpl) return;
  modalContent.innerHTML = tpl;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

window.handleAuth = function(type) {
  closeModal();
  showToast(type === 'signup' ? '🎉 Account created! Welcome to NexusAI.' : '👋 Signed in successfully!');
};


/* ── CONTACT FORM ── */
window.submitContact = function(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  e.target.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el => el.disabled = true);
  setTimeout(() => {
    success.style.display = 'block';
  }, 600);
};


/* ── TOAST ── */
function showToast(msg, duration = 3500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}


/* ── ARCHITECTURE NODE CYCLING ── */
(function cycleArchNodes() {
  const nodes = document.querySelectorAll('.arch-node');
  if (!nodes.length) return;
  let current = 0;
  setInterval(() => {
    nodes[current].style.boxShadow = '';
    current = (current + 1) % nodes.length;
    nodes[current].style.boxShadow = '0 0 0 2px rgba(0,212,255,0.35)';
  }, 900);
})();


/* ── NAVBAR active link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      links.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
