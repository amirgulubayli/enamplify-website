import {esc} from './components.mjs';

const pct = n => `${Math.round(n)}%`;
const legend = items => `<ul class="legend">${items.map(s => `<li><span class="swatch swatch--${s.tone}" aria-hidden="true"></span><span class="legend__label">${esc(s.label)}</span>${s.value === undefined ? '' : `<span class="legend__value">${pct(s.value)}</span>`}</li>`).join('')}</ul>`;

/** A single 100% horizontal bar. The legend carries the data for assistive technology. */
export function stackedBar(segments) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (Math.round(total) !== 100) throw new Error(`Stacked bar segments must total 100, got ${total}`);
  let x = 0;
  const rects = segments.map(s => {
    const rect = `<rect class="mark mark--${s.tone}" x="${x}" y="0" width="${Math.max(s.value - 0.6, 0)}" height="14"/>`;
    x += s.value;
    return rect;
  }).join('');
  return `<svg class="stack" viewBox="0 0 100 14" preserveAspectRatio="none" width="100" height="14" aria-hidden="true">${rects}</svg>${legend(segments)}`;
}

/** Horizontal bars on a shared scale, one row per value. */
export function pairedBars({unit, max, rows}) {
  const label = rows.map(r => `${r.label}: ${r.value} ${unit}`).join('; ');
  return `<div class="bars" role="img" aria-label="${esc(label)}">${rows.map(r => `<div class="bars__row" aria-hidden="true"><span class="bars__label">${esc(r.label)}</span><svg class="bars__track" viewBox="0 0 100 12" preserveAspectRatio="none" width="100" height="12"><rect class="bars__bg" x="0" y="0" width="100" height="12"/><rect class="mark mark--${r.tone}" x="0" y="0" width="${+(r.value / max * 100).toFixed(1)}" height="12"/></svg><span class="bars__value">${r.value} ${esc(unit)}</span></div>`).join('')}</div>`;
}

/** Hairline line chart; labels live in HTML so they never scale with the SVG. */
export function lineChart({xLabels, series, max}) {
  const W = 300, H = 150, P = 6, n = series[0].values.length;
  const x = i => P + i * (W - 2 * P) / (n - 1);
  const y = v => H - P - v / max * (H - 2 * P);
  const grid = [0, 0.5, 1].map(t => `<line class="gridline" x1="0" x2="${W}" y1="${y(max * t)}" y2="${y(max * t)}"/>`).join('');
  const lines = series.map(s => `<polyline class="mark-line mark-line--${s.tone}" pathLength="1" points="${s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  const label = series.map(s => `${s.label}: from ${s.values[0]} to ${s.values.at(-1)}`).join('; ');
  return `<svg class="linechart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">${grid}${lines}</svg><div class="axis" aria-hidden="true"><span>${esc(xLabels[0])}</span><span>${esc(xLabels.at(-1))}</span></div>${legend(series.map(({label, tone}) => ({label, tone})))}`;
}

/** A small governance ledger: first cell of each row is its header. */
export const ledger = ({caption, columns, rows}) => `<div class="ledger-scroll"><table class="ledger"><caption class="sr-only">${esc(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
