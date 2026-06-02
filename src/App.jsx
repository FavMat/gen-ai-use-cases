import { useState, useMemo, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'
import { supabase } from './lib/supabase'
import { translations, detectLanguage } from './i18n/translations'
import UseCaseCard from './components/UseCaseCard'
import CustomDropdown from './components/CustomDropdown'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import Background from './components/Background'
import Chatbot from './components/Chatbot'
import { Icons, getCategoryIcon } from './components/Icons'
import { industryColors } from './lib/constants'

function App() {
  const [lang, setLang] = useState(detectLanguage)
  const t = translations[lang]
  const [activeView, setActiveView] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProvider, setSelectedProvider] = useState('All')
  const [visibleCount, setVisibleCount] = useState(15)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGateCase, setSelectedGateCase] = useState(null)
  const [data, setData] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Load use cases from Supabase (paginated to bypass 1000-row limit)
  useEffect(() => {
    const fetchAll = async () => {
      let all = [];
      let from = 0;
      const PAGE = 500;
      while (true) {
        const { data: rows, error } = await supabase
          .from('use_cases')
          .select('company, industry, category, description, provider')
          .order('company')
          .range(from, from + PAGE - 1);
        if (error || !rows || rows.length === 0) break;
        all = all.concat(rows);
        if (rows.length < PAGE) break;
        from += PAGE;
      }
      setData(all);
      setIsLoadingData(false);
    };
    fetchAll();
  }, []);
  
  const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem('genai_unlocked') === 'true')
  const [showUnlockGate, setShowUnlockGate] = useState(false)
  const [gateStatus, setGateStatus] = useState('idle') // idle | submitting | success | error
  const [consultStatus, setConsultStatus] = useState('idle')
  
  const handleGatedAction = (actionFn) => {
    if (isUnlocked) {
      actionFn()
    } else {
      setShowUnlockGate(true)
    }
  }
  
  const industries = ['All', ...new Set(data.map(item => item.industry).filter(Boolean))].sort()
  const categories = ['All', ...new Set(data.map(item => item.category).filter(Boolean))].sort()
  const providers = ['All', ...new Set(data.map(item => item.provider).filter(Boolean))].sort()

  const filteredData = useMemo(() => {
    let results = data;
    if (searchTerm.trim()) {
      const fuse = new Fuse(data, {
        keys: [
          { name: 'company', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'industry', weight: 0.5 }
        ],
        threshold: 0.35,
        includeScore: true
      });
      results = fuse.search(searchTerm).map(r => r.item);
    }
    results = results.filter(item => {
      const matchesIndustry = selectedIndustry === 'All' || item.industry === selectedIndustry;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesProvider = selectedProvider === 'All' || item.provider === selectedProvider;
      return matchesIndustry && matchesCategory && matchesProvider;
    });
    if (!searchTerm.trim()) {
      results = [...results].sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    }
    return results;
  }, [searchTerm, selectedIndustry, selectedCategory, selectedProvider, data])

  const visibleData = filteredData.slice(0, visibleCount)
  const activeFilters = [searchTerm ? 1 : 0, selectedIndustry !== 'All' ? 1 : 0, selectedCategory !== 'All' ? 1 : 0, selectedProvider !== 'All' ? 1 : 0].reduce((a, b) => a + b, 0);
  const hasAnyFilters = searchTerm || selectedIndustry !== 'All' || selectedCategory !== 'All' || selectedProvider !== 'All';
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15)
  }

  const clearFilters = () => { 
    setSearchTerm(''); setSelectedIndustry('All'); setSelectedCategory('All'); setSelectedProvider('All'); setVisibleCount(15); 
  }

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setConsultStatus('submitting');
    const formData = new FormData(e.target);
    const leadData = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      company: formData.get('company'),
      email: formData.get('email'),
      interest: formData.get('interest'),
      use_case_context: selectedGateCase ? `${selectedGateCase.company} - ${selectedGateCase.category}` : 'General Inquiry'
    };
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (!r.ok) throw new Error('Lead submit failed');
      setConsultStatus('success');
      setTimeout(() => { setIsModalOpen(false); setConsultStatus('idle'); }, 2000);
    } catch (err) {
      console.error(err);
      setConsultStatus('error');
    }
  }

  const handleGateSubmit = async (e) => {
    e.preventDefault();
    setGateStatus('submitting');
    const formData = new FormData(e.target);
    const leadData = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      company: formData.get('company'),
      email: formData.get('email'),
      interest: 'Gate Unlock',
      use_case_context: 'Unlocking Analytics & Filters'
    };
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (!r.ok) throw new Error('Lead submit failed');
      setGateStatus('success');
      localStorage.setItem('genai_unlocked', 'true');
      setIsUnlocked(true);
      setTimeout(() => { setShowUnlockGate(false); setGateStatus('idle'); }, 1500);
    } catch (err) {
      console.error(err);
      setGateStatus('error');
    }
  }

  const renderInd = (opt, isTrigger) => {
    const c = opt === 'All' ? '#ffffff' : (industryColors[opt] || '#94a3b8');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="dd-dot" style={{ background: c, boxShadow: `0 0 6px ${c}80` }} />
        <span style={{ color: isTrigger ? 'white' : 'inherit' }}>{opt === 'All' ? t.filters.allIndustriesLabel : opt}</span>
      </div>
    );
  };
  const renderCat = (opt, isTrigger) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: isTrigger ? '#c084fc' : '#9a6bff', display: 'flex' }}>{getCategoryIcon(opt)}</span>
      <span style={{ color: isTrigger ? 'white' : 'inherit' }}>{opt === 'All' ? t.filters.allAgentTypesLabel : opt}</span>
    </div>
  );
  const renderProv = (opt, isTrigger) => (
    <span style={{ color: isTrigger ? 'white' : 'inherit', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
      {opt === 'All' ? t.filters.allProvidersLabel || 'All Providers' : opt.toUpperCase()}
    </span>
  );

  return (
    <>
      <Background />
      <Chatbot lang={lang} />

      <div className="app">
        <div className="topbar">
          <div className="topbar-brand">
            <div className="mark">
              <Icons.Sparkles size={14} color="#00e5ff" strokeWidth={2.5} />
            </div>
            <span>GenAI Use Cases</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: '0.7rem', color: 'var(--ink-400)', marginLeft: 6 }}>v2.6</span>
          </div>
          <div className="topbar-status">
            <span className="dot" />
            <span>STREAM · {filteredData.length.toLocaleString()} INDEXED · {isLoadingData ? 'FETCHING' : 'SUPABASE OK'}</span>
          </div>
          <div className="topbar-tools">
            <div className="lang-pill">
              <button className={lang === 'it' ? 'active' : ''} onClick={() => setLang('it')}>IT</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <a href="https://www.linkedin.com/in/matteo-favilli/" target="_blank" rel="noopener noreferrer" className="icon-btn" title="LinkedIn">
              <Icons.Linkedin size={16} />
            </a>
          </div>
        </div>

        <div className="hero">
          <div className="hero-pill">
            <span style={{ marginLeft: 16 }}>{t.hero.badge}</span>
          </div>
          <h1>
            <span className="num">{t.hero.titleNumber}</span> {t.hero.titlePart1}
            <span className="stroke">{t.hero.titlePart2}</span>
          </h1>
          <p className="hero-sub">{t.hero.subtitle}</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="v">{t.hero.stat1Value}<small>+</small></div>
              <div className="k">{t.hero.stat1Label}</div>
            </div>
            <div className="hero-stat">
              <div className="v">{t.hero.stat2Value}</div>
              <div className="k">{t.hero.stat2Label}</div>
            </div>
            <div className="hero-stat">
              <div className="v">{t.hero.stat3Value}</div>
              <div className="k">{t.hero.stat3Label}</div>
            </div>
            <div className="hero-stat">
              <div className="v">LIVE</div>
              <div className="k">Sync · Supabase</div>
            </div>
          </div>
        </div>

        <div className="view-rail">
          <button className={'view-tab' + (activeView === 'grid' ? ' is-active' : '')} onClick={() => setActiveView('grid')}>
            <Icons.LayoutGrid size={15} /> {t.nav.database}
          </button>
          <button className={'view-tab' + (activeView === 'analytics' ? ' is-active' : '')} onClick={() => handleGatedAction(() => setActiveView('analytics'))}>
            <Icons.BarChart3 size={15} /> {t.nav.analytics}
          </button>
          <div className="view-rail-divider" />
          <button className="cta-tab" onClick={() => { setSelectedGateCase({ company: 'Your Data Strategy' }); setIsModalOpen(true); }}>
            <Icons.Briefcase size={15} /> {t.nav.cta}
          </button>
        </div>

        {activeView === 'grid' ? (
          <>
            <div className="controls">
              <div className="controls-meta">
                <span><span className="corner-tick">⌐</span> INDEX · ACTIVE FILTERS: <span style={{ color: 'var(--plasma-cyan)' }}>{activeFilters}</span></span>
                <span>QUERY · {filteredData.length.toString().padStart(4, '0')} / {data.length.toString().padStart(4, '0')} <span className="corner-tick">¬</span></span>
              </div>

              <div className="search-wrap">
                <Icons.Search size={20} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-300)' }} />
                <input
                  className="search-input"
                  type="text"
                  placeholder={t.search.placeholder}
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setVisibleCount(15); }}
                />
                <span className="search-kbd">⌘ K</span>
              </div>

              <div className="filters-row" onClick={(e) => {
                if (!isUnlocked) {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowUnlockGate(true);
                }
              }}>
                <div style={{ flex: 1, pointerEvents: isUnlocked ? 'auto' : 'none' }}>
                  <CustomDropdown options={industries} value={selectedIndustry} onChange={v => { setSelectedIndustry(v); setVisibleCount(15); }} placeholder={t.filters.allIndustriesLabel} renderItem={renderInd} />
                </div>
                <div style={{ flex: 1, pointerEvents: isUnlocked ? 'auto' : 'none' }}>
                  <CustomDropdown options={categories} value={selectedCategory} onChange={v => { setSelectedCategory(v); setVisibleCount(15); }} placeholder={t.filters.allAgentTypesLabel} renderItem={renderCat} />
                </div>
                <div style={{ flex: 1, pointerEvents: isUnlocked ? 'auto' : 'none' }}>
                  <CustomDropdown options={providers} value={selectedProvider} onChange={v => { setSelectedProvider(v); setVisibleCount(15); }} placeholder={t.filters.allProvidersLabel || 'All Providers'} renderItem={renderProv} />
                </div>
                {hasAnyFilters && (
                  <button className="clear-btn" onClick={clearFilters} title="Clear filters">
                    <Icons.FilterX size={18} />
                  </button>
                )}
              </div>

              <div className="results-bar">
                <span>SHOWING <span className="count">{visibleData.length}</span> · OF {filteredData.length} ACTIVE</span>
                <span>· SORT A→Z · {lang.toUpperCase()}</span>
              </div>
            </div>

            <div className="grid">
              {visibleData.map((u, i) => (
                <UseCaseCard key={u.company + i} useCase={u} index={i} t={t} onOpenGate={() => { setSelectedGateCase(u); setIsModalOpen(true); }} />
              ))}
              {filteredData.length === 0 && !isLoadingData && (
                <div className="empty">
                  <div className="icon-wrap"><Icons.Inbox size={28} /></div>
                  <h3>No results found</h3>
                  <p>Adjust your scanner parameters to locate other use cases.</p>
                  <button className="btn-load" onClick={clearFilters}>Reset Scanners</button>
                </div>
              )}
            </div>

            {visibleCount < filteredData.length && (
              <div className="load-more-bar">
                <button className="btn-load" onClick={handleLoadMore}>
                  Load more <span className="count">+{Math.min(20, filteredData.length - visibleCount)}</span> · {filteredData.length - visibleCount} remaining
                </button>
              </div>
            )}
          </>
        ) : (
          <AnalyticsDashboard data={data} lang={lang} t={t.analytics} />
        )}

        <div className="footer" style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--ink-400)', fontSize: '0.85rem' }}>
          <p>GenAI use cases presented here are aggregated from official public datasets and customer stories from top AI providers (Google Cloud, Anthropic, AWS, Microsoft, OpenAI). This spatial interface is an advanced visualization layer.</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 100 }} onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ background: '#0d0e1a', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid var(--hairline)' }} onClick={e => e.stopPropagation()}>
            <button style={{ float: 'right', color: 'var(--ink-400)' }} onClick={() => setIsModalOpen(false)}><Icons.X size={18} /></button>
            <div style={{ color: 'var(--plasma-cyan)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem' }}><Icons.Briefcase size={14} /> DEEP DIVE · CONSULTING</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>{t.consult?.title || 'You want to know more?'}</h3>
            <p style={{ color: 'var(--ink-300)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Interested in how <strong style={{ color: 'white' }}>{selectedGateCase?.company}</strong> implemented this? Book a free 1:1 to explore how this architecture applies to your organization.
            </p>
            {consultStatus === 'success' ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--plasma-mint)' }}>Request sent successfully! I will contact you soon.</div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleConsultSubmit}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input name="firstName" type="text" required placeholder={t.gate?.firstName || 'First name'} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                  <input name="lastName" type="text" required placeholder={t.gate?.lastName || 'Last name'} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                </div>
                <input name="company" type="text" required placeholder={t.gate?.company || 'Company'} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                <input name="email" type="email" required placeholder={t.gate?.email || 'Work email'} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                <select name="interest" required defaultValue="" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }}>
                  <option value="" disabled>Select an option...</option>
                  <option value="report">Technical Blueprint Report</option>
                  <option value="consulting">Free 1:1 Consulting Session</option>
                  <option value="both">Both</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--ink-300)' }}>
                  <input type="checkbox" required />
                  <span>{t.gate?.privacyConsent || 'I agree to the processing of my personal data according to the Privacy Policy.'}</span>
                </label>
                <button type="submit" disabled={consultStatus === 'submitting'} style={{ padding: '1rem', background: 'var(--plasma-cyan)', color: 'black', fontWeight: 'bold', borderRadius: '8px', marginTop: '1rem' }}>
                  {consultStatus === 'submitting' ? 'Sending...' : (t.consult?.submit || 'Book Free 1:1')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showUnlockGate && !isUnlocked && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 100 }} onClick={() => setShowUnlockGate(false)}>
          <div className="modal-content" style={{ background: '#0d0e1a', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid var(--hairline)' }} onClick={e => e.stopPropagation()}>
            <button style={{ float: 'right', color: 'var(--ink-400)' }} onClick={() => setShowUnlockGate(false)}><Icons.X size={18} /></button>
            <div style={{ color: 'var(--plasma-magenta)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem' }}><Icons.ShieldCheck size={14} /> SECURITY · GATED ACCESS</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>{t.gate?.title || 'Unlock Advanced Intelligence'}</h3>
            <p style={{ color: 'var(--ink-300)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {t.gate?.subtitle || 'Enter your details to unlock the Deep Analytics dashboard and advanced filtering capabilities.'}
            </p>
            {gateStatus === 'success' ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--plasma-mint)' }}>{t.gate?.success || 'Access Granted!'}</div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleGateSubmit}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input name="firstName" type="text" required placeholder={t.gate?.firstName || 'First name'} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                  <input name="lastName" type="text" required placeholder={t.gate?.lastName || 'Last name'} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                </div>
                <input name="company" type="text" required placeholder={t.gate?.company || 'Company'} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                <input name="email" type="email" required placeholder={t.gate?.email || 'Work email'} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--hairline)', color: 'white' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--ink-300)' }}>
                  <input type="checkbox" required />
                  <span>{t.gate?.privacyConsent || 'I agree to the processing of my personal data according to the Privacy Policy.'}</span>
                </label>
                <button type="submit" disabled={gateStatus === 'submitting'} style={{ padding: '1rem', background: 'var(--plasma-magenta)', color: 'white', fontWeight: 'bold', borderRadius: '8px', marginTop: '1rem' }}>
                  {gateStatus === 'submitting' ? 'Unlocking...' : (t.gate?.submit || 'Unlock Access')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default App
