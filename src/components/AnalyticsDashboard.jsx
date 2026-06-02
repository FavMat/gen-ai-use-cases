import React, { useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
  LineChart, Line,
} from 'recharts';
import { Icons } from './Icons';
import { industryColors } from '../lib/constants';

const DEFAULT_T = {
  export: 'Export PDF Report',
  exporting: 'Exporting...',
  kpiIntegrations: 'Verified AI Integrations',
  kpiProviders: 'Enterprise AI Vendors',
  kpiParadigms: 'Unique Agent Paradigms',
  matrixTitle: 'Industry Adoption Matrix',
  matrixDesc: 'Deep cross-tabulation of the top 8 industries broken down by the specific types of AI Agents they are deploying.',
  techTitle: 'Multi-Vendor Market Distribution',
  techDesc: 'Foundation-model adoption across the enterprise ecosystem.',
  complexityTitle: 'Deployment Complexity vs Volume',
  complexityDesc: 'Industry deployments mapped against implementation complexity (derived from documentation depth).',
  apexTitle: 'Apex Innovators',
  apexDesc: 'Organizations leading the global AI transformation by deployment count.',
  tooltipAgentType: 'Agent Type',
  tooltipCount: 'Count (%)',
  tooltipIntegrations: 'Total Integrations',
  tooltipComplexity: 'Avg Complexity Score',
  axisVolume: 'Total Use Cases',
  axisComplexity: 'Complexity Score',
  deployments: 'Deployments',
  deploymentsLabel: 'Deployments',
};

const CATEGORY_COLORS = {
  'General': '#00e5ff',
  'Code Agents': '#9a6bff',
  'Security Agents': '#ff3da8',
  'Customer Service Agents': '#4dffb8',
  'Data Agents': '#ffb547',
  'Creative Agents': '#ff7a18',
  'Employee Productivity': '#5ab2ff',
};

