import { Meteor } from 'meteor/meteor';

// Repro for meteor/meteor#12718
// `imports/ui/Hello` exists as BOTH Hello.tsx (a React component) and Hello.css.
// An extensionless import should resolve to the source module (.tsx), not the
// stylesheet. If the resolver prefers .css, the named export `Hello` is missing.
import * as HelloModule from '/imports/ui/Hello';

const helloExport = (HelloModule as Record<string, unknown>).Hello;
const resolvedToSource = typeof helloExport === 'function';

const probe = {
  helloExportType: typeof helloExport,
  moduleKeys: Object.keys(HelloModule),
  resolvedTo: resolvedToSource ? 'Hello.tsx (correct)' : 'Hello.css (BUG)',
};

// eslint-disable-next-line no-console
console.log('[resolve-probe]', JSON.stringify(probe));

Meteor.startup(() => {
  const el = document.createElement('pre');
  el.id = 'resolve-probe';
  el.textContent = JSON.stringify(probe, null, 2);
  document.body.appendChild(el);

  const verdict = document.createElement('div');
  verdict.id = 'resolve-verdict';
  verdict.textContent = resolvedToSource
    ? 'OK: extensionless import resolved to Hello.tsx'
    : 'BUG: extensionless import resolved to Hello.css';
  document.body.appendChild(verdict);
});
