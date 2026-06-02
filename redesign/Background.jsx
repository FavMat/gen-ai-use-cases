// Atmospheric living background: aurora mesh + nebulae + scanning grid
// + parallax particle field + reactor core (where the R3F robot lives in prod).
// In your real Vite app, drop <ThreeRobot /> inside <div className="atmos-core">.

const { useMemo, useRef, useEffect } = React;

function Particles() {
  // generate stable particle set once
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

function ReactorCore() {
  // A pure CSS placeholder for the R3F robot — in production this gets
  // replaced by <ThreeRobot /> at the same position.
  return (
    <div className="atmos-core" aria-hidden="true">
      <div className="ring" />
      <div className="ring r2" />
      <div className="ring r3" />
      <div className="orb" />
    </div>
  );
}

function Background({ withCore = true }) {
  // mouse parallax on the aurora
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
    <div className="atmos">
      <div className="atmos-nebula n1" />
      <div className="atmos-nebula n2" />
      <div className="atmos-nebula n3" />
      <div className="atmos-aurora" ref={auroraRef} />
      {withCore && <ReactorCore />}
      <div className="atmos-grid" />
      <div className="atmos-horizon" />
      <Particles />
      <div className="atmos-vignette" />
      <div className="atmos-grain" />
    </div>
  );
}

window.Background = Background;
