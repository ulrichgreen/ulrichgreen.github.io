const fs = require('fs');

const text = fs.readFileSync('TECH-STACK.md', 'utf8');

[
  '# Handcrafted Personal Site Tech Stack',
  '## Recommended stack',
  'Pandoc',
  'Plain CSS',
  'Vanilla JavaScript',
].forEach((snippet) => {
  if (!text.includes(snippet)) {
    throw new Error(`Missing required content: ${snippet}`);
  }
});

console.log('Verified TECH-STACK.md');