// HUD tooltip used by every chart
function HUDTooltip({ active, payload, label, labelHint }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, e) => s + (e.value || 0), 0);
  return (
    <div style={{
      background: 'rgba(8, 9, 18, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(0,229,255,0.35)',
      borderRadius: 10,
      padding: '0.75rem 0.9rem',
      minWidth: 220,
      boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 24px rgba(0,229,255,0.15)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        fontSize: '0.7rem', color: 'var(--ink-400)',
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
      }}>{labelHint || 'TELEMETRY'}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: '1rem', color: 'white', marginBottom: 8,
        paddingBottom: 6, borderBottom: '1px dashed rgba(255,255,255,0.1)',
      }}>{label || payload[0].payload.name || payload[0].name}</div>
      {payload.map((e, i) => {
        const pct = total > 0 ? Math.round((e.value / total) * 100) : 0;
        return (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.78rem', padding: '3px 0', color: 'var(--ink-200)',
          }}>
            <span style={{ color: e.color || e.fill || '#00e5ff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: e.color || e.fill, borderRadius: 2 }} />
              {e.name}
            </span>
            <span style={{ color: 'white' }}>
              <strong>{e.value}</strong>
              {payload.length > 1 && <span style={{ color: 'var(--ink-400)', marginLeft: 4 }}>({pct}%)</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScatterTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(8, 9, 18, 0.95)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${d.fill}88`,
      borderRadius: 10,
      padding: '0.75rem 0.9rem',
      boxShadow: `0 16px 40px rgba(0,0,0,0.6), 0 0 24px ${d.fill}33`,
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: d.fill, fontSize: '1rem', marginBottom: 6 }}>{d.name}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-300)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>Use Cases</span><strong style={{ color: 'white' }}>{d.cases}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>Avg Complexity</span><strong style={{ color: 'white' }}>{d.avgComplexity}</strong>
        </div>
      </div>
    </div>
  );
}

// Mini sparkline for KPI cards
function Sparkline({ color = '#00e5ff', seed = 1 }) {
  const points = useMemo(() => {
    const out = [];
    let v = 50;
    for (let i = 0; i < 18; i++) {
      v += (Math.sin(i * 0.6 + seed) + Math.cos(i * 0.3 + seed * 2)) * 10;
      out.push({ x: i, y: Math.max(20, Math.min(100, v)) });
    }
    return out;
  }, [seed]);
  return (
    <ResponsiveContainer>
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id={'spark-' + seed} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <Line dataKey="y" type="monotone" stroke={`url(#spark-${seed})`} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsDashboard({ data, t: tProp = {}, lang }) {
  const t = { ...DEFAULT_T, ...tProp };
  const dashRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // -- Industry × Category cross-tab (top 8)
  const matrix = useMemo(() => {
    const m = {}; const cats = new Set();
    data.forEach(item => {
      const ind = item.industry || 'General';
      const cat = item.category || 'General Agent';
      if (!m[ind]) m[ind] = { name: ind, total: 0 };
      m[ind][cat] = (m[ind][cat] || 0) + 1;
      m[ind].total += 1;
      cats.add(cat);
    });
    return {
      rows: Object.values(m).sort((a, b) => b.total - a.total).slice(0, 8),
      cats: Array.from(cats),
    };
  }, [data]);

  // -- Provider radar
  const radar = useMemo(() => {
    const t = {}; data.forEach(i => { const p = i.provider || 'Other'; t[p] = (t[p] || 0) + 1; });
    const max = Math.max(...Object.values(t), 1);
    return Object.entries(t).map(([subject, A]) => ({ subject, A, fullMark: max })).sort((a, b) => b.A - a.A);
  }, [data]);

  // -- Industry scatter
  const scatter = useMemo(() => {
    const s = {};
    data.forEach(i => {
      const ind = i.industry || 'General';
      if (!s[ind]) s[ind] = { name: ind, cases: 0, totalWords: 0 };
      s[ind].cases += 1;
      s[ind].totalWords += (i.description || '').split(' ').length;
    });
    return Object.values(s).map(v => ({
      name: v.name,
      cases: v.cases,
      avgComplexity: Math.round(v.totalWords / v.cases),
      fill: industryColors[v.name] || '#00e5ff',
    })).filter(v => v.cases > 2);
  }, [data]);

  // -- Top companies
  const top = useMemo(() => {
    const c = {};
    data.forEach(i => { 
      const comp = i.company || 'Unknown';
      c[comp] = (c[comp] || 0) + 1; 
    });
    return Object.entries(c).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [data]);

  // -- Export PDF (uses html2canvas + jspdf dynamically)
  const exportPDF = async () => {
    if (!dashRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(dashRef.current, {
        backgroundColor: '#030308', scale: 1.5, useCORS: true, logging: false,
      });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 1.5, canvas.height / 1.5] });
      pdf.addImage(img, 'PNG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
      pdf.save(`GenAI_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return (
    <div ref={dashRef} className="analytics">
      {/* HUD toolbar */}
      <div className="analytics-toolbar">
        <div className="group">
          <span className="session">SESSION ACTIVE</span>
          <span>· STREAM ID 7F-2A</span>
          <span style={{ color: 'var(--ink-200)' }}>· {now} UTC</span>
        </div>
        <button className="btn-export" onClick={exportPDF} disabled={exporting}>
          {Icons.Download({ size: 12 })}
          {exporting ? t.exporting : t.export}
        </button>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip">
        <KPI
          icon={Icons.BrainCircuit({ size: 16 })} color="#00e5ff"
          label={t.kpiIntegrations} value={data.length} seed={1}
        />
        <KPI
          icon={Icons.Network({ size: 16 })} color="#9a6bff"
          label={t.kpiProviders} value={radar.length} seed={2}
        />
        <KPI
          icon={Icons.Activity({ size: 16 })} color="#4dffb8"
          label={t.kpiParadigms} value={matrix.cats.length} seed={3}
        />
      </div>

      {/* Adoption matrix */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">
              {Icons.BarChart3({ size: 18, color: '#00e5ff' })}
              {t.matrixTitle}
              <span className="tag">STACKED · TOP 8</span>
            </div>
            <p className="panel-desc">{t.matrixDesc}</p>
          </div>
          <div className="panel-id">CHART · 01<br/>{matrix.rows.length} INDUSTRIES</div>
        </div>
        <div style={{ height: 480, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={matrix.rows} margin={{ top: 20, right: 30, left: 0, bottom: 140 }}>
              <defs>
                {matrix.cats.map(cat => {
                  const c = CATEGORY_COLORS[cat] || '#00e5ff';
                  return (
                    <linearGradient key={cat} id={'g-'+cat.replace(/\s/g,'')} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.95}/>
                      <stop offset="100%" stopColor={c} stopOpacity={0.55}/>
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(140,160,220,0.10)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(140,160,220,0.4)" angle={-35} textAnchor="end" interval={0} dy={6} tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(140,160,220,0.4)" tick={{ fontSize: 11 }} />
              <RechartsTooltip content={<HUDTooltip labelHint="INDUSTRY BREAKDOWN" />} cursor={{ fill: 'rgba(0,229,255,0.05)' }} />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 16 }} iconType="square" />
              {matrix.cats.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} stackId="a"
                     fill={`url(#g-${cat.replace(/\s/g,'')})`}
                     stroke={CATEGORY_COLORS[cat] || '#00e5ff'} strokeWidth={0.5}
                     radius={idx === matrix.cats.length - 1 ? [4, 4, 0, 0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Scatter */}
      <div className="charts-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">
                {Icons.Cpu({ size: 18, color: '#9a6bff' })}
                {t.techTitle}
                <span className="tag" style={{ color: '#9a6bff', borderColor: 'rgba(154,107,255,0.35)', background: 'rgba(154,107,255,0.08)' }}>RADAR</span>
              </div>
              <p className="panel-desc">{t.techDesc}</p>
            </div>
            <div className="panel-id">CHART · 02<br/>{radar.length} VENDORS</div>
          </div>
          <div style={{ height: 340, width: '100%' }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radar}>
                <defs>
                  <radialGradient id="radar-fill">
                    <stop offset="0%" stopColor="#9a6bff" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#9a6bff" stopOpacity={0.05} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(154,107,255,0.18)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#e1e5f4', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name={t.deploymentsLabel} dataKey="A"
                       stroke="#00e5ff" strokeWidth={2}
                       fill="url(#radar-fill)" fillOpacity={1}
                       dot={{ r: 4, fill: '#00e5ff', stroke: '#fff', strokeWidth: 1 }} />
                <RechartsTooltip content={<HUDTooltip labelHint="PROVIDER" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">
                {Icons.Database({ size: 18, color: '#4dffb8' })}
                {t.complexityTitle}
                <span className="tag" style={{ color: '#4dffb8', borderColor: 'rgba(77,255,184,0.35)', background: 'rgba(77,255,184,0.08)' }}>SCATTER</span>
              </div>
              <p className="panel-desc">{t.complexityDesc}</p>
            </div>
            <div className="panel-id">CHART · 03<br/>X·CASES Y·CMPX</div>
          </div>
          <div style={{ height: 340, width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 36, left: 16 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="rgba(140,160,220,0.10)" />
                <XAxis type="number" dataKey="cases" stroke="rgba(140,160,220,0.4)" tick={{ fontSize: 11 }}
                       label={{ value: t.axisVolume, position: 'insideBottom', offset: -8, fill: 'rgba(140,160,220,0.7)', fontSize: 11 }} />
                <YAxis type="number" dataKey="avgComplexity" stroke="rgba(140,160,220,0.4)" tick={{ fontSize: 11 }}
                       label={{ value: t.axisComplexity, angle: -90, position: 'insideLeft', fill: 'rgba(140,160,220,0.7)', fontSize: 11 }} />
                <ZAxis type="number" range={[140, 540]} />
                <RechartsTooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 6', stroke: 'rgba(0,229,255,0.4)' }} />
                {scatter.map((s, i) => (
                  <Scatter key={i} name={s.name} data={[s]} fill={s.fill}
                           shape={(props) => (
                             <g>
                               <circle cx={props.cx} cy={props.cy} r={14} fill={props.fill} opacity={0.15} />
                               <circle cx={props.cx} cy={props.cy} r={6} fill={props.fill} stroke="#fff" strokeWidth={1} />
                             </g>
                           )} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Apex innovators */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">
              {Icons.Users({ size: 18, color: '#ffb547' })}
              {t.apexTitle}
              <span className="tag" style={{ color: '#ffb547', borderColor: 'rgba(255,181,71,0.35)', background: 'rgba(255,181,71,0.08)' }}>LEADERBOARD</span>
            </div>
            <p className="panel-desc">{t.apexDesc}</p>
          </div>
          <div className="panel-id">CHART · 04<br/>TOP {top.length}</div>
        </div>
        <div className="apex-list">
          {top.map((c, i) => (
            <div key={c.name} className={'apex-row' + (i < 3 ? ' top-' + (i + 1) : '')}>
              <div className="meta">
                <div className="rank-tag">#{i + 1}</div>
                <div>
                  <div className="name">{c.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                    {c.count > 4 ? 'PLATINUM' : c.count > 2 ? 'GOLD' : 'SILVER'} · ACTIVE
                  </div>
                </div>
              </div>
              <div className="stat">
                <div className="stat-v">{c.count}</div>
                <div className="stat-k">{t.deployments}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, color, label, value, seed }) {
  return (
    <div className="kpi" style={{ '--c': color }}>
      <div className="kpi-head">
        <span>STREAM · {String(seed).padStart(2, '0')}</span>
        <span className="icon-wrap" style={{ background: `${color}1a`, borderColor: `${color}44`, color }}>{icon}</span>
      </div>
      <div className="kpi-val" style={{ background: `linear-gradient(180deg, #ffffff, #c8d0ff 60%, ${color} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 18px ${color}55)` }}>
        {value.toLocaleString()}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-spark">
        <Sparkline color={color} seed={seed} />
      </div>
    </div>
  );
}
