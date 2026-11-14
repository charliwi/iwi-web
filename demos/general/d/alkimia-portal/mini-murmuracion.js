/* alkimia · mini murmuración semiamorfa para el avatar del agente (Diseño, 12 nov 2026).
   Carlos, 12 nov: «el círculo que aparece al lado de las respuestas de alkimia me gustaría que fuera la minimurmuración semiamorfa».
   Sin dependencias. Uso:
     const parar = alkMiniMur(canvas, { semilla: 3, paleta: 'alkimia' | 'ti' | [[r,g,b],...], tam: 28 });
     parar();  // detiene la animación (por ejemplo al desmontar el mensaje)
   - Respeta «reducir movimiento»: dibuja un solo cuadro quieto.
   - Se pausa sola cuando el canvas no se ve (IntersectionObserver) o la pestaña está oculta.
   - Nítida en pantallas retina (usa devicePixelRatio). Fondo transparente; pensada para tarjetas blancas. */
(function (global) {
  const PALETAS = {
    alkimia: [[150, 60, 255], [255, 70, 170], [255, 110, 40], [255, 190, 60], [30, 200, 120], [40, 120, 255], [150, 60, 255]],
    ti: [[248, 52, 44], [240, 122, 58], [245, 180, 74], [150, 60, 255], [255, 70, 170], [248, 52, 44]]
  };
  const rnd = (i, k) => { let h = Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(k + 7, 0x85EBCA77); h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

  function alkMiniMur(canvas, op) {
    op = op || {};
    const semilla = (op.semilla || 0) * 997, tam = op.tam || 28;
    const PAL = Array.isArray(op.paleta) ? op.paleta : (PALETAS[op.paleta] || PALETAS.alkimia);
    const n = op.particulas || Math.round(260 + tam * 5);
    const dpr = Math.min(global.devicePixelRatio || 1, 3), W = Math.round(tam * dpr);
    canvas.width = W; canvas.height = W; canvas.style.width = tam + 'px'; canvas.style.height = tam + 'px'; canvas.style.flex = 'none';
    const g = canvas.getContext('2d');
    const pal = (f) => { f = ((f % 1) + 1) % 1 * (PAL.length - 1); const i = Math.floor(f), p = f - i, A = PAL[i], B = PAL[i + 1]; return A.map((v, k) => Math.round(v + (B[k] - v) * p)); };
    function dibuja(t) {
      const cx = W / 2, r = W * 0.36; g.clearRect(0, 0, W, W);
      for (let i = 0; i < n; i++) {
        const u = rnd(i + semilla, 1), v = rnd(i + semilla, 2), w = rnd(i + semilla, 3);
        const z = 2 * u - 1, a = v * 6.2832 + t * (0.8 + 0.6 * Math.sin(z * 3 + t * 0.4)) * (i % 3 ? 1 : -1.2);
        const s = Math.sqrt(1 - z * z), amor = 1 + 0.2 * Math.sin(3 * a + t * 1.7) * s + 0.14 * Math.sin(4 * z + t * 2.3) + 0.08 * Math.sin(5 * a - t * 1.4);
        const rho = r * amor * (0.45 + 0.55 * Math.cbrt(w));
        const x = cx + s * Math.cos(a) * rho, y = cx + (s * Math.sin(a) * 0.9 - z * 0.35) * rho, d = (z + 1) / 2;
        const c = pal(a * 0.16 + z * 0.3 + t * 0.1 + rnd(i, 8) * 0.1), sz = (0.9 + 1.4 * d) * dpr;
        g.fillStyle = `rgba(${c},${0.45 + 0.55 * d})`; g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
    }
    const quieto = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = 2 + (op.semilla || 0) * 0.9;
    if (quieto) { dibuja(t0); return () => {}; }
    let visible = true, vivo = true, raf = 0, inicio = performance.now();
    const ciclo = (ahora) => { if (!vivo) return; if (visible && !document.hidden) dibuja(t0 + (ahora - inicio) / 1000); raf = requestAnimationFrame(ciclo); };
    let io = null;
    if ('IntersectionObserver' in global) { io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }); io.observe(canvas); }
    raf = requestAnimationFrame(ciclo);
    return () => { vivo = false; cancelAnimationFrame(raf); if (io) io.disconnect(); };
  }
  global.alkMiniMur = alkMiniMur;
  if (typeof module !== 'undefined' && module.exports) module.exports = alkMiniMur;
})(typeof window !== 'undefined' ? window : globalThis);
