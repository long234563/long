'use strict';
(() => {
  const engine = new DodgeEngine();
  const byId = id => document.getElementById(id);
  const canvas = byId('game'), ctx = canvas.getContext('2d');
  const overlay = byId('overlay');
  let best = 0, last = 0, visualTime = 0, pointer = null, keys = new Set();
  try { best = Math.max(0, Number(localStorage.getItem('neon-dodge-best')) || 0); } catch (_) {}
  const stars = Array.from({length: 65}, () => ({x: Math.random() * 360, y: Math.random() * 720, r: Math.random() * 1.4 + .3, speed: Math.random() * 20 + 12}));
  byId('best').textContent = best;

  function show(mode) {
    overlay.hidden = false;
    const paused = mode === 'paused';
    byId('badge').textContent = paused ? 'TẠM DỪNG' : 'CHUYẾN BAY KẾT THÚC';
    byId('title').textContent = paused ? 'NGHỈ MỘT CHÚT' : 'THỬ LẠI NHÉ!';
    byId('result').hidden = paused;
    byId('result').textContent = engine.score;
    byId('description').textContent = paused ? 'Nhấn Tiếp tục để trở lại chuyến bay.' : `Bạn đạt ${engine.score} điểm. Kỷ lục: ${best} điểm.`;
    byId('primary').textContent = paused ? 'TIẾP TỤC →' : 'CHƠI LẠI →';
    byId('secondary').hidden = !paused;
    byId('pause').disabled = true;
  }
  function start() {
    engine.reset();
    keys.clear(); pointer = null; last = 0;
    overlay.hidden = true;
    byId('pause').disabled = false;
  }
  function pause() {
    if (engine.mode !== 'playing') return;
    engine.pause(); keys.clear(); pointer = null; show('paused');
  }
  window.pauseGame = pause;
  window.handleBack = () => {
    if (engine.mode === 'playing') { pause(); return true; }
    return false;
  };
  byId('primary').onclick = () => {
    if (engine.mode === 'paused') {
      engine.resume(); last = 0; overlay.hidden = true; byId('pause').disabled = false;
    } else start();
  };
  byId('secondary').onclick = start;
  byId('pause').onclick = pause;
  const movePointer = event => {
    const rect = canvas.getBoundingClientRect();
    engine.move((event.clientX - rect.left) / rect.width * 360);
  };
  canvas.addEventListener('pointerdown', event => {
    if (engine.mode !== 'playing' || pointer !== null) return;
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer); movePointer(event);
  });
  canvas.addEventListener('pointermove', event => { if (pointer === event.pointerId) movePointer(event); });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) {
    canvas.addEventListener(name, event => { if (pointer === event.pointerId) pointer = null; });
  }
  document.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight',' ','Escape'].includes(event.key)) event.preventDefault();
    keys.add(event.key);
    if (event.key === 'Escape') pause();
  });
  document.addEventListener('keyup', event => keys.delete(event.key));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);

  function draw(dt) {
    visualTime += dt;
    ctx.clearRect(0,0,360,720);
    ctx.lineWidth = .6;
    ctx.strokeStyle = '#2838564d';
    for (let x = 0; x <= 360; x += 45) { ctx.beginPath(); ctx.moveTo(x,100); ctx.lineTo(x,720); ctx.stroke(); }
    for (let y = 100 + visualTime * 25 % 45; y < 720; y += 45) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(360,y); ctx.stroke(); }
    for (const star of stars) {
      ctx.fillStyle = '#afc7e278';
      ctx.beginPath(); ctx.arc(star.x, (star.y + visualTime * star.speed) % 720, star.r, 0, Math.PI * 2); ctx.fill();
    }
    for (const rock of engine.obstacles) {
      ctx.save(); ctx.translate(rock.x,rock.y); ctx.rotate(rock.angle);
      ctx.shadowColor = '#ff719d'; ctx.shadowBlur = 15;
      ctx.fillStyle = '#411e3c'; ctx.strokeStyle = '#ff719d'; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2, r = rock.radius * (i % 2 ? .82 : 1);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(-rock.radius * .2,-rock.radius * .2,rock.radius * .24,0,Math.PI * 2); ctx.strokeStyle = '#ac426b'; ctx.stroke();
      ctx.restore();
    }
    ctx.save(); ctx.translate(engine.x, engine.y);
    ctx.shadowColor = '#56f3e5'; ctx.shadowBlur = 20;
    ctx.fillStyle = engine.mode === 'over' ? '#ff719d' : '#56f3e5';
    ctx.beginPath(); ctx.moveTo(0,-24); ctx.lineTo(21,18); ctx.lineTo(0,10); ctx.lineTo(-21,18); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ecffff'; ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(6,7); ctx.lineTo(-6,7); ctx.closePath(); ctx.fill();
    if (engine.mode !== 'over') {
      ctx.fillStyle = '#b794ff'; ctx.beginPath(); ctx.moveTo(-5,19); ctx.lineTo(0,31 + Math.sin(visualTime * 25) * 5); ctx.lineTo(5,19); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function frame(now) {
    const dt = last ? Math.min(.04, Math.max(0,(now - last) / 1000)) : 0;
    last = now;
    if (engine.mode === 'playing') {
      if (keys.has('ArrowLeft') || keys.has('a')) engine.move(engine.x - 560 * dt);
      if (keys.has('ArrowRight') || keys.has('d')) engine.move(engine.x + 560 * dt);
      engine.tick(dt);
      if (engine.mode === 'over') {
        best = Math.max(best, engine.score);
        try { localStorage.setItem('neon-dodge-best', String(best)); } catch (_) {}
        byId('best').textContent = best;
        keys.clear(); pointer = null; show('over');
      }
    }
    byId('score').textContent = String(engine.score).padStart(4,'0');
    byId('level').textContent = 'LEVEL ' + String(engine.level).padStart(2,'0');
    draw(engine.mode === 'paused' ? 0 : dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
