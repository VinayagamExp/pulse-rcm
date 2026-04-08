import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  blue:     "#3B82F6",
  blueA:    "rgba(59,130,246,0.14)",
  emerald:  "#10B981",
  emeraldA: "rgba(16,185,129,0.14)",
  amber:    "#F59E0B",
  amberA:   "rgba(245,158,11,0.14)",
  red:      "#EF4444",
  redA:     "rgba(239,68,68,0.14)",
  purple:   "#8B5CF6",
  purpleA:  "rgba(139,92,246,0.14)",
  orange:   "#F97316",
  orangeA:  "rgba(249,115,22,0.14)",
  // surfaces
  base:     "#0A0B0D",
  surface:  "#13151A",
  panel:    "#0F1117",
  border:   "#1E2128",
  // text
  text:     "#E2E8F0",
  muted:    "#64748B",
  dim:      "#334155",
};

// Legacy alias map for inline references
const COLORS = {
  blue: C.blue,       blueLight: C.blueA,
  teal: C.emerald,    tealLight: C.emeraldA,
  amber: C.amber,     amberLight: C.amberA,
  red: C.red,         redLight: C.redA,
  green: C.emerald,   greenLight: C.emeraldA,
  purple: C.purple,   purpleLight: C.purpleA,
  gray: C.muted,      grayLight: "rgba(100,116,139,0.14)",
  coral: C.orange,    coralLight: C.orangeA,
};

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt  = (n) => "$" + Math.round(n).toLocaleString();
const fmtK = (n) => n >= 1000000
  ? "$" + (n / 1000000).toFixed(2) + "M"
  : "$" + Math.round(n / 1000).toLocaleString() + "K";
const pct  = (n) => Math.round(n * 10) / 10 + "%";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PAYERS = ["BCBS", "Molina MCO", "UHC Community", "Medicare", "Aetna", "Cigna"];
const CPTS = [
  { code: "81455", desc: "Solid tumor panel 51+ genes" },
  { code: "81445", desc: "Solid tumor panel 5-50 genes" },
  { code: "81162", desc: "BRCA1/BRCA2 full seq" },
  { code: "81479", desc: "Unlisted molecular pathology" },
  { code: "81275", desc: "KRAS gene analysis" },
  { code: "81235", desc: "EGFR gene analysis" },
  { code: "81257", desc: "NRAS gene analysis" },
  { code: "81401", desc: "Tier 2 molecular analysis" },
];

