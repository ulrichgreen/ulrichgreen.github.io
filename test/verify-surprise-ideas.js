const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'SURPRISE-IDEAS.md');

if (!fs.existsSync(file)) {
  console.error('SURPRISE-IDEAS.md not found');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const errors = [];

const sections = [
  'The Big Idea',
  'Discovery and Trigger',
  'The Fake Loading Intro',
  'What Happens After the Intro',
  'Site-Wide Behavior in Full Experience Mode',
  'Motion Language and Visual Material',
  'The Experience Arc After Entry',
  'Guardrails',
  'Reduced-Motion and Accessibility Version',
  'Why This Idea Wins',
  'Recommended Build Order'
];

for (const section of sections) {
  if (!content.includes(section)) {
    errors.push(`Missing required section: "${section}"`);
  }
}

const concepts = [
  'Load full experience',
  'prefers-reduced-motion',
  'footer',
  'Flash',
  'gooooo',
  'CV',
  'homepage',
  'Return to reality',
  'readability',
  'cursor trail'
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

console.log(`SURPRISE-IDEAS.md verified: ${sections.length} sections and ${concepts.length} surprise concepts covered.`);
