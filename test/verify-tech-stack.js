const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'TECH-STACK.md');

if (!fs.existsSync(file)) {
  console.error('TECH-STACK.md not found');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const errors = [];

// Required sections
const sections = [
  'Philosophy',
  'The Stack',
  'Build Orchestration',
  'Content Pipeline',
  'Templating',
  'CSS',
  'Typography',
  'Development',
  'Deployment',
  'Absence List',
  'Performance Budget',
  'File Structure',
  'Dependencies'
];

for (const section of sections) {
  if (!content.includes(section)) {
    errors.push(`Missing required section: "${section}"`);
  }
}

// Required tools
const tools = [
  'Make',
  'marked',
  'gray-matter',
  'chokidar',
  'lightningcss',
  'ws',
  'pyftsubset',
  'rsync'
];

for (const tool of tools) {
  if (!content.includes(tool)) {
    errors.push(`Missing required tool: "${tool}"`);
  }
}

// Required design principles coverage
const principles = [
  'baseline',
  'optical size',
  'OpenType',
  'clamp()',
  'font-variation-settings',
  'IntersectionObserver',
  'requestAnimationFrame',
  'sessionStorage',
  'prefers-reduced-motion',
  'print'
];

for (const principle of principles) {
  if (!content.toLowerCase().includes(principle.toLowerCase())) {
    errors.push(`Missing design principle coverage: "${principle}"`);
  }
}

if (errors.length > 0) {
  console.error('Verification failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`TECH-STACK.md verified: ${sections.length} sections, ${tools.length} tools, ${principles.length} design principles covered.`);
