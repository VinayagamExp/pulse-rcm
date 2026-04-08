import { useState, useEffect, useRef } from "react";

const COLORS = {
  blue: "#378ADD", blueLight: "#E6F1FB",
  teal: "#1D9E75", tealLight: "#E1F5EE",
  amber: "#BA7517", amberLight: "#FAEEDA",
  red: "#E24B4A", redLight: "#FCEBEB",
  green: "#639922", greenLight: "#EAF3DE",
  purple: "#7F77DD", purpleLight: "#EEEDFE",
  gray: "#888780", grayLight: "#F1EFE8",
  coral: "#D85A30", coralLight: "#FAECE7",
};

const fmt = (n) => "$" + Math.round(n).toLocaleString();
const fmtK = (n) => n >= 1000000 ? "$" + (n/1000000).toFixed(2) + "M" : "$" + Math.round(n/1000).toLocaleString() + "K";
const pct = (n) => Math.round(n * 10) / 10 + "%";

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
    period: "Last 6 months"
  },
  trend: [
    { month: "Nov", recovered: 148000, protected: 122000, savings: 89000 },
    { month: "Dec", recovered: 175000, protected: 138000, savings: 95000 },
    { month: "Jan", recovered: 198000, protected: 155000, savings: 100000 },
    { month: "Feb", recovered: 210000, protected: 168000, savings: 105000 },
    { month: "Mar", recovered: 245000, protected: 195000, savings: 115000 },
    { month: "Apr", recovered: 264500, protected: 208400, savings: 116400 },
  ],
  payers: [
    { name: "BCBS", group: "Commercial", accessions: 1420, revenue: 986000, denialBefore: 18.2, denialAfter: 4.1, appealSuccess: 74, avgPaid: 2840, contracted: 3100, roi: 892000 },
    { name: "Molina MCO", group: "Medicaid MCO", accessions: 820, revenue: 412000, denialBefore: 22.5, denialAfter: 5.8, appealSuccess: 61, avgPaid: 1680, contracted: 1900, roi: 398000 },
    { name: "UHC Community", group: "Medicaid MCO", accessions: 640, revenue: 318000, denialBefore: 20.1, denialAfter: 4.9, appealSuccess: 65, avgPaid: 1720, contracted: 1950, roi: 312000 },
    { name: "Medicare", group: "Government", accessions: 980, revenue: 524000, denialBefore: 12.4, denialAfter: 2.8, appealSuccess: 70, avgPaid: 2240, contracted: 2380, roi: 428000 },
    { name: "Aetna", group: "Commercial", accessions: 560, revenue: 368000, denialBefore: 15.8, denialAfter: 3.5, appealSuccess: 72, avgPaid: 2610, contracted: 2800, roi: 482000 },
    { name: "Cigna", group: "Commercial", accessions: 400, revenue: 248000, denialBefore: 14.2, denialAfter: 3.1, appealSuccess: 69, avgPaid: 2480, contracted: 2650, roi: 335300 },
  ],
  cpts: [
    { code: "81455", accessions: 1640, contracted: 3200, paid: 2840, denialRate: 8.2, appealSuccess: 72, totalROI: 984000 },
    { code: "81445", accessions: 820, contracted: 2100, paid: 1920, denialRate: 7.4, appealSuccess: 68, totalROI: 412000 },
    { code: "81162", accessions: 540, contracted: 2800, paid: 2510, denialRate: 9.1, appealSuccess: 65, totalROI: 318000 },
    { code: "81479", accessions: 680, contracted: 1800, paid: 1240, denialRate: 32.4, appealSuccess: 48, totalROI: 224000 },
    { code: "81275", accessions: 420, contracted: 820, paid: 780, denialRate: 5.2, appealSuccess: 74, totalROI: 98000 },
    { code: "81235", accessions: 380, contracted: 840, paid: 800, denialRate: 4.8, appealSuccess: 76, totalROI: 88000 },
    { code: "81257", accessions: 240, contracted: 800, paid: 760, denialRate: 5.6, appealSuccess: 71, totalROI: 62000 },
    { code: "81401", accessions: 100, contracted: 620, paid: 540, denialRate: 12.8, appealSuccess: 55, totalROI: 48000 },
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
      { task: "Claim submission", hours: 720, rate: 30, monthly: 21600 },
      { task: "Prior auth requests", hours: 680, rate: 33, monthly: 22440 },
      { task: "Denial appeals", hours: 560, rate: 35, monthly: 19600 },
      { task: "Auth appeals", hours: 480, rate: 35, monthly: 16800 },
      { task: "Payer follow-up", hours: 400, rate: 28, monthly: 11200 },
    ]
  }
};

