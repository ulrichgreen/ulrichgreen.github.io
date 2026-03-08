const fs = require('fs');
const path = require('path');

const colophonFile = path.join(__dirname, '..', 'docs', 'colophon.html');
const indexFile = path.join(__dirname, '..', 'docs', 'index.html');
const errors = [];

if (!fs.existsSync(colophonFile)) {
  console.error('docs/colophon.html not found');
  process.exit(1);
}

if (!fs.existsSync(indexFile)) {
  console.error('docs/index.html not found');
  process.exit(1);
}

const colophon = fs.readFileSync(colophonFile, 'utf8');
const index = fs.readFileSync(indexFile, 'utf8');

const requiredColophonContent = [
  '<h1>Colophon</h1>',
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

if (!index.includes('href="./colophon.html"')) {
  errors.push('Missing index link to ./colophon.html');
}

if (!index.includes('Read the <a href="./colophon.html">colophon</a>')) {
  errors.push('Missing visible colophon call-to-action on index page');
}

const externalPattern = /(?:href|src)\s*=\s*["']https?:\/\//gi;
const externalMatches = colophon.match(externalPattern);
if (externalMatches) {
  errors.push(`Found external URL references in colophon: ${externalMatches.join(', ')}`);
}

if (errors.length > 0) {
  console.error('colophon verification failed:');
  errors.forEach(function (error) {
    console.error('  - ' + error);
  });
  process.exit(1);
}

console.log('colophon verified: standalone page present, repo-aligned content included, index link added.');
