import {esc} from '../components.mjs';

/** Ownership and delivery responsibilities on About. */
export const commitmentsBlock = ({copy: {common: c}}) => `<div class="commitments"><div><h3>${esc(c.wontTitle)}</h3><ul class="ticks ticks--no">${c.commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>${esc(c.willTitle)}</h3><ul class="ticks">${c.commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
