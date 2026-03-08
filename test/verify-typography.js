const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'docs', 'index.html');

if (!fs.existsSync(file)) {
  console.error('docs/index.html not found');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const errors = [];

// Required: six system font stacks reachable via data-font attribute
const fontStacks = [
  'ui-serif',
  'georgia',
  'charter',
  'palatino',
  'optima',
  'system-ui'
];

for (const stack of fontStacks) {
  if (!content.includes(`data-font="${stack}"`)) {
    errors.push(`Missing font stack: data-font="${stack}"`);
  }
}

// Required: baseline grid
const gridFeatures = [
  '--u:',               // 8px grid unit custom property
  'show-grid',          // grid overlay CSS class
  'js-grid-btn',        // grid toggle button
  'toggleGrid'          // grid toggle function
];

for (const feature of gridFeatures) {
  if (!content.includes(feature)) {
    errors.push(`Missing baseline grid feature: "${feature}"`);
  }
}

// Required: dark mode support
const darkModeFeatures = [
  'prefers-color-scheme',   // system dark mode media query
  'data-theme',             // manual theme override
  'js-theme-btn'            // theme toggle button
];

for (const feature of darkModeFeatures) {
  if (!content.includes(feature)) {
    errors.push(`Missing dark mode feature: "${feature}"`);
  }
}

// Required: baseline grid multiples documented in CSS
const gridValues = [
  '--lh-3u',   // 24px — 3 units
  '--lh-4u',   // 32px — 4 units (body line-height)
  '--lh-5u',   // 40px — 5 units (h2)
  '--lh-7u'    // 56px — 7 units (h1)
];

for (const val of gridValues) {
  if (!content.includes(val)) {
    errors.push(`Missing baseline grid line-height variable: "${val}"`);
  }
}

// Required: type specimen section
if (!content.includes('specimen')) {
  errors.push('Missing type specimen section');
}

// Required: font switcher interactivity
if (!content.includes('data-font-id')) {
  errors.push('Missing font-switcher button attribute data-font-id');
}

// Required: keyboard shortcut for grid (B key)
if (!content.includes("e.key === 'b'") && !content.includes('e.key === "b"')) {
  errors.push("Missing keyboard shortcut for baseline grid toggle (B key)");
}

// Required: no external dependencies (no external URLs in link/script/img/src attributes)
const externalPattern = /(?:href|src|url)\s*=\s*["']https?:\/\//gi;
const externalMatches = content.match(externalPattern);
if (externalMatches) {
  errors.push(`Found external URL references (zero external deps required): ${externalMatches.join(', ')}`);
}

// Required: prefers-reduced-motion
if (!content.includes('prefers-reduced-motion')) {
  errors.push('Missing prefers-reduced-motion media query');
}

if (errors.length > 0) {
  console.error('typography.html verification failed:');
  errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

console.log(
  'typography.html verified: ' +
  fontStacks.length + ' font stacks, ' +
  gridValues.length + ' grid line-heights, ' +
  'grid overlay, dark mode, type specimen, zero external deps.'
);
