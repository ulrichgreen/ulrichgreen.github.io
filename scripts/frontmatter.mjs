import matter from 'gray-matter';
import { createInterface } from 'readline';

const chunks = [];

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', line => chunks.push(line));
rl.on('close', () => {
  const raw = chunks.join('\n');
  if (!raw.trim()) {
    process.stderr.write('frontmatter.mjs: stdin is empty\n');
    process.exit(1);
  }
  const { data, content } = matter(raw);
  process.stdout.write(JSON.stringify({ meta: data, body: content }));
});
