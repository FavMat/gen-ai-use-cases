// App — top-level shell. Drop-in compatible with your existing App.jsx structure.
// In your Vite project, swap window.MOCK_DATA for the live Supabase fetch from your current App.jsx.

const { useState: useAppState, useMemo: useAppMemo } = React;

const T_EN = {
  badge: 'MULTI-PROVIDER ENTERPRISE INTELLIGENCE',
  titleNumber: '1,400+',
  title: 'GenAI Use Cases',
  titleStroke: 'in production today.',
  subtitle: 'A live atlas of enterprise GenAI deployments across the five major foundation-model vendors. Filter, compare, and drill into the architectural patterns that are reshaping every industry.',
  stats: [
    { v: '1,400', s: '+', k: 'Verified Cases' },
    { v: '5', k: 'Foundation Vendors' },
    { v: '12', k: 'Industries Mapped' },
    { v: 'LIVE', k: 'Sync · Supabase' },
  ],
  navDatabase: 'Database',
  navAnalytics: 'Deep Analytics',
  navCta: 'Book a free 1:1',
  searchPlaceholder: 'Search by company or keyword (e.g. Marketing, Security, Agent)…',
  controlsMeta: 'INDEX · ACTIVE FILTERS',
  active: 'active use cases',
  loadMore: 'Load more',
  remaining: 'remaining',
  noResults: 'No modules found in sector',
  noResultsDesc: 'Adjust your scanner parameters to locate other use cases.',
  reset: 'Reset Scanners',
  allIndustries: 'All Industries',
  allCategories: 'All Agent Types',
  allProviders: 'All Providers',
  footer: 'GenAI use cases presented here are aggregated from official public datasets and customer stories from top AI providers (Google Cloud, Anthropic, AWS, Microsoft, OpenAI). This spatial interface is an advanced visualization layer.',
  footerCredit: 'Data sources:',
};

const T_IT = {
  badge: 'INTELLIGENZA ENTERPRISE MULTI-PROVIDER',
  titleNumber: '1.400+',
  title: 'GenAI Use Cases',
  titleStroke: 'in produzione oggi.',
  subtitle: 'Un atlante live dei deployment GenAI enterprise dei cinque principali vendor di modelli fondazionali. Filtra, confronta ed esplora i pattern architetturali che stanno ridefinendo ogni settore.',
  stats: [
    { v: '1.400', s: '+', k: 'Casi Verificati' },
    { v: '5', k: 'Vendor Fondazionali' },
    { v: '12', k: 'Settori Mappati' },
    { v: 'LIVE', k: 'Sync · Supabase' },
  ],
  navDatabase: 'Database',
  navAnalytics: 'Analytics Avanzate',
  navCta: 'Prenota 1:1 gratuita',
  searchPlaceholder: 'Cerca per azienda o keyword (es. Marketing, Security, Agent)…',
  controlsMeta: 'INDEX · FILTRI ATTIVI',
  active: 'use cases attivi',
  loadMore: 'Carica altri',
  remaining: 'rimanenti',
  noResults: 'Nessun modulo trovato nel settore',
  noResultsDesc: 'Modifica i parametri di scansione per trovare altri use cases.',
  reset: 'Azzera Filtri',
  allIndustries: 'Tutti i Settori',
  allCategories: 'Tutti i Tipi Agente',
  allProviders: 'Tutti i Provider',
  footer: 'I use cases di GenAI presentati sono aggregati da dataset pubblici ufficiali e storie cliente dei principali provider AI (Google Cloud, Anthropic, AWS, Microsoft, OpenAI).',
  footerCredit: 'Fonti dati:',
};

