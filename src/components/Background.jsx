import React, { useMemo, useRef, useEffect } from 'react';
import ThreeRobot from './ThreeRobot';

function Particles() {
  const set = useMemo(() => {
    const out = [];
    for (let i = 0; i < 70; i++) {
      out.push({
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        dur: 16 + Math.random() * 22,
        delay: -Math.random() * 30,
        kind: Math.random() > 0.6 ? 'p-violet' : (Math.random() > 0.4 ? 'p-cyan' : ''),
      });
    }
    return out;
  }, []);
  return (
    <div className="atmos-particles">
      {set.map((p, i) => (
        <span
          key={i}
          className={p.kind}
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Background() {
  const auroraRef = useRef(null);
  
  useEffect(() => {
    let raf;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 30;
      target.y = (e.clientY / window.innerHeight - 0.5) * 30;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className="atmos">
        <div className="atmos-nebula n1" />
        <div className="atmos-nebula n2" />
        <div className="atmos-nebula n3" />
        <div className="atmos-aurora" ref={auroraRef} />
        <div className="atmos-grid" />
        <div className="atmos-horizon" />
        <Particles />
        <div className="atmos-vignette" />
        <div className="atmos-grain" />
      </div>
      <ThreeRobot />
    </>
  );
}
