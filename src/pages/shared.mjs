import {exhibit} from '../components.mjs';
import {ledger} from '../exhibits.mjs';

/** The proof ledger shared by home and work. */
export const trackRecord = ({n, cls = ''} = {}) => exhibit({n, topic: 'Track record', title: 'What we can point to today.', cls,
  chart: ledger({caption: 'Track record', columns: ['Area', 'Evidence'], rows: [
    ['Recognition', 'Google hackathon winners, with a $10,000 winning build'],
    ['Experience', '10+ years building software, automation and AI systems'],
    ['Our own products', 'grademy and pripitch, both in market'],
    ['Client systems', 'Eight kinds delivered, from clinical trial management to finance reconciliation']]}),
  source: 'Enamplify and RAG Medium delivery record. Client names withheld.'});

export const stages = [
  {n: '01', name: 'Diagnose', time: '2–3 weeks',
    short: 'We map where your team’s time goes and choose the few workflows worth doing first. The fee is credited if you continue.',
    what: 'We talk to the people who do the work, map where their time goes, and check what your data, systems and policies allow.',
    get: ['A baseline of where time goes today', 'Three to five workflows ranked by value and risk', 'A pilot plan with the measures agreed up front'],
    note: 'Fixed fee, credited against the pilot if you continue.'},
  {n: '02', name: 'Prove', time: '8–12 weeks',
    short: 'One or two teams build real workflows with us, measured against numbers agreed up front.',
    what: 'Ten to fifteen people from one or two teams build real workflows with us, in a governed environment set up for your organisation.',
    get: ['Workflows in daily use, not demos', 'People who can build the next ones themselves', 'Results measured against the baseline'],
    note: 'Scoped and priced in a written proposal after the diagnostic.'},
  {n: '03', name: 'Scale', time: 'Ongoing',
    short: 'Roll out on your terms, with governance, new use cases and a quarterly report on what changed.',
    what: 'Extend to more teams at the pace you choose. We keep the environment governed, add new workflow templates, and report on what changed each quarter.',
    get: ['A growing library of workflows your team owns', 'Governance that keeps pace with use', 'A quarterly impact report for leadership'],
    note: 'A subscription you can scale up, down or end.'}
];

export const commitments = {
  wont: ['Promise percentages we can’t evidence.', 'Lock you into our tools.', 'Move your data anywhere you haven’t approved.', 'Frame this as replacing your people.'],
  will: ['Agree how success is measured before we start.', 'Leave you with something your team runs without us.']
};
