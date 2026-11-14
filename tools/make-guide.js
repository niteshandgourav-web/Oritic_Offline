// Builds docs/USER-GUIDE.md from js/guide.js (same text as the in-app Guide page).
// Run from the project folder:  node tools/make-guide.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js', 'guide.js'));
let md = '# Oritic panel: kaise use karein\n\nYe wahi guide hai jo panel ke andar **Menu → Guide** me hai.\n\n';
globalThis.GUIDE.forEach((g, i) => {
  md += `## ${i + 1}. ${g.t}\n\n`;
  if (g.where) md += `**Kahan:** ${g.where}\n\n`;
  g.steps.forEach((s, k) => { md += `${k + 1}. ${s}\n`; });
  if (g.tips.length) md += '\n' + g.tips.map(t => `> Dhyan: ${t}`).join('\n>\n') + '\n';
  md += '\n';
});
fs.writeFileSync(path.join(root, 'docs', 'USER-GUIDE.md'), md);
console.log('docs/USER-GUIDE.md written,', globalThis.GUIDE.length, 'sections');