const MOCK = {
  summary: {
    totalROI: 2847300,
    recovered: 1240500,
    protected: 986400,
    savings: 620400,
    roiRatio: 11.2,
    accessions: 4820,
    period: "Last 6 months",
  },
  trend: [
    { month: "NOV", recovered: 148000, protected: 122000, savings: 89000 },
    { month: "DEC", recovered: 175000, protected: 138000, savings: 95000 },
    { month: "JAN", recovered: 198000, protected: 155000, savings: 100000 },
    { month: "FEB", recovered: 210000, protected: 168000, savings: 105000 },
    { month: "MAR", recovered: 245000, protected: 195000, savings: 115000 },
    { month: "APR", recovered: 264500, protected: 208400, savings: 116400 },
  ],
  payers: [
    { name: "BCBS",          group: "Commercial",  accessions: 1420, revenue: 986000,  denialBefore: 18.2, denialAfter: 4.1, appealSuccess: 74, avgPaid: 2840, contracted: 3100, roi: 892000  },
    { name: "Molina MCO",    group: "Medicaid MCO", accessions: 820,  revenue: 412000,  denialBefore: 22.5, denialAfter: 5.8, appealSuccess: 61, avgPaid: 1680, contracted: 1900, roi: 398000  },
    { name: "UHC Community", group: "Medicaid MCO", accessions: 640,  revenue: 318000,  denialBefore: 20.1, denialAfter: 4.9, appealSuccess: 65, avgPaid: 1720, contracted: 1950, roi: 312000  },
    { name: "Medicare",      group: "Government",  accessions: 980,  revenue: 524000,  denialBefore: 12.4, denialAfter: 2.8, appealSuccess: 70, avgPaid: 2240, contracted: 2380, roi: 428000  },
    { name: "Aetna",         group: "Commercial",  accessions: 560,  revenue: 368000,  denialBefore: 15.8, denialAfter: 3.5, appealSuccess: 72, avgPaid: 2610, contracted: 2800, roi: 482000  },
    { name: "Cigna",         group: "Commercial",  accessions: 400,  revenue: 248000,  denialBefore: 14.2, denialAfter: 3.1, appealSuccess: 69, avgPaid: 2480, contracted: 2650, roi: 335300  },
  ],
  cpts: [
    { code: "81455", accessions: 1640, contracted: 3200, paid: 2840, denialRate: 8.2,  appealSuccess: 72, totalROI: 984000 },
    { code: "81445", accessions: 820,  contracted: 2100, paid: 1920, denialRate: 7.4,  appealSuccess: 68, totalROI: 412000 },
    { code: "81162", accessions: 540,  contracted: 2800, paid: 2510, denialRate: 9.1,  appealSuccess: 65, totalROI: 318000 },
    { code: "81479", accessions: 680,  contracted: 1800, paid: 1240, denialRate: 32.4, appealSuccess: 48, totalROI: 224000 },
    { code: "81275", accessions: 420,  contracted: 820,  paid: 780,  denialRate: 5.2,  appealSuccess: 74, totalROI: 98000  },
    { code: "81235", accessions: 380,  contracted: 840,  paid: 800,  denialRate: 4.8,  appealSuccess: 76, totalROI: 88000  },
    { code: "81257", accessions: 240,  contracted: 800,  paid: 760,  denialRate: 5.6,  appealSuccess: 71, totalROI: 62000  },
    { code: "81401", accessions: 100,  contracted: 620,  paid: 540,  denialRate: 12.8, appealSuccess: 55, totalROI: 48000  },
  ],
  recovered: {
    appealsSubmitted: 892,
    appealsWon: 641,
    appealsPending: 118,
    appealsLost: 133,
    appealSuccessRate: 71.9,
    avgRecoveryPerAppeal: 1935,
    underpaymentRecovered: 318400,
    authAppealRecovered: 184200,
  },
  protected: {
    authDenialsBefore: 5.8,
    authDenialsAfter: 0.9,
    cleanClaimBefore: 76.2,
    cleanClaimAfter: 94.8,
    timelyFilingSaved: 142800,
    totalProtected: 986400,
  },
  savings: {
    totalHoursSaved: 2840,
    totalLaborSaved: 94800,
    reworkEliminated: 68400,
    fteEquivalent: 1.8,
    tasks: [
      { task: "Claim submission",   hours: 720, rate: 30, monthly: 21600 },
      { task: "Prior auth requests", hours: 680, rate: 33, monthly: 22440 },
      { task: "Denial appeals",     hours: 560, rate: 35, monthly: 19600 },
      { task: "Auth appeals",       hours: 480, rate: 35, monthly: 16800 },
      { task: "Payer follow-up",    hours: 400, rate: 28, monthly: 11200 },
    ],
  },
};

const tabs = ["Overview", "Revenue Recovered", "Revenue Protected", "Cost Savings", "Payer Breakdown", "CPT Analysis"];

// ─── Shared style helpers ─────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 2,
  padding: "14px 16px",
};

const sectionHeader: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: C.muted,
  marginBottom: 14,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "5px 10px",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: C.muted,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: 12,
  borderBottom: `1px solid ${C.border}`,
};

const monoTd: React.CSSProperties = { ...tdStyle, ...MONO };

const trackStyle: React.CSSProperties = {
  height: 4,
  background: C.border,
  borderRadius: 0,
  overflow: "hidden",
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub = undefined, color = undefined }: {
  label: any; value: any; sub?: any; color?: any;
}) {
  return (
    <div style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      borderRight: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      borderLeft: `3px solid ${color || C.dim}`,
      borderRadius: 2,
      padding: "12px 14px",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: color || C.text, ...MONO, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: C.muted, marginTop: 5, letterSpacing: "0.02em" }}>{sub}</div>
      )}
    </div>
  );
}

