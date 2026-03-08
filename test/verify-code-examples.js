const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'CODE-EXAMPLES.md');

if (!fs.existsSync(file)) {
  console.error('CODE-EXAMPLES.md not found');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const errors = [];

// Required sections
const sections = [
  'Philosophy',
  'Highlighting Engine',
  'Pipeline Integration',
  'Code Typeface',
  'CSS Architecture',
  'Horizontal Overflow',
  'Copy to Clipboard',
  'Print Stylesheet',
  'Inline Code',
  'Performance Impact',
  'Accessibility',
  'Build Step',
  'Summary'
];

for (const section of sections) {
  if (!content.includes(section)) {
    errors.push(`Missing required section: "${section}"`);
  }
}

// Required tools and concepts
const tools = [
  'shiki',
  'TextMate',
  'marked',
  'css-variables',
  'pyftsubset',
  'lightningcss'
];

for (const tool of tools) {
  if (!content.includes(tool)) {
    errors.push(`Missing required tool/concept: "${tool}"`);
  }
}

// Required design alignments
const alignments = [
  'baseline',
  'custom properties',
  '@layer',
  'prefers-color-scheme',
  'prefers-reduced-motion',
  'font-feature-settings',
  'aria-label',
  'page-break-inside',
  'user-select'
];

for (const alignment of alignments) {
  if (!content.toLowerCase().includes(alignment.toLowerCase())) {
    errors.push(`Missing design alignment: "${alignment}"`);
  }
}

if (errors.length > 0) {
  console.error('Verification failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`CODE-EXAMPLES.md verified: ${sections.length} sections, ${tools.length} tools, ${alignments.length} design alignments covered.`);
