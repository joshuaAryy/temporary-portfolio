import { useEffect, useRef } from 'react';
import signature from './assets/signature.svg';
import type { Metal } from './metal';

export default function Visuals() {
  const symbolRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<SVGSVGElement>(null);
  const dropRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const symbol = symbolRef.current!;
    const art = artRef.current!;
    const canvas = canvasRef.current!;
    const cursor = pointerRef.current!;
    const drop = dropRef.current!;
    const ring = ringRef.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(any-pointer: fine) and (any-hover: hover)');
    const forced = matchMedia('(forced-colors: active)');
    let alive = true;
    let metal: Metal | null = null;
    let loading = false;
    let graphicsFailed = false;
    let raf = 0;
    let last = 0;
    let clock = 5600;
    let activeUntil = performance.now() + 4000;
    let bounds = symbol.getBoundingClientRect();
    let dirtyBounds = false;
    let inView = true;
    let present = false;
    let overText = false;
    let down = false;
    let x = 0, y = 0, tx = 0, ty = 0, vx = 0, vy = 0;
    let leanX = 0, leanY = 0, pulse = 0;
    let angle = 35;
    let ringStart = -1000, ringX = 0, ringY = 0;
    let downX = 0, downY = 0;

    const allowed = () => !reduced.matches && !forced.matches && !document.hidden;
    const hideCursor = () => { present = false; down = false; cursor.style.opacity = '0'; };
    const schedule = () => {
      if (alive && allowed() && !raf && (inView || present)) raf = requestAnimationFrame(frame);
    };
    const loadMetal = async () => {
      if (metal || loading || graphicsFailed || !allowed() || !inView) return;
      loading = true;
      try {
        const { createMetal } = await import('./metal');
        if (!alive || !allowed()) return;
        const renderer = await createMetal(canvas);
        if (!alive || !allowed()) { renderer?.dispose(); return; }
        metal = renderer;
        graphicsFailed = !renderer;
        schedule();
      } catch { graphicsFailed = true; }
      finally { loading = false; }
    };
    function frame(now: number) {
      raf = 0;
      if (!allowed()) return;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;
      if (dirtyBounds) { bounds = symbol.getBoundingClientRect(); dirtyBounds = false; }
      const dx = tx - bounds.left - bounds.width / 2;
      const dy = ty - bounds.top - bounds.height / 2;
      const proximity = present ? Math.max(0, 1 - Math.hypot(dx, dy) / 210) : 0;
      const aimX = Math.max(-1, Math.min(1, dx / 130)) * proximity;
      const aimY = Math.max(-1, Math.min(1, dy / 130)) * proximity;
      const easing = 1 - Math.exp(-10 * dt);
      leanX += (aimX - leanX) * easing;
      leanY += (aimY - leanY) * easing;
      pulse *= Math.exp(-9 * dt);
      if (inView) {
        if (now < activeUntil) clock += dt * 65;
        metal?.draw(clock, leanX, leanY, pulse);
        art.style.transform = `translate(${leanX * 2.4}px,${leanY * 2.4}px) skew(${leanX * 1.1}deg,${leanY * .5}deg) scale(${1 - pulse * .014})`;
      }
      if (present && fine.matches) {
        // Bounded integration keeps the spring consistent after slow frames.
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          const stiffness = 210 + proximity * 65;
          vx += ((tx - x) * stiffness - vx * 25) * h;
          vy += ((ty - y) * stiffness - vy * 25) * h;
          x += vx * h; y += vy * h;
        }
        const distance = Math.hypot(x - tx, y - ty);
        const stretch = Math.min(42, distance);
        if (distance > .2) angle = Math.atan2(y - ty, x - tx) * 180 / Math.PI;
        const c = 13 + stretch;
        const r = (overText ? 4.3 : 6.4) * (down ? .77 : 1) * (1 - stretch * .004);
        drop.setAttribute('d', `M4 24 C9 23 ${c-r} ${24-r} ${c} ${24-r} C${c+r*1.4} ${24-r} ${c+r*1.4} ${24+r} ${c} ${24+r} C${c-r} ${24+r} 9 25 4 24Z`);
        cursor.style.transform = `translate(${tx - 4}px,${ty - 24}px) rotate(${angle}deg)`;
        cursor.style.opacity = overText ? '.42' : '.85';
      }
      const ringAge = (now - ringStart) / 330;
      if (ringAge >= 0 && ringAge < 1) {
        ring.style.opacity = String((1 - ringAge) * .25);
        ring.style.transform = `translate(${ringX-16}px,${ringY-16}px) scale(${.3 + ringAge * .7})`;
      } else ring.style.opacity = '0';
      const unsettled = present && (Math.hypot(tx-x,ty-y) > .15 || Math.hypot(vx,vy) > .5);
      const leaning = Math.abs(aimX-leanX)+Math.abs(aimY-leanY) > .001;
      if (unsettled || leaning || pulse > .002 || ringAge < 1 || (inView && now < activeUntil)) schedule();
      else last = 0;
    }
    const move = (event: PointerEvent) => {
      if (graphicsFailed || event.pointerType !== 'mouse' || !fine.matches || !allowed()) { hideCursor(); return; }
      tx = event.clientX; ty = event.clientY;
      if (!present) { x = tx; y = ty; vx = 0; vy = 0; }
      present = true;
      const target = event.target instanceof Element ? event.target : null;
      overText = !!target?.closest('p, a, h1');
      activeUntil = performance.now() + 700;
      schedule();
    };
    const press = (event: PointerEvent) => {
      if (graphicsFailed || event.button !== 0 || event.pointerType !== 'mouse' || !allowed()) return;
      down = true; downX = event.clientX; downY = event.clientY;
      schedule();
    };
    const release = (event: PointerEvent) => {
      down = false;
      if (graphicsFailed || event.button !== 0 || !allowed()) return;
      const target = event.target instanceof Element ? event.target : null;
      const moved = Math.hypot(event.clientX-downX, event.clientY-downY) > 5;
      if (event.pointerType === 'mouse' && !moved && !target?.closest('a, p, h1') && !window.getSelection()?.toString()) {
        ringStart = performance.now(); ringX = event.clientX; ringY = event.clientY;
      }
      const near = Math.hypot(event.clientX-bounds.left-bounds.width/2, event.clientY-bounds.top-bounds.height/2) < 130;
      if (near && !moved) pulse = 1;
      schedule();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) { hideCursor(); schedule(); } };
    const invalidate = () => { dirtyBounds = true; schedule(); };
    const preferences = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      hideCursor(); ring.style.opacity = '0';
      if (!allowed()) {
        if (reduced.matches || forced.matches) { metal?.dispose(); metal = null; art.style.transform = ''; }
        return;
      }
      loadMetal(); schedule();
    };
    const blur = () => { hideCursor(); schedule(); };
    const lost = () => {
      metal?.dispose();
      metal = null;
      graphicsFailed = true;
      hideCursor();
      ring.style.opacity = '0';
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if(inView) { loadMetal(); schedule(); } });
    observer.observe(symbol);
    const resize = new ResizeObserver(invalidate);
    resize.observe(symbol);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('pointercancel', blur);
    window.addEventListener('blur', blur);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    document.addEventListener('visibilitychange', preferences);
    reduced.addEventListener('change', preferences);
    fine.addEventListener('change', preferences);
    forced.addEventListener('change', preferences);
    canvas.addEventListener('webglcontextlost', lost);
    loadMetal(); schedule();
    return () => {
      alive = false; cancelAnimationFrame(raf); metal?.dispose();
      observer.disconnect(); resize.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('pointercancel', blur);
      window.removeEventListener('blur', blur);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      document.removeEventListener('visibilitychange', preferences);
      reduced.removeEventListener('change', preferences);
      fine.removeEventListener('change', preferences);
      forced.removeEventListener('change', preferences);
      canvas.removeEventListener('webglcontextlost', lost);
    };
  }, []);

  return <>
    <div className="signature" ref={symbolRef} aria-hidden="true">
      <div className="signature-art" ref={artRef}>
        <img src={signature} alt="" width="180" height="200" draggable="false" />
        <canvas ref={canvasRef} />
      </div>
    </div>
    <svg ref={pointerRef} className="material-pointer" viewBox="0 0 96 48" aria-hidden="true">
      <defs>
        <linearGradient id="cursor-metal" x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor="#fafafa"/><stop offset=".2" stopColor="#858585"/>
          <stop offset=".36" stopColor="#f5f5f5"/><stop offset=".5" stopColor="#474747"/>
          <stop offset=".67" stopColor="#c5c5c5"/><stop offset=".85" stopColor="#efefef"/>
          <stop offset="1" stopColor="#686868"/>
        </linearGradient>
      </defs>
      <path ref={dropRef} fill="url(#cursor-metal)" stroke="#b7b7b7" strokeWidth=".35" />
    </svg>
    <div className="click-ring" ref={ringRef} aria-hidden="true" />
  </>;
}
