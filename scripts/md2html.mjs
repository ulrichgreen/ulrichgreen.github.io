import { marked } from 'marked';

const renderer = new marked.Renderer();
renderer.hr = () => '<div class="section-break" aria-hidden="true">⁂</div>\n';
marked.use({ renderer });

const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  const input = JSON.parse(chunks.join(''));
  const html = marked.parse(input.body);
  process.stdout.write(JSON.stringify({ meta: input.meta, html }));
});
