import { existsSync, readFileSync } from 'node:fs';

const file = new URL('../docs/MANIFESTO.md', import.meta.url).pathname;

if (!existsSync(file)) {
  console.error('MANIFESTO.md not found');
  process.exit(1);
}

const content = readFileSync(file, 'utf8');
const required = [
  'personal site',
  'authored',
  'islands',
  'TypeScript',
  'HTML',
  'What It Optimizes For',
  'What The Code Must Keep True',
  'What It Refuses',
  'What Success Looks Like',
];

const errors = required.filter(item => !content.includes(item));

if (errors.length > 0) {
  console.error('MANIFESTO.md verification failed:');
  errors.forEach(item => console.error(`  - Missing: ${item}`));
  process.exit(1);
}

console.log(`MANIFESTO.md verified: ${required.length} core ideas present.`);