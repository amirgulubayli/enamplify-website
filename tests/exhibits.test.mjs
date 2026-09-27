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
});
test('stackedBar refuses segments that do not total 100', () => {
  assert.throws(() => stackedBar([{label: 'A', value: 40, tone: 'navy'}]), /total 100/);
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
});
test('ledger uses row and column headers', () => {
  const html = ledger({caption: 'Example', columns: ['Workflow', 'Owner'], rows: [['Board report', 'Finance']]});
  assert.ok(html.includes('<th scope="col">Workflow</th>'));
  assert.ok(html.includes('<th scope="row">Board report</th>'));
  assert.ok(html.includes('<td>Finance</td>'));
});
