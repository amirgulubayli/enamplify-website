import {esc, exhibit} from '../components.mjs';
import {ledger} from '../exhibits.mjs';

/** The proof ledger shared by home and work. */
export const trackRecord = (ctx, {n, cls = ''} = {}) => {
  const t = ctx.copy.common.trackRecord;
  return exhibit({n, topic: t.topic, title: t.title, cls,
    chart: ledger({caption: t.caption, columns: t.columns, rows: t.rows})}, ctx);
};

/** "We won't / We will", shared by home and about. */
export const commitmentsBlock = ({copy: {common: c}}) => `<div class="commitments"><div><h3>${esc(c.wontTitle)}</h3><ul class="ticks ticks--no">${c.commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>${esc(c.willTitle)}</h3><ul class="ticks">${c.commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
