import {esc} from './components.mjs';
import {fill} from './i18n.mjs';

const pct = n => `${Math.round(n)}%`;
const legend = items => `<ul class="legend">${items.map(s => `<li><span class="swatch swatch--${esc(s.tone)}" aria-hidden="true"></span><span class="legend__label">${esc(s.label)}</span>${s.value === undefined ? '' : `<span class="legend__value">${pct(s.value)}</span>`}</li>`).join('')}</ul>`;

/** A single 100% horizontal bar. The legend carries the data for assistive technology. */
export function stackedBar(segments) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (Math.round(total) !== 100) throw new Error(`Stacked bar segments must total 100, got ${total}`);
  let x = 0;
  const rects = segments.map((s, i) => {
    const isLast = i === segments.length - 1;
    const width = isLast ? s.value : Math.max(s.value - 0.6, 0);
    const rect = `<rect class="mark mark--${esc(s.tone)}" x="${x}" y="0" width="${width}" height="14"/>`;
    x += s.value;
    return rect;
  }).join('');
  return `<svg class="stack" viewBox="0 0 100 14" preserveAspectRatio="none" width="100" height="14" aria-hidden="true">${rects}</svg>${legend(segments)}`;
}

/** Horizontal bars on a shared scale, one row per value. */
export function pairedBars({unit, max, rows}) {
  const label = rows.map(r => `${r.label}: ${r.value} ${unit}`).join('; ');
  return `<div class="bars" role="img" aria-label="${esc(label)}">${rows.map(r => `<div class="bars__row" aria-hidden="true"><span class="bars__label">${esc(r.label)}</span><svg class="bars__track" viewBox="0 0 100 12" preserveAspectRatio="none" width="100" height="12"><rect class="bars__bg" x="0" y="0" width="100" height="12"/><rect class="mark mark--${esc(r.tone)}" x="0" y="0" width="${+(r.value / max * 100).toFixed(1)}" height="12"/></svg><span class="bars__value">${r.value} ${esc(unit)}</span></div>`).join('')}</div>`;
}

/** Hairline line chart with direct end labels in a right-hand gutter; the full labels live in the aria-label. */
export function lineChart({xLabels, series, max, summary = '{label}: {first} at {start}, {last} at {end}'}) {
  const n = series[0].values.length;
  if (n < 2) throw new Error('lineChart needs at least 2 points per series');
  for (const s of series) {
    if (s.values.length !== n) throw new Error('lineChart series must have the same length');
    for (const v of s.values) {
      if (v > max || v < 0) throw new Error(`lineChart values must be between 0 and ${max}`);
    }
  }
  const PW = 300, GUTTER = 80, W = PW + GUTTER, H = 150, P = 6, GAP = 14;
  const x = i => P + i * (PW - 2 * P) / (n - 1);
  const y = v => H - P - v / max * (H - 2 * P);
  const grid = [0, 0.5, 1].map(t => `<line class="gridline" x1="0" x2="${PW}" y1="${y(max * t)}" y2="${y(max * t)}"/>`).join('');
  const lines = series.map(s => `<polyline class="mark-line mark-line--${esc(s.tone)}" pathLength="1" points="${s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  // End labels, top to bottom, nudged apart so they never collide.
  const ends = series.map(s => ({s, ly: y(s.values.at(-1))})).sort((a, b) => a.ly - b.ly);
  for (let i = 1; i < ends.length; i++) if (ends[i].ly - ends[i - 1].ly < GAP) ends[i].ly = ends[i - 1].ly + GAP;
  const overflow = ends.length ? Math.max(0, ends.at(-1).ly - (H - P)) : 0;
  for (const e of ends) e.ly = Math.max(P, e.ly - overflow);
  const labels = ends.map(({s, ly}) => `<text class="line-label line-label--${esc(s.tone)}" x="${x(n - 1) + 8}" y="${ly.toFixed(1)}" dominant-baseline="middle">${esc(s.short || s.label)}</text>`).join('');
  const label = series.map(s => fill(summary, {label: s.label, first: s.values[0], start: xLabels[0], last: s.values.at(-1), end: xLabels.at(-1)})).join('; ');
  return `<svg class="linechart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">${grid}${lines}${labels}</svg><div class="axis" aria-hidden="true"><span>${esc(xLabels[0])}</span><span>${esc(xLabels.at(-1))}</span></div>`;
}

/** A small governance ledger: first cell of each row is its header. */
export const ledger = ({caption, columns, rows}) => `<div class="ledger-scroll" tabindex="0" role="region" aria-label="${esc(caption)}"><table class="ledger"><caption class="sr-only">${esc(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
