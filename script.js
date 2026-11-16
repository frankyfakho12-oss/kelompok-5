(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const dotsBox = document.getElementById('dots');
  const bar = document.querySelector('#progress span');
  let cur = -1, lock = false;

  slides.forEach((s, i) => {
    const d = document.createElement('i');
    d.title = `${i + 1}. ${s.dataset.title || ''}`;
    d.onclick = () => go(i);
    dotsBox.appendChild(d);
  });
  const dots = [...dotsBox.children];

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur || lock) return;
    lock = true; setTimeout(() => lock = false, 650);
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === n);
      s.dataset.state = i < n ? 'before' : i > n ? 'after' : 'current';
      if (i === n) s.scrollTop = 0;
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === n));
    bar.style.width = ((n + 1) / slides.length * 100) + '%';
    document.title = `${slides[n].dataset.title} – Pancasila dan Demokrasi`;
    history.replaceState(null, '', '#' + (n + 1));
    cur = n;
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);

  document.getElementById('next').onclick = next;
  document.getElementById('prev').onclick = prev;
  document.getElementById('fs').onclick = toggleFS;
  function toggleFS() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else if (e.key.toLowerCase() === 'f') toggleFS();
  });

  // wheel: only change slide when the slide itself can't scroll further
  let wheelT = 0;
  addEventListener('wheel', e => {
    const s = slides[cur], now = Date.now();
    const canDown = s.scrollTop + s.clientHeight < s.scrollHeight - 2, canUp = s.scrollTop > 2;
    if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) return;
    if (now - wheelT < 900 || Math.abs(e.deltaY) < 20) return;
    wheelT = now; e.deltaY > 0 ? next() : prev();
  }, { passive: true });

  // swipe
  let sx = 0, sy = 0;
  addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? next() : prev();
  }, { passive: true });

  // cover rings parallax
  const rings = document.querySelector('.rings');
  addEventListener('mousemove', e => {
    if (cur !== 0) return;
    const x = (e.clientX / innerWidth - .5) * 30, y = (e.clientY / innerHeight - .5) * 30;
    rings.style.transform = `translate(${x}px,${y}px)`;
  });

  // floating background particles (red / gold / green / navy)
  const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  const cols = ['190,47,52', '238,183,76', '47,122,87', '22,39,68'];
  let W, H, ps = [];
  function resize() {
    const r = devicePixelRatio || 1;
    W = cv.width = innerWidth * r; H = cv.height = innerHeight * r;
    ps = Array.from({ length: Math.round(innerWidth / 70) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (6 + Math.random() * 22) * r,
      vx: (Math.random() - .5) * .25 * r, vy: (-.1 - Math.random() * .3) * r,
      c: cols[Math.random() * 4 | 0], a: .05 + Math.random() * .08, ring: Math.random() < .4
    }));
  }
  addEventListener('resize', resize); resize();
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -p.r * 2) { p.y = H + p.r; p.x = Math.random() * W; }
      if (p.x < -p.r * 2) p.x = W + p.r; if (p.x > W + p.r * 2) p.x = -p.r;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      if (p.ring) { ctx.strokeStyle = `rgba(${p.c},${p.a * 2})`; ctx.lineWidth = 2; ctx.stroke(); }
      else { ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.fill(); }
    }
    requestAnimationFrame(loop);
  })();

  const start = parseInt(location.hash.slice(1), 10);
  go(start >= 1 && start <= slides.length ? start - 1 : 0);
})();
