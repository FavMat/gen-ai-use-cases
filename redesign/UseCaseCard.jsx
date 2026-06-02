// UseCaseCard — premium edition
// Same data contract as your existing component: { useCase, index, onOpenGate, t }

const { useState, useRef } = React;

function UseCaseCard({ useCase, index, onOpenGate, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const themeColor = window.INDUSTRY_COLORS[useCase.industry] || window.INDUSTRY_COLORS["General"];

  // pseudo-stable telemetry numbers per card
  const seed = (useCase.company + useCase.category).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const conf = 78 + (seed % 21);
  const ver = 1 + (seed % 9);
  const idTag = 'UC-' + (1000 + (seed % 8999)).toString();

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    ref.current.style.setProperty('--my', (e.clientY - r.top) + 'px');
  };

  return (
    <div
      className="card"
      ref={ref}
      onMouseMove={onMove}
      style={{ '--c': themeColor, animationDelay: (index * 0.04) + 's' }}
    >
      <div className="card-top">
        <div className="card-icon">{Icons.Zap({ size: 20, color: themeColor })}</div>
        <div className="card-id">
          <div>{idTag}</div>
          <div className="live">LIVE · v{ver}.0</div>
        </div>
      </div>

      <h3 className="card-company">{useCase.company}</h3>
      <div className="card-tagline">/ {useCase.category || 'General Agent'}</div>

      <div className="card-pills">
        <span className="pill industry">
          <span className="dot" style={{ background: themeColor, boxShadow: `0 0 6px ${themeColor}` }} />
          {useCase.industry}
        </span>
        {useCase.provider && (
          <span className="pill provider">{useCase.provider}</span>
        )}
      </div>

      <p className={'card-desc' + (open ? ' is-open' : '')}>
        {useCase.description}
      </p>

      {open && (
        <button className="card-cta" onClick={() => onOpenGate && onOpenGate()}>
          {Icons.Briefcase({ size: 14, color: themeColor })}
          {(t && t.deepDive) || 'Request Consulting Deep Dive'}
        </button>
      )}

      <div className="card-bottom">
        <button className="card-read" onClick={() => setOpen(o => !o)} style={{ color: themeColor }}>
          {open ? ((t && t.readLess) || 'Collapse') : ((t && t.readMore) || 'Read Case')}
          {Icons.ArrowRight({ size: 12 })}
        </button>
        <div className="card-telemetry">
          <span>CONF {conf}%</span>
          <span>· {Math.max(120, conf * 18)} tok</span>
        </div>
      </div>
    </div>
  );
}

window.UseCaseCard = UseCaseCard;
