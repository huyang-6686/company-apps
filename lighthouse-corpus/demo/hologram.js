// 灯塔 Demo 全息星空背景（纯前端模拟，无外部依赖）
(function () {
  var canvas = document.createElement('canvas');
  canvas.id = 'hologram-bg';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none';
  document.body.prepend(canvas);
  var ctx = canvas.getContext('2d');
  var stars = [];
  var orbs = [];
  var W = 0, H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = [];
    for (var i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        tw: Math.random() * Math.PI * 2,      // twinkle phase
        sp: Math.random() * 0.02 + 0.005,     // twinkle speed
        drift: Math.random() * 0.15 + 0.03    // slow upward drift
      });
    }
    // holographic knowledge-node constellation (demo): 5 slow-orbiting glowing orbs
    var cx = W * 0.68, cy = H * 0.42, R = Math.min(W, H) * 0.22;
    orbs = [];
    for (var k = 0; k < 5; k++) {
      orbs.push({
        a: (k / 5) * Math.PI * 2,               // orbit angle
        rx: R * (0.55 + 0.45 * ((k % 3) / 2)),  // elliptical radius x
        ry: R * (0.45 + 0.35 * ((k % 2))),      // elliptical radius y
        r: 2.4 + (k % 2) * 1.2,
        rot: (k % 2 ? 1 : -1) * 0.12            // per-orb slight tilt
      });
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    // deep-space gradient
    var g = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, Math.max(W, H));
    g.addColorStop(0, 'rgba(30,58,95,0.55)');
    g.addColorStop(1, 'rgba(11,18,32,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(function (s) {
      var alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * s.sp));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(140,200,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
      s.y -= s.drift;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
    });

    // draw constellation links and orbs
    var cx = W * 0.68, cy = H * 0.42, rot = t * 0.00008;
    var pos = orbs.map(function (o) {
      var a = o.a + rot * (o.rot > 0 ? 1 : -1) * Math.abs(o.rot) / 0.12 * 0.5;
      var x = cx + Math.cos(a) * o.rx - Math.sin(a) * o.ry * o.rot;
      var y = cy + Math.sin(a) * o.ry + Math.cos(a) * o.rx * o.rot * 0.3;
      return { x: x, y: y, r: o.r };
    });
    ctx.lineWidth = 0.6;
    for (var i = 0; i < pos.length; i++) {
      for (var j = i + 1; j < pos.length; j++) {
        var dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < Math.min(W, H) * 0.22) {
          ctx.strokeStyle = 'rgba(90,170,255,' + (0.28 * (1 - d / (Math.min(W, H) * 0.22))).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.stroke();
        }
      }
    }
    pos.forEach(function (p, idx) {
      var pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + idx * 1.3);
      // glow
      var gg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      gg.addColorStop(0, 'rgba(120,210,255,' + (0.35 + 0.25 * pulse).toFixed(3) + ')');
      gg.addColorStop(1, 'rgba(120,210,255,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,235,255,' + (0.7 + 0.3 * pulse).toFixed(3) + ')';
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
