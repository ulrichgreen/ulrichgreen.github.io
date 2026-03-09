const fs = require('fs');
const path = require('path');

const colophonFile = path.join(__dirname, '..', 'content', 'colophon.md');
const indexFile = path.join(__dirname, '..', 'content', 'index.md');
const errors = [];

if (!fs.existsSync(colophonFile)) {
  console.error('content/colophon.md not found');
  process.exit(1);
}

if (!fs.existsSync(indexFile)) {
  console.error('content/index.md not found');
  process.exit(1);
}

const colophon = fs.readFileSync(colophonFile, 'utf8');
const index = fs.readFileSync(indexFile, 'utf8');

const requiredColophonContent = [
  '# Colophon',
  'TECH-STACK.md',
  'SITE-PLANNING.md',
  'CODE-EXAMPLES.md',
  'SURPRISE-IDEAS.md',
  'static files',
  'raw CSS',
  'Vanilla JS',
  '8px baseline grid',
  'zero external dependencies'
];

for (const item of requiredColophonContent) {
  if (!colophon.includes(item)) {
    errors.push(`Missing colophon content: "${item}"`);
  }
}

if (!index.includes('./colophon.html')) {
  errors.push('Missing index link to ./colophon.html');
}

if (!index.includes('[colophon](./colophon.html)')) {
  errors.push('Missing visible colophon call-to-action on index page');
}

if (errors.length > 0) {
  console.error('colophon verification failed:');
  errors.forEach(function (error) {
    console.error('  - ' + error);
  });
  process.exit(1);
}

console.log('colophon verified: content/colophon.md present, repo-aligned content included, index link added.');
