import test from 'node:test';
import assert from 'node:assert/strict';
import {stackedBar, pairedBars, lineChart, ledger} from '../src/exhibits.mjs';

const week = [
  {label: 'Judgement and client work', value: 41, tone: 'navy'},
  {label: 'Recurring reporting', value: 21, tone: 'signal'},
  {label: 'Finding information', value: 16, tone: 'signal'},
  {label: 'Handoffs and chasing', value: 13, tone: 'signal'},
  {label: 'Other', value: 9, tone: 'rule'}
];

test('stackedBar draws one mark per segment and a readable legend', () => {
  const html = stackedBar(week);
  assert.equal([...html.matchAll(/class="mark mark--/g)].length, 5);
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('Recurring reporting') && html.includes('21%'));
  assert.ok(!html.includes('<ul class="legend" aria-hidden'));
});
test('stackedBar refuses segments that do not total 100', () => {
  assert.throws(() => stackedBar([{label: 'A', value: 40, tone: 'navy'}]), /total 100/);
});
test('stackedBar does not shorten the last segment', () => {
  const html = stackedBar(week);
  const rects = [...html.matchAll(/<rect class="mark mark--\w+" x="([\d.]+)" y="0" width="([\d.]+)"/g)];
  const last = rects.at(-1);
  assert.equal(Number(last[1]) + Number(last[2]), 100);
});
test('pairedBars scales against max and labels values', () => {
  const html = pairedBars({unit: 'hours', max: 16, rows: [{label: 'Before', value: 14, tone: 'rule'}, {label: 'After', value: 6, tone: 'signal'}]});
  assert.ok(html.includes('width="87.5"'));
  assert.ok(html.includes('width="37.5"'));
  assert.ok(html.includes('aria-label="Before: 14 hours; After: 6 hours"'));
});
test('lineChart emits one polyline per series with pathLength for the reveal', () => {
  const html = lineChart({xLabels: ['Month 1', 'Month 12'], max: 12, series: [
    {label: 'Maintained by your team', tone: 'signal', values: [0, 2, 5, 9, 12]},
    {label: 'Maintained by Enamplify', tone: 'navy', values: [3, 4, 3, 2, 1]}
  ]});
  assert.equal([...html.matchAll(/<polyline /g)].length, 2);
  assert.ok(html.includes('pathLength="1"'));
  assert.ok(html.includes('role="img"'));
  assert.ok(html.includes('Maintained by your team: 0 at Month 1, 12 at Month 12'));
  assert.ok(html.includes('Maintained by Enamplify: 3 at Month 1, 1 at Month 12'));
  assert.ok(html.includes('<ul class="legend" aria-hidden="true">'));
});
test('lineChart requires at least two points per series', () => {
  assert.throws(() => lineChart({xLabels: ['A', 'B'], max: 10, series: [{label: 'X', tone: 'navy', values: [5]}]}), /at least 2/);
});
test('lineChart requires all series to share the same length', () => {
  assert.throws(() => lineChart({xLabels: ['A', 'B'], max: 10, series: [
    {label: 'X', tone: 'navy', values: [0, 5]},
    {label: 'Y', tone: 'signal', values: [0, 5, 10]}
  ]}), /same length/);
});
test('lineChart rejects values above max', () => {
  assert.throws(() => lineChart({xLabels: ['A', 'B'], max: 10, series: [{label: 'X', tone: 'navy', values: [0, 11]}]}), /between 0 and/);
});
test('lineChart rejects negative values', () => {
  assert.throws(() => lineChart({xLabels: ['A', 'B'], max: 10, series: [{label: 'X', tone: 'navy', values: [-1, 5]}]}), /between 0 and/);
});
test('ledger uses row and column headers', () => {
  const html = ledger({caption: 'Example', columns: ['Workflow', 'Owner'], rows: [['Board report', 'Finance']]});
  assert.ok(html.includes('<th scope="col">Workflow</th>'));
  assert.ok(html.includes('<th scope="row">Board report</th>'));
  assert.ok(html.includes('<td>Finance</td>'));
});
test('ledger scroll wrapper is a focusable, named region', () => {
  const html = ledger({caption: 'Track record', columns: ['Area'], rows: [['Recognition']]});
  assert.ok(html.startsWith('<div class="ledger-scroll" tabindex="0" role="region" aria-label="Track record">'));
});
test('lineChart legend uses line swatches ordered by final value, highest first', () => {
  const html = lineChart({xLabels: ['A', 'B'], max: 12, series: [
    {label: 'Low end', tone: 'navy', values: [3, 1]},
    {label: 'High end', tone: 'signal', values: [0, 12]}
  ]});
  const legendHtml = html.slice(html.indexOf('<ul class="legend"'));
  assert.ok(legendHtml.indexOf('High end') < legendHtml.indexOf('Low end'));
  assert.ok(legendHtml.includes('class="swatch swatch--line swatch--signal"'));
  assert.ok(html.indexOf('mark-line--navy') < html.indexOf('mark-line--signal'), 'series drawing order is unchanged');
});
