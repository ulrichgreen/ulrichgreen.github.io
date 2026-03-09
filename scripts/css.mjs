import { transform } from 'lightningcss';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const src = new URL('../src/style.css', import.meta.url).pathname;
const dest = new URL('../dist/style.css', import.meta.url).pathname;

mkdirSync(new URL('../dist', import.meta.url).pathname, { recursive: true });

const code = readFileSync(src);
const { code: output } = transform({
  filename: 'style.css',
  code,
  minify: true,
  targets: {
    // lightningcss encodes versions as (major << 16) | (minor << 8) | patch
    chrome: (120 << 16),
    firefox: (121 << 16),
    safari: (17 << 16),
  },
});

writeFileSync(dest, output);
process.stdout.write(`css.mjs: wrote ${output.length} bytes to dist/style.css\n`);
