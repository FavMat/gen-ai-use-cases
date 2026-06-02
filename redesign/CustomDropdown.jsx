// CustomDropdown — same API as your existing component (options, value, onChange, placeholder, renderItem)

const { useState, useRef, useEffect } = React;

function CustomDropdown({ options, value, onChange, placeholder, renderItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="dd" ref={ref}>
      <button className="dd-trigger" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {renderItem ? renderItem(value, true) : (value === 'All' ? placeholder : value)}
        </span>
        <span className="chev">{Icons.ChevronDown({ size: 16 })}</span>
      </button>
      {open && (
        <div className="dd-menu">
          {options.map(opt => (
            <button
              key={opt}
              className={'dd-item' + (value === opt ? ' is-selected' : '')}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {renderItem ? renderItem(opt, false) : opt}
              </span>
              {value === opt && <span className="check">{Icons.Check({ size: 14 })}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

window.CustomDropdown = CustomDropdown;