function App() {
  const [lang, setLang] = useAppState('en');
  const t = lang === 'it' ? T_IT : T_EN;
  const data = window.MOCK_DATA;

  const [view, setView] = useAppState('grid');
  const [search, setSearch] = useAppState('');
  const [indSel, setInd] = useAppState('All');
  const [catSel, setCat] = useAppState('All');
  const [provSel, setProv] = useAppState('All');
  const [visible, setVisible] = useAppState(15);
  const [modal, setModal] = useAppState(null); // { type: 'gate'|'consult', useCase? }

  const industries = ['All', ...new Set(data.map(d => d.industry))].sort();
  const categories = ['All', ...new Set(data.map(d => d.category))].sort();
  const providers = ['All', ...new Set(data.map(d => d.provider))].sort();

  const filtered = useAppMemo(() => {
    let r = data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(d =>
        d.company.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.industry.toLowerCase().includes(q)
      );
    }
    r = r.filter(d =>
      (indSel === 'All' || d.industry === indSel) &&
      (catSel === 'All' || d.category === catSel) &&
      (provSel === 'All' || d.provider === provSel)
    );
    if (!search.trim()) r = [...r].sort((a, b) => a.company.localeCompare(b.company));
    return r;
  }, [search, indSel, catSel, provSel, data]);

  const visibleData = filtered.slice(0, visible);
  const activeFilters = [search ? 1 : 0, indSel !== 'All' ? 1 : 0, catSel !== 'All' ? 1 : 0, provSel !== 'All' ? 1 : 0].reduce((a, b) => a + b, 0);
  const hasAny = search || indSel !== 'All' || catSel !== 'All' || provSel !== 'All';
  const clear = () => { setSearch(''); setInd('All'); setCat('All'); setProv('All'); setVisible(15); };

  // Render helpers for dropdowns
  const renderInd = (opt, isTrigger) => {
    const c = opt === 'All' ? '#ffffff' : (window.INDUSTRY_COLORS[opt] || '#94a3b8');
    return (
      <>
        <span className="dd-dot" style={{ background: c, boxShadow: `0 0 6px ${c}80` }} />
        <span style={{ color: isTrigger ? 'white' : 'inherit' }}>{opt === 'All' ? t.allIndustries : opt}</span>
      </>
    );
  };
  const renderCat = (opt, isTrigger) => (
    <>
      <span style={{ color: isTrigger ? '#c084fc' : '#9a6bff', display: 'flex' }}>{window.getCategoryIcon(opt)}</span>
      <span style={{ color: isTrigger ? 'white' : 'inherit' }}>{opt === 'All' ? t.allCategories : opt}</span>
    </>
  );
  const renderProv = (opt, isTrigger) => (
    <span style={{ color: isTrigger ? 'white' : 'inherit', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
      {opt === 'All' ? t.allProviders : opt.toUpperCase()}
    </span>
  );

  return (
    <>
      <Background />
      <Chatbot lang={lang} />

      <div className="app">
        {/* Top nav */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
              </svg>
            </div>
            <span>GenAI Atlas</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: '0.7rem', color: 'var(--ink-400)', marginLeft: 6 }}>v2.6</span>
          </div>
          <div className="topbar-status">
            <span className="dot" />
            <span>STREAM · {filtered.length.toLocaleString()} INDEXED · SUPABASE OK</span>
          </div>
          <div className="topbar-tools">
            <div className="lang-pill">
              <button className={lang === 'it' ? 'active' : ''} onClick={() => setLang('it')}>IT</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <a href="https://www.linkedin.com/in/matteo-favilli/" target="_blank" rel="noopener noreferrer" className="icon-btn" title="LinkedIn">
              {Icons.Linkedin({ size: 16 })}
            </a>
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="hero-pill">
            <span style={{ marginLeft: 16 }}>{t.badge}</span>
          </div>
          <h1>
            <span className="num">{t.titleNumber}</span> {t.title}
            <span className="stroke">{t.titleStroke}</span>
          </h1>
          <p className="hero-sub">{t.subtitle}</p>

          <div className="hero-stats">
            {t.stats.map((s, i) => (
              <div className="hero-stat" key={i}>
                <div className="v">
                  {s.v}{s.s && <small>{s.s}</small>}
                </div>
                <div className="k">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* View switcher */}
        <div className="view-rail">
          <button className={'view-tab' + (view === 'grid' ? ' is-active' : '')} onClick={() => setView('grid')}>
            {Icons.LayoutGrid({ size: 15 })} {t.navDatabase}
          </button>
          <button className={'view-tab' + (view === 'analytics' ? ' is-active' : '')} onClick={() => setView('analytics')}>
            {Icons.BarChart3({ size: 15 })} {t.navAnalytics}
          </button>
          <div className="view-rail-divider" />
          <button className="cta-tab" onClick={() => setModal({ type: 'consult', useCase: { company: 'Your Data Strategy' } })}>
            {Icons.Briefcase({ size: 15 })} {t.navCta}
          </button>
        </div>

        {view === 'grid' ? (
          <>
            {/* Controls */}
            <div className="controls">
              <div className="controls-meta">
                <span><span className="corner-tick">⌐</span> {t.controlsMeta}: <span style={{ color: 'var(--plasma-cyan)' }}>{activeFilters}</span></span>
                <span>QUERY · {filtered.length.toString().padStart(4, '0')} / {data.length.toString().padStart(4, '0')} <span className="corner-tick">¬</span></span>
              </div>

              <div className="search-wrap">
                {Icons.Search({ size: 20 })}
                <input
                  className="search-input"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setVisible(15); }}
                />
                <span className="search-kbd">⌘ K</span>
              </div>

              <div className="filters-row">
                <CustomDropdown options={industries} value={indSel} onChange={v => { setInd(v); setVisible(15); }} placeholder={t.allIndustries} renderItem={renderInd} />
                <CustomDropdown options={categories} value={catSel} onChange={v => { setCat(v); setVisible(15); }} placeholder={t.allCategories} renderItem={renderCat} />
                <CustomDropdown options={providers} value={provSel} onChange={v => { setProv(v); setVisible(15); }} placeholder={t.allProviders} renderItem={renderProv} />
                {hasAny && (
                  <button className="clear-btn" onClick={clear} title="Clear filters">
                    {Icons.FilterX({ size: 18 })}
                  </button>
                )}
              </div>

              <div className="results-bar">
                <span>SHOWING <span className="count">{visibleData.length}</span> · OF {filtered.length} ACTIVE</span>
                <span>· SORT A→Z · {lang.toUpperCase()}</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid">
              {visibleData.map((u, i) => (
                <UseCaseCard key={u.company + i} useCase={u} index={i} onOpenGate={() => setModal({ type: 'consult', useCase: u })} />
              ))}
              {filtered.length === 0 && (
                <div className="empty">
                  <div className="icon-wrap">{Icons.Inbox({ size: 28 })}</div>
                  <h3>{t.noResults}</h3>
                  <p>{t.noResultsDesc}</p>
                  <button className="btn-load" onClick={clear}>{t.reset}</button>
                </div>
              )}
            </div>

            {visible < filtered.length && (
              <div className="load-more-bar">
                <button className="btn-load" onClick={() => setVisible(v => v + 15)}>
                  {t.loadMore} <span className="count">+{Math.min(15, filtered.length - visible)}</span> · {filtered.length - visible} {t.remaining}
                </button>
              </div>
            )}
          </>
        ) : (
          <AnalyticsDashboard data={data} lang={lang} />
        )}

        {/* Footer */}
        <div className="footer">
          <p>{t.footer}</p>
          <p>{t.footerCredit} <strong>Anthropic · AWS · Google Cloud · Microsoft · OpenAI</strong></p>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>{Icons.X({ size: 14 })}</button>
            <div>
              <div className="modal-badge">{Icons.Briefcase({ size: 12 })} DEEP DIVE · CONSULTING</div>
              <h3>You want to know more?</h3>
              <p>Interested in how <strong style={{ color: 'white' }}>{modal.useCase?.company}</strong> implemented this? Book a free 1:1 to explore how this architecture applies to your organization.</p>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={e => { e.preventDefault(); setModal(null); }}>
              <div className="field-row">
                <div className="field"><label>First name</label><input type="text" required placeholder="Jane" /></div>
                <div className="field"><label>Last name</label><input type="text" required placeholder="Doe" /></div>
              </div>
              <div className="field"><label>Company</label><input type="text" required placeholder="Company name" /></div>
              <div className="field"><label>Work email</label><input type="email" required placeholder="name@company.com" /></div>
              <div className="field">
                <label>What are you looking for?</label>
                <select required defaultValue="">
                  <option value="" disabled>Select an option…</option>
                  <option>Technical Blueprint Report</option>
                  <option>Free 1:1 Consulting Session</option>
                  <option>Both</option>
                </select>
              </div>
              <button className="btn-primary" type="submit">Book Free 1:1 · Contact me</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

window.App = App;