function StackedBar({ data, keyA, keyB, keyC, height = 180 }) {
  const max = Math.max(...data.map(d => (d[keyA] || 0) + (d[keyB] || 0) + (d[keyC] || 0)));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingBottom: 22, position: "relative" }}>
      {data.map((d, i) => {
        const total = (d[keyA] || 0) + (d[keyB] || 0) + (d[keyC] || 0);
        const h = (total / max) * (height - 28);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", height: h, borderRadius: 0 }}>
              {keyC && <div style={{ flex: d[keyC] / total, background: C.amber }} />}
              {keyB && <div style={{ flex: d[keyB] / total, background: C.emerald }} />}
              {keyA && <div style={{ flex: d[keyA] / total, background: C.blue }} />}
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 5, letterSpacing: "0.06em", ...MONO }}>{d.month || d.name?.split(" ")[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div style={{ ...trackStyle, flex: 1 }}>
      <div style={{ height: 4, width: (val / max * 100) + "%", background: color, borderRadius: 0 }} />
    </div>
  );
}

function DenialBadge({ rate }) {
  const color = rate > 10 ? C.red : rate > 5 ? C.amber : C.emerald;
  const bg    = rate > 10 ? C.redA : rate > 5 ? C.amberA : C.emeraldA;
  return (
    <span style={{ background: bg, color, fontSize: 10, padding: "2px 7px", borderRadius: 2, fontWeight: 600, ...MONO, letterSpacing: "0.03em" }}>
      {pct(rate)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "Corrected" ? C.emerald : status === "Flagged" ? C.red : C.amber;
  const bg    = status === "Corrected" ? C.emeraldA : status === "Flagged" ? C.redA : C.amberA;
  return (
    <span style={{ background: bg, color, fontSize: 10, padding: "2px 7px", borderRadius: 2, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
      {status}
    </span>
  );
}

function GroupBadge({ group }: { group: string }) {
  const color = group === "Commercial" ? C.blue : group === "Government" ? C.emerald : C.amber;
  const bg    = group === "Commercial" ? C.blueA : group === "Government" ? C.emeraldA : C.amberA;
  return (
    <span style={{ background: bg, color, fontSize: 9, padding: "2px 7px", borderRadius: 2, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
      {group}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card }}>
      <div style={sectionHeader}>{title}</div>
      {children}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const s = MOCK.summary;
  const t = MOCK.trend;
  const total = s.recovered + s.protected + s.savings;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Total ROI"          value={fmtK(s.totalROI)}   sub="Last 6 months"                color={C.emerald} />
        <MetricCard label="Revenue Recovered"  value={fmtK(s.recovered)}  sub="Appeals & underpayments"      color={C.blue}    />
        <MetricCard label="Revenue Protected"  value={fmtK(s.protected)}  sub="Denials prevented upfront"    color={C.purple}  />
        <MetricCard label="Cost Savings"       value={fmtK(s.savings)}    sub="Labor & rework eliminated"    color={C.amber}   />
        <MetricCard label="ROI Ratio"          value={s.roiRatio + "x"}   sub="Per $1 spent on automation"   color={C.orange}  />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <SectionCard title="Monthly ROI Trend">
          <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 10 }}>
            {[["Recovered", C.blue], ["Protected", C.emerald], ["Savings", C.amber]].map(([lbl, clr]) => (
              <span key={lbl as string} style={{ display: "flex", alignItems: "center", gap: 5, color: C.muted, letterSpacing: "0.05em" }}>
                <span style={{ width: 8, height: 8, background: clr as string, display: "inline-block", flexShrink: 0 }} />
                {lbl}
              </span>
            ))}
          </div>
          <StackedBar data={t} keyA="recovered" keyB="protected" keyC="savings" height={170} />
        </SectionCard>

        <div style={{ ...card, minWidth: 200, flex: 1 }}>
          <div style={sectionHeader}>ROI Split</div>
          {[
            { label: "Revenue Recovered", val: s.recovered, color: C.blue },
            { label: "Revenue Protected", val: s.protected, color: C.purple },
            { label: "Cost Savings",      val: s.savings,   color: C.amber },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: C.muted }}>{r.label}</span>
                <span style={{ ...MONO, fontWeight: 600, color: C.text }}>{Math.round(r.val / total * 100)}%</span>
              </div>
              <div style={{ ...trackStyle, height: 5 }}>
                <div style={{ height: 5, width: (r.val / total * 100) + "%", background: r.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>Accessions Processed</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text, ...MONO }}>{s.accessions.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <SectionCard title="Top Wins by Payer">
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Payer", "Accessions", "Denial Before", "Denial After", "Appeal Success", "Total ROI"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK.payers.sort((a, b) => b.roi - a.roi).map((p, i) => (
              <tr key={p.name} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>{p.name}</td>
                <td style={{ ...monoTd, color: C.muted }}>{p.accessions.toLocaleString()}</td>
                <td style={tdStyle}><DenialBadge rate={p.denialBefore} /></td>
                <td style={tdStyle}><DenialBadge rate={p.denialAfter} /></td>
                <td style={{ ...monoTd, color: C.muted }}>{pct(p.appealSuccess)}</td>
                <td style={{ ...monoTd, fontWeight: 600, color: C.emerald }}>{fmtK(p.roi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ─── Revenue Recovered tab ────────────────────────────────────────────────────
function RecoveredTab() {
  const r = MOCK.recovered;
  const bars = [
    { label: "Appeals won",  val: r.appealsWon,      color: C.emerald },
    { label: "Pending",      val: r.appealsPending,  color: C.amber   },
    { label: "Lost",         val: r.appealsLost,     color: C.red     },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Total Recovered"       value={fmtK(MOCK.summary.recovered)}   color={C.blue}    />
        <MetricCard label="Appeals Submitted"     value={r.appealsSubmitted.toLocaleString()}                />
        <MetricCard label="Appeal Success Rate"   value={pct(r.appealSuccessRate)}        color={C.emerald} />
        <MetricCard label="Avg Recovery / Appeal" value={fmt(r.avgRecoveryPerAppeal)}                       />
        <MetricCard label="Underpayment Recovered" value={fmtK(r.underpaymentRecovered)} color={C.purple}  />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: 1, minWidth: 200 }}>
          <div style={sectionHeader}>Appeal Outcomes</div>
          {bars.map(b => (
            <div key={b.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: C.muted, letterSpacing: "0.03em" }}>{b.label}</span>
                <span style={{ ...MONO, fontWeight: 600, color: b.color }}>{b.val}</span>
              </div>
              <div style={{ ...trackStyle, height: 6 }}>
                <div style={{ height: 6, width: (b.val / r.appealsSubmitted * 100) + "%", background: b.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, flex: 2, minWidth: 280 }}>
          <div style={sectionHeader}>Underpayment by Payer</div>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Payer", "Contracted Rate", "Avg Paid", "Gap / Claim", "Est. Total Underpaid"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.payers.map((p, i) => {
                const gap = p.contracted - p.avgPaid;
                return (
                  <tr key={p.name} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>{p.name}</td>
                    <td style={{ ...monoTd, color: C.muted }}>{fmt(p.contracted)}</td>
                    <td style={{ ...monoTd, color: C.muted }}>{fmt(p.avgPaid)}</td>
                    <td style={{ ...monoTd, color: gap > 200 ? C.red : C.amber, fontWeight: 600 }}>{fmt(gap)}</td>
                    <td style={{ ...monoTd, fontWeight: 600, color: C.text }}>{fmtK(gap * p.accessions * 0.3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SectionCard title="Recovery Breakdown by Source">
        {[
          { label: "Auto-appeal wins",           val: r.appealsWon * r.avgRecoveryPerAppeal * 0.6, color: C.blue    },
          { label: "Underpayment corrections",   val: r.underpaymentRecovered,                      color: C.purple  },
          { label: "Prior auth appeal recovery", val: r.authAppealRecovered,                         color: C.emerald },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 160, fontSize: 11, color: C.muted, flexShrink: 0, letterSpacing: "0.02em" }}>{item.label}</div>
            <MiniBar val={item.val} max={MOCK.summary.recovered} color={item.color} />
            <div style={{ ...MONO, fontSize: 12, fontWeight: 600, minWidth: 64, textAlign: "right", color: C.text }}>{fmtK(item.val)}</div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ─── Revenue Protected tab ────────────────────────────────────────────────────
function ProtectedTab() {
  const p = MOCK.protected;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Total Protected"        value={fmtK(p.totalProtected)}        color={C.purple}  />
        <MetricCard label="Auth Denial Before"     value={pct(p.authDenialsBefore)}      sub="Pre-automation baseline"                />
        <MetricCard label="Auth Denial After"      value={pct(p.authDenialsAfter)}       sub="Post-automation"         color={C.emerald} />
        <MetricCard label="Clean Claim Rate"       value={pct(p.cleanClaimAfter)}        sub={`Up from ${pct(p.cleanClaimBefore)}`} color={C.emerald} />
        <MetricCard label="Timely Filing Saves"    value={fmtK(p.timelyFilingSaved)}     color={C.blue}    />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: 1, minWidth: 200 }}>
          <div style={sectionHeader}>Auth Denial Rate — Before vs. After</div>
          {[
            { label: "Before automation", val: p.authDenialsBefore, color: C.red     },
            { label: "After automation",  val: p.authDenialsAfter,  color: C.emerald },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: C.muted }}>{item.label}</span>
                <span style={{ ...MONO, fontWeight: 600, color: item.color }}>{pct(item.val)}</span>
              </div>
              <div style={{ ...trackStyle, height: 8 }}>
                <div style={{ height: 8, width: (item.val / p.authDenialsBefore * 100) + "%", background: item.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.emeraldA, borderLeft: `3px solid ${C.emerald}`, borderRadius: 2, fontSize: 11 }}>
            <span style={{ color: C.muted }}>Reduction: </span>
            <span style={{ ...MONO, fontWeight: 600, color: C.emerald }}>
              -{Math.round((p.authDenialsBefore - p.authDenialsAfter) / p.authDenialsBefore * 100)}%
            </span>
          </div>
        </div>

        <div style={{ ...card, flex: 1, minWidth: 200 }}>
          <div style={sectionHeader}>Clean Claim Rate Improvement</div>
          {[
            { label: "Before automation", val: p.cleanClaimBefore, color: C.amber   },
            { label: "After automation",  val: p.cleanClaimAfter,  color: C.emerald },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: C.muted }}>{item.label}</span>
                <span style={{ ...MONO, fontWeight: 600, color: item.color }}>{pct(item.val)}</span>
              </div>
              <div style={{ ...trackStyle, height: 8 }}>
                <div style={{ height: 8, width: item.val + "%", background: item.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.emeraldA, borderLeft: `3px solid ${C.emerald}`, borderRadius: 2, fontSize: 11 }}>
            <span style={{ color: C.muted }}>Delta: </span>
            <span style={{ ...MONO, fontWeight: 600, color: C.emerald }}>
              +{Math.round(p.cleanClaimAfter - p.cleanClaimBefore)}pp
            </span>
          </div>
        </div>

        <div style={{ ...card, flex: 1, minWidth: 200 }}>
          <div style={sectionHeader}>Revenue Protected by Source</div>
          {[
            { label: "Auth denial prevention",    val: 621000,              color: C.purple  },
            { label: "Clean claim improvement",   val: 222600,              color: C.blue    },
            { label: "Timely filing protection",  val: p.timelyFilingSaved, color: C.emerald },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: C.muted }}>{item.label}</span>
                <span style={{ ...MONO, fontWeight: 600, color: C.text }}>{fmtK(item.val)}</span>
              </div>
              <div style={{ ...trackStyle, height: 5 }}>
                <div style={{ height: 5, width: (item.val / p.totalProtected * 100) + "%", background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cost Savings tab ─────────────────────────────────────────────────────────
function SavingsTab() {
  const s = MOCK.savings;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Total Labor Saved"   value={fmtK(s.totalLaborSaved)}          color={C.amber}   />
        <MetricCard label="Total Hours Saved"   value={s.totalHoursSaved.toLocaleString()} sub="Last 6 months"               />
        <MetricCard label="FTE Equivalent"      value={s.fteEquivalent + " FTE"}          sub="Hours / 160 hrs/mo" color={C.orange} />
        <MetricCard label="Rework Eliminated"   value={fmtK(s.reworkEliminated)}          color={C.emerald} />
        <MetricCard label="Total Cost Savings"  value={fmtK(MOCK.summary.savings)}        color={C.blue}    />
      </div>

      <SectionCard title="Hours Saved by Task Type">
        {s.tasks.map(t => (
          <div key={t.task} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 150, fontSize: 11, color: C.muted, flexShrink: 0 }}>{t.task}</div>
            <MiniBar val={t.hours} max={720} color={C.amber} />
            <div style={{ ...MONO, fontSize: 12, fontWeight: 600, minWidth: 48, textAlign: "right", color: C.text }}>{t.hours}h</div>
            <div style={{ ...MONO, fontSize: 11, color: C.emerald, minWidth: 72, textAlign: "right" }}>{fmt(t.monthly)}/mo</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Labor Cost Savings by Role">
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Task Automated", "Hours Saved / Mo", "Hourly Rate", "Monthly Savings", "6-Month Total"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.tasks.map((t, i) => (
              <tr key={t.task} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                <td style={{ ...tdStyle, fontWeight: 500, color: C.text }}>{t.task}</td>
                <td style={{ ...monoTd, color: C.muted }}>{Math.round(t.hours / 6)}h</td>
                <td style={{ ...monoTd, color: C.muted }}>${t.rate}/hr</td>
                <td style={{ ...monoTd, color: C.emerald, fontWeight: 600 }}>{fmt(t.monthly)}</td>
                <td style={{ ...monoTd, fontWeight: 600, color: C.text }}>{fmtK(t.monthly * 6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ─── Payer Breakdown tab ──────────────────────────────────────────────────────
function PayerTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Payers Tracked"           value="6"           />
        <MetricCard label="Best Performing"          value="BCBS"        sub="$892K ROI"             color={C.emerald} />
        <MetricCard label="Highest Denial (Before)"  value="Molina MCO"  sub="22.5% → 5.8%"         color={C.amber}   />
        <MetricCard label="Biggest Underpayment Gap" value="Molina MCO"  sub="$220 avg gap/claim"    color={C.red}     />
      </div>

      <SectionCard title="Payer Performance Table">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                {["Payer", "Group", "Accessions", "Revenue", "Denial Before", "Denial After", "Appeal Success", "Avg Paid", "Contracted", "ROI"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.payers.map((p, i) => (
                <tr key={p.name} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>{p.name}</td>
                  <td style={tdStyle}><GroupBadge group={p.group} /></td>
                  <td style={{ ...monoTd, color: C.muted }}>{p.accessions.toLocaleString()}</td>
                  <td style={{ ...monoTd, color: C.muted }}>{fmtK(p.revenue)}</td>
                  <td style={tdStyle}><DenialBadge rate={p.denialBefore} /></td>
                  <td style={tdStyle}><DenialBadge rate={p.denialAfter} /></td>
                  <td style={{ ...monoTd, color: C.muted }}>{pct(p.appealSuccess)}</td>
                  <td style={{ ...monoTd, color: C.muted }}>{fmt(p.avgPaid)}</td>
                  <td style={{ ...monoTd, color: C.muted }}>{fmt(p.contracted)}</td>
                  <td style={{ ...monoTd, fontWeight: 600, color: C.emerald }}>{fmtK(p.roi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Denial Rate Reduction by Payer">
        {MOCK.payers.map(p => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 110, fontSize: 11, color: C.muted, flexShrink: 0 }}>{p.name}</div>
            <div style={{ flex: 1, position: "relative", height: 8 }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: (p.denialBefore / 25 * 100) + "%", background: C.redA, border: `1px solid ${C.red}` }} />
              <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: (p.denialAfter / 25 * 100) + "%", background: C.emerald }} />
            </div>
            <div style={{ ...MONO, fontSize: 11, minWidth: 100, textAlign: "right" }}>
              <span style={{ color: C.red }}>{pct(p.denialBefore)}</span>
              <span style={{ color: C.muted }}> → </span>
              <span style={{ color: C.emerald }}>{pct(p.denialAfter)}</span>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ─── CPT Analysis tab ─────────────────────────────────────────────────────────
function CPTTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="CPT Codes Tracked"    value="8"                                             />
        <MetricCard label="Highest Denial Rate"  value="81479"             sub="Unlisted — 32.4%" color={C.red}     />
        <MetricCard label="Best Appeal Success"  value="81235 (EGFR)"      sub="76% win rate"     color={C.emerald} />
        <MetricCard label="Stacking Risk Flagged" value="3 claim groups"   sub="KRAS+EGFR+NRAS"   color={C.amber}   />
      </div>

      <SectionCard title="CPT Code Performance">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["CPT", "Description", "Accessions", "Contracted", "Avg Paid", "Gap/Claim", "Denial Rate", "Appeal Success", "ROI"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.cpts.map((c, i) => {
                const desc = CPTS.find(x => x.code === c.code)?.desc || "";
                const gap  = c.contracted - c.paid;
                return (
                  <tr key={c.code} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                    <td style={{ ...monoTd, fontWeight: 600, color: C.blue }}>{c.code}</td>
                    <td style={{ ...tdStyle, color: C.muted, maxWidth: 160 }}>{desc}</td>
                    <td style={{ ...monoTd, color: C.muted }}>{c.accessions.toLocaleString()}</td>
                    <td style={{ ...monoTd, color: C.muted }}>{fmt(c.contracted)}</td>
                    <td style={{ ...monoTd, color: C.muted }}>{fmt(c.paid)}</td>
                    <td style={{ ...monoTd, fontWeight: 600, color: gap > 300 ? C.red : C.amber }}>{fmt(gap)}</td>
                    <td style={tdStyle}><DenialBadge rate={c.denialRate} /></td>
                    <td style={{ ...monoTd, color: C.muted }}>{pct(c.appealSuccess)}</td>
                    <td style={{ ...monoTd, fontWeight: 600, color: C.emerald }}>{fmtK(c.totalROI)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Code Stacking Risk Flags">
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Claim Group", "Codes Billed", "Should Have Been", "Bundling Risk", "Status"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { group: "KRAS + EGFR + NRAS stack",   codes: "81275 + 81235 + 81257", should: "81445 (panel)",       risk: 48200, status: "Under review" },
              { group: "EGFR + 81479 combo",          codes: "81235 + 81479",          should: "81455 (large panel)", risk: 31600, status: "Flagged"      },
              { group: "Multi-gene individual stack", codes: "81401 × 4",              should: "81445 (panel)",       risk: 22400, status: "Corrected"    },
            ].map((row, i) => (
              <tr key={row.group} style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>{row.group}</td>
                <td style={{ ...monoTd, fontSize: 11, color: C.muted }}>{row.codes}</td>
                <td style={{ ...monoTd, color: C.blue }}>{row.should}</td>
                <td style={{ ...monoTd, fontWeight: 600, color: C.red }}>{fmt(row.risk)}</td>
                <td style={tdStyle}><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab]   = useState(0);
  const [dateRange, setDateRange]   = useState("6mo");

  const tabContent = [<OverviewTab />, <RecoveredTab />, <ProtectedTab />, <SavingsTab />, <PayerTab />, <CPTTab />];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: C.text, paddingTop: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 20, background: C.blue, flexShrink: 0 }} />
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.04em", color: C.text }}>
              CLAIMSIQ ROI DASHBOARD
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, paddingLeft: 13, letterSpacing: "0.05em" }}>
            GenomicLab Provider — Mock Data
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="6mo">Last 6 months</option>
            <option value="12mo">Last 12 months</option>
          </select>
          <span style={{
            fontSize: 9, letterSpacing: "0.1em", fontWeight: 600,
            background: C.amberA, color: C.amber,
            border: `1px solid ${C.amber}`,
            padding: "3px 8px", borderRadius: 2,
          }}>
            MOCK DATA
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: "8px 16px",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.06em",
            fontFamily: "var(--font-sans)",
            background: "none",
            border: "none",
            borderBottom: activeTab === i ? `2px solid ${C.blue}` : "2px solid transparent",
            color: activeTab === i ? C.blue : C.muted,
            cursor: "pointer",
            whiteSpace: "nowrap",
            marginBottom: -1,
            transition: "color 0.15s",
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabContent[activeTab]}

      {/* Footer */}
      <div style={{
        marginTop: 24, fontSize: 10, color: C.dim,
        borderTop: `1px solid ${C.border}`, paddingTop: 12,
        display: "flex", justifyContent: "space-between",
        letterSpacing: "0.06em",
        ...MONO,
      }}>
        <span>DATA SOURCE: MOCK — READY FOR LIVE INTEGRATION</span>
        <span>LAST REFRESH: 2026-04-07 00:00 UTC</span>
      </div>
    </div>
  );
}
