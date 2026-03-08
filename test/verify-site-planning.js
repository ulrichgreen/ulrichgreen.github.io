const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'SITE-PLANNING.md');

if (!fs.existsSync(file)) {
  console.error('SITE-PLANNING.md not found');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const errors = [];

const sections = [
  'Governing Principles',
  'What to Avoid',
  'Reach',
  'Performance',
  'Writings',
  'Delightfulness',
  'Design',
  'CV',
  'Order of Operations',
  'The Standard'
];

for (const section of sections) {
  if (!content.includes(section)) {
    errors.push(`Missing required section: "${section}"`);
  }
}

const concepts = [
  'JSON-LD',
  'sitemap.xml',
  'RSS',
  'Open Graph',
  'canonical',
  'performance budget',
  'revised',
  'print',
  'case studies',
  'view source'
];

for (const concept of concepts) {
  if (!content.toLowerCase().includes(concept.toLowerCase())) {
    errors.push(`Missing required concept: "${concept}"`);
  }
}

if (errors.length > 0) {
  console.error('Verification failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`SITE-PLANNING.md verified: ${sections.length} sections and ${concepts.length} planning concepts covered.`);