const tabs = ["Overview", "Revenue Recovered", "Revenue Protected", "Cost Savings", "Payer Breakdown", "CPT Analysis"];

function MetricCard({ label, value, sub = undefined, color = undefined }: { label: any; value: any; sub?: any; color?: any }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SimpleBarChart({ data, keyA, keyB, keyC, height = 200 }) {
  const max = Math.max(...data.map(d => (d[keyA] || 0) + (d[keyB] || 0) + (d[keyC] || 0)));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, paddingBottom: 20, position: "relative" }}>
      {data.map((d, i) => {
        const total = (d[keyA] || 0) + (d[keyB] || 0) + (d[keyC] || 0);
        const h = (total / max) * (height - 30);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", height: h }}>
              {keyC && <div style={{ flex: d[keyC] / total, background: COLORS.amber, borderRadius: "2px 2px 0 0" }} />}
              {keyB && <div style={{ flex: d[keyB] / total, background: COLORS.teal }} />}
              {keyA && <div style={{ flex: d[keyA] / total, background: COLORS.blue, borderRadius: keyC ? 0 : "2px 2px 0 0" }} />}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>{d.month || d.name?.split(" ")[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

function DenialBadge({ rate }) {
  const color = rate > 10 ? COLORS.red : rate > 5 ? COLORS.amber : COLORS.green;
  const bg = rate > 10 ? COLORS.redLight : rate > 5 ? COLORS.amberLight : COLORS.greenLight;
  return <span style={{ background: bg, color, fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{pct(rate)}</span>;
}

function OverviewTab() {
  const s = MOCK.summary;
  const t = MOCK.trend;
  const total = s.recovered + s.protected + s.savings;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Total ROI" value={fmtK(s.totalROI)} sub="Last 6 months" color={COLORS.teal} />
        <MetricCard label="Revenue Recovered" value={fmtK(s.recovered)} sub="Via appeals & underpayments" color={COLORS.blue} />
        <MetricCard label="Revenue Protected" value={fmtK(s.protected)} sub="Denials prevented upfront" color={COLORS.purple} />
        <MetricCard label="Cost Savings" value={fmtK(s.savings)} sub="Labor & rework eliminated" color={COLORS.amber} />
        <MetricCard label="ROI Ratio" value={s.roiRatio + "x"} sub="Per $1 spent on automation" color={COLORS.coral} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 260, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Monthly ROI trend</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11, color: "var(--color-text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.blue, display: "inline-block" }} />Recovered</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.teal, display: "inline-block" }} />Protected</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.amber, display: "inline-block" }} />Savings</span>
          </div>
          <SimpleBarChart data={t} keyA="recovered" keyB="protected" keyC="savings" height={180} />
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>ROI split</div>
          {[
            { label: "Revenue Recovered", val: s.recovered, color: COLORS.blue },
            { label: "Revenue Protected", val: s.protected, color: COLORS.purple },
            { label: "Cost Savings", val: s.savings, color: COLORS.amber },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{r.label}</span>
                <span style={{ fontWeight: 500 }}>{Math.round(r.val / total * 100)}%</span>
              </div>
              <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3 }}>
                <div style={{ height: 6, width: (r.val / total * 100) + "%", background: r.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--color-text-secondary)" }}>Total accessions processed</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{s.accessions.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Top wins by payer</div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Payer", "Accessions", "Denial rate before", "Denial rate after", "Appeal success", "Total ROI"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "var(--color-text-secondary)", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK.payers.sort((a,b) => b.roi - a.roi).map((p, i) => (
              <tr key={p.name} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ padding: "6px 8px", fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "6px 8px" }}>{p.accessions.toLocaleString()}</td>
                <td style={{ padding: "6px 8px" }}><DenialBadge rate={p.denialBefore} /></td>
                <td style={{ padding: "6px 8px" }}><DenialBadge rate={p.denialAfter} /></td>
                <td style={{ padding: "6px 8px" }}>{pct(p.appealSuccess)}</td>
                <td style={{ padding: "6px 8px", fontWeight: 500, color: COLORS.teal }}>{fmtK(p.roi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecoveredTab() {
  const r = MOCK.recovered;
  const bars = [
    { label: "Appeals won", val: r.appealsWon, color: COLORS.teal },
    { label: "Pending", val: r.appealsPending, color: COLORS.amber },
    { label: "Lost", val: r.appealsLost, color: COLORS.red },
  ];
  const maxBar = r.appealsWon;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Total recovered" value={fmtK(MOCK.summary.recovered)} color={COLORS.blue} />
        <MetricCard label="Appeals submitted" value={r.appealsSubmitted.toLocaleString()} />
        <MetricCard label="Appeal success rate" value={pct(r.appealSuccessRate)} color={COLORS.teal} />
        <MetricCard label="Avg recovery / appeal" value={fmt(r.avgRecoveryPerAppeal)} />
        <MetricCard label="Underpayment recovered" value={fmtK(r.underpaymentRecovered)} color={COLORS.purple} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Appeal outcomes</div>
          {bars.map(b => (
            <div key={b.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{b.label}</span>
                <span style={{ fontWeight: 500 }}>{b.val}</span>
              </div>
              <div style={{ height: 8, background: "var(--color-background-secondary)", borderRadius: 4 }}>
                <div style={{ height: 8, width: (b.val / r.appealsSubmitted * 100) + "%", background: b.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 2, minWidth: 280, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Underpayment by payer</div>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Payer", "Contracted rate", "Avg paid", "Gap / claim", "Est. total underpaid"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 6px", color: "var(--color-text-secondary)", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.payers.map(p => {
                const gap = p.contracted - p.avgPaid;
                return (
                  <tr key={p.name} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "6px 6px", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: "6px 6px" }}>{fmt(p.contracted)}</td>
                    <td style={{ padding: "6px 6px" }}>{fmt(p.avgPaid)}</td>
                    <td style={{ padding: "6px 6px", color: gap > 200 ? COLORS.red : COLORS.amber }}>{fmt(gap)}</td>
                    <td style={{ padding: "6px 6px", fontWeight: 500 }}>{fmtK(gap * p.accessions * 0.3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Recovery breakdown by source</div>
        {[
          { label: "Auto-appeal wins", val: r.appealsWon * r.avgRecoveryPerAppeal * 0.6, color: COLORS.blue },
          { label: "Underpayment corrections", val: r.underpaymentRecovered, color: COLORS.purple },
          { label: "Prior auth appeal recovery", val: r.authAppealRecovered, color: COLORS.teal },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 120, fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{item.label}</div>
            <div style={{ flex: 1, height: 8, background: "var(--color-background-secondary)", borderRadius: 4 }}>
              <div style={{ height: 8, width: (item.val / MOCK.summary.recovered * 100) + "%", background: item.color, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, minWidth: 60, textAlign: "right" }}>{fmtK(item.val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtectedTab() {
  const p = MOCK.protected;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Total protected" value={fmtK(p.totalProtected)} color={COLORS.purple} />
        <MetricCard label="Auth denial rate before" value={pct(p.authDenialsBefore)} sub="Pre-automation baseline" />
        <MetricCard label="Auth denial rate after" value={pct(p.authDenialsAfter)} color={COLORS.teal} sub="Post-automation" />
        <MetricCard label="Clean claim rate" value={pct(p.cleanClaimAfter)} sub={`Up from ${pct(p.cleanClaimBefore)}`} color={COLORS.teal} />
        <MetricCard label="Timely filing saves" value={fmtK(p.timelyFilingSaved)} color={COLORS.blue} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Auth denial rate: before vs. after</div>
          {[
            { label: "Before automation", val: p.authDenialsBefore, color: COLORS.red },
            { label: "After automation", val: p.authDenialsAfter, color: COLORS.teal },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span style={{ fontWeight: 500, color: item.color }}>{pct(item.val)}</span>
              </div>
              <div style={{ height: 12, background: "var(--color-background-secondary)", borderRadius: 6 }}>
                <div style={{ height: 12, width: (item.val / p.authDenialsBefore * 100) + "%", background: item.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 10, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Improvement: </span>
            <span style={{ fontWeight: 500, color: COLORS.teal }}>-{Math.round((p.authDenialsBefore - p.authDenialsAfter) / p.authDenialsBefore * 100)}% reduction</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Clean claim rate improvement</div>
          {[
            { label: "Before automation", val: p.cleanClaimBefore, color: COLORS.amber },
            { label: "After automation", val: p.cleanClaimAfter, color: COLORS.teal },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span style={{ fontWeight: 500, color: item.color }}>{pct(item.val)}</span>
              </div>
              <div style={{ height: 12, background: "var(--color-background-secondary)", borderRadius: 6 }}>
                <div style={{ height: 12, width: item.val + "%", background: item.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 10, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Delta: </span>
            <span style={{ fontWeight: 500, color: COLORS.teal }}>+{Math.round(p.cleanClaimAfter - p.cleanClaimBefore)}pp improvement</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Revenue protected by source</div>
          {[
            { label: "Auth denial prevention", val: 621000, color: COLORS.purple },
            { label: "Clean claim improvement", val: 222600, color: COLORS.blue },
            { label: "Timely filing protection", val: p.timelyFilingSaved, color: COLORS.teal },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span style={{ fontWeight: 500 }}>{fmtK(item.val)}</span>
              </div>
              <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3 }}>
                <div style={{ height: 6, width: (item.val / p.totalProtected * 100) + "%", background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SavingsTab() {
  const s = MOCK.savings;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Total labor saved" value={fmtK(s.totalLaborSaved)} color={COLORS.amber} />
        <MetricCard label="Total hours saved" value={s.totalHoursSaved.toLocaleString()} sub="Last 6 months" />
        <MetricCard label="FTE equivalent" value={s.fteEquivalent + " FTE"} sub="Hours saved / 160 hrs/mo" color={COLORS.coral} />
        <MetricCard label="Rework eliminated" value={fmtK(s.reworkEliminated)} color={COLORS.teal} />
        <MetricCard label="Total cost savings" value={fmtK(MOCK.summary.savings)} color={COLORS.green} />
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Hours saved by task type</div>
        {s.tasks.map(t => (
          <div key={t.task} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 140, fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{t.task}</div>
            <div style={{ flex: 1, height: 10, background: "var(--color-background-secondary)", borderRadius: 5 }}>
              <div style={{ height: 10, width: (t.hours / 720 * 100) + "%", background: COLORS.amber, borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, minWidth: 50, textAlign: "right" }}>{t.hours}h</div>
            <div style={{ fontSize: 12, color: COLORS.teal, minWidth: 60, textAlign: "right" }}>{fmt(t.monthly)}/mo</div>
          </div>
        ))}
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Labor cost savings by role</div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Task automated", "Hours saved / mo", "Hourly rate", "Monthly savings", "6-month total"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "var(--color-text-secondary)", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.tasks.map(t => (
              <tr key={t.task} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ padding: "6px 8px", fontWeight: 500 }}>{t.task}</td>
                <td style={{ padding: "6px 8px" }}>{Math.round(t.hours / 6)}h</td>
                <td style={{ padding: "6px 8px" }}>${t.rate}/hr</td>
                <td style={{ padding: "6px 8px", color: COLORS.teal, fontWeight: 500 }}>{fmt(t.monthly)}</td>
                <td style={{ padding: "6px 8px", fontWeight: 500 }}>{fmtK(t.monthly * 6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PayerTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="Payers tracked" value="6" />
        <MetricCard label="Best performing" value="BCBS" sub="$892K ROI" color={COLORS.teal} />
        <MetricCard label="Highest denial rate (before)" value="Molina MCO" sub="22.5% → 5.8%" color={COLORS.amber} />
        <MetricCard label="Biggest underpayment gap" value="Molina MCO" sub="$220 avg gap/claim" color={COLORS.red} />
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Payer performance table</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Payer", "Group", "Accessions", "Revenue", "Denial before", "Denial after", "Appeal success", "Avg paid", "Contracted", "ROI"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "var(--color-text-secondary)", fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.payers.map(p => (
                <tr key={p.name} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "7px 8px" }}><span style={{ fontSize: 10, background: p.group === "Commercial" ? COLORS.blueLight : p.group === "Government" ? COLORS.tealLight : COLORS.amberLight, color: p.group === "Commercial" ? COLORS.blue : p.group === "Government" ? COLORS.teal : COLORS.amber, padding: "2px 6px", borderRadius: 4 }}>{p.group}</span></td>
                  <td style={{ padding: "7px 8px" }}>{p.accessions.toLocaleString()}</td>
                  <td style={{ padding: "7px 8px" }}>{fmtK(p.revenue)}</td>
                  <td style={{ padding: "7px 8px" }}><DenialBadge rate={p.denialBefore} /></td>
                  <td style={{ padding: "7px 8px" }}><DenialBadge rate={p.denialAfter} /></td>
                  <td style={{ padding: "7px 8px" }}>{pct(p.appealSuccess)}</td>
                  <td style={{ padding: "7px 8px" }}>{fmt(p.avgPaid)}</td>
                  <td style={{ padding: "7px 8px" }}>{fmt(p.contracted)}</td>
                  <td style={{ padding: "7px 8px", fontWeight: 500, color: COLORS.teal }}>{fmtK(p.roi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Denial rate reduction by payer</div>
        {MOCK.payers.map(p => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 110, fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{p.name}</div>
            <div style={{ flex: 1, position: "relative", height: 10 }}>
              <div style={{ height: 10, background: COLORS.redLight, borderRadius: 5, width: (p.denialBefore / 25 * 100) + "%" }} />
              <div style={{ height: 10, background: COLORS.teal, borderRadius: 5, width: (p.denialAfter / 25 * 100) + "%", position: "absolute", top: 0 }} />
            </div>
            <div style={{ fontSize: 11, minWidth: 90, textAlign: "right", color: "var(--color-text-secondary)" }}>
              <span style={{ color: COLORS.red }}>{pct(p.denialBefore)}</span> → <span style={{ color: COLORS.teal }}>{pct(p.denialAfter)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CPTTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard label="CPT codes tracked" value="8" />
        <MetricCard label="Highest denial rate" value="81479" sub="Unlisted — 32.4%" color={COLORS.red} />
        <MetricCard label="Best appeal success" value="81235 (EGFR)" sub="76% appeal win rate" color={COLORS.teal} />
        <MetricCard label="Stacking risk flagged" value="3 claim groups" sub="KRAS + EGFR + NRAS" color={COLORS.amber} />
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>CPT code performance</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["CPT", "Description", "Accessions", "Contracted", "Avg paid", "Gap/claim", "Denial rate", "Appeal success", "ROI"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "var(--color-text-secondary)", fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK.cpts.map(c => {
                const desc = CPTS.find(x => x.code === c.code)?.desc || "";
                const gap = c.contracted - c.paid;
                return (
                  <tr key={c.code} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "7px 8px", fontWeight: 500, fontFamily: "monospace" }}>{c.code}</td>
                    <td style={{ padding: "7px 8px", color: "var(--color-text-secondary)", maxWidth: 160 }}>{desc}</td>
                    <td style={{ padding: "7px 8px" }}>{c.accessions.toLocaleString()}</td>
                    <td style={{ padding: "7px 8px" }}>{fmt(c.contracted)}</td>
                    <td style={{ padding: "7px 8px" }}>{fmt(c.paid)}</td>
                    <td style={{ padding: "7px 8px", color: gap > 300 ? COLORS.red : COLORS.amber }}>{fmt(gap)}</td>
                    <td style={{ padding: "7px 8px" }}><DenialBadge rate={c.denialRate} /></td>
                    <td style={{ padding: "7px 8px" }}>{pct(c.appealSuccess)}</td>
                    <td style={{ padding: "7px 8px", fontWeight: 500, color: COLORS.teal }}>{fmtK(c.totalROI)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Code stacking risk flags</div>
        </div>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Claim group", "Codes billed", "Should have been", "Bundling risk ($)", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "var(--color-text-secondary)", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { group: "KRAS + EGFR + NRAS stack", codes: "81275 + 81235 + 81257", should: "81445 (panel)", risk: 48200, status: "Under review" },
              { group: "EGFR + 81479 combo", codes: "81235 + 81479", should: "81455 (large panel)", risk: 31600, status: "Flagged" },
              { group: "Multi-gene individual stack", codes: "81401 × 4", should: "81445 (panel)", risk: 22400, status: "Corrected" },
            ].map(row => (
              <tr key={row.group} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ padding: "7px 8px", fontWeight: 500 }}>{row.group}</td>
                <td style={{ padding: "7px 8px", fontFamily: "monospace", fontSize: 11 }}>{row.codes}</td>
                <td style={{ padding: "7px 8px", color: COLORS.teal }}>{row.should}</td>
                <td style={{ padding: "7px 8px", color: COLORS.red, fontWeight: 500 }}>{fmt(row.risk)}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontSize: 10, background: row.status === "Corrected" ? COLORS.tealLight : row.status === "Flagged" ? COLORS.redLight : COLORS.amberLight, color: row.status === "Corrected" ? COLORS.teal : row.status === "Flagged" ? COLORS.red : COLORS.amber, padding: "2px 8px", borderRadius: 4 }}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState("6mo");

  const tabContent = [<OverviewTab />, <RecoveredTab />, <ProtectedTab />, <SavingsTab />, <PayerTab />, <CPTTab />];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>ClaimsIQ ROI Dashboard</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>GenomicLab Provider — Mock Data</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ fontSize: 12 }}>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="6mo">Last 6 months</option>
            <option value="12mo">Last 12 months</option>
          </select>
          <span style={{ fontSize: 10, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "3px 8px", borderRadius: 4 }}>● Mock data</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 20, overflowX: "auto" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{ padding: "8px 14px", fontSize: 12, background: "none", border: "none", borderBottom: activeTab === i ? "2px solid var(--color-text-primary)" : "2px solid transparent", color: activeTab === i ? "var(--color-text-primary)" : "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: activeTab === i ? 500 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {tabContent[activeTab]}

      <div style={{ marginTop: 24, fontSize: 11, color: "var(--color-text-secondary)", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Data source: Mock — ready for live integration</span>
        <span>Last refresh: April 7, 2026</span>
      </div>
    </div>
  );
}
