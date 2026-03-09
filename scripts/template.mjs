import base from '../templates/base.mjs';
import article from '../templates/article.mjs';

const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  const { meta, html } = JSON.parse(chunks.join(''));
  const section = meta.section || '';
  let output;
  if (section === 'writing') {
    output = article(meta, html);
  } else {
    output = base(meta, html);
  }
  process.stdout.write(output);
});
