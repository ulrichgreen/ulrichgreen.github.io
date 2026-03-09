import { html as rawHtml, h } from './jsx-runtime.mjs';
import { importJsxModule } from './load-jsx.mjs';
import { renderToString } from './render-html.mjs';

const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', async () => {
  const { meta, html } = JSON.parse(chunks.join(''));
  const section = meta.section || '';
  const [{ default: BaseLayout }, { default: ArticleLayout }] = await Promise.all([
    importJsxModule('../templates/base.jsx'),
    importJsxModule('../templates/article.jsx'),
  ]);

  let page;
  if (section === 'writing') {
    page = h(ArticleLayout, { ...meta, contentHtml: html });
  } else {
    page = h(BaseLayout, meta, html && html.length > 0 ? rawHtml(html) : '');
  }

  process.stdout.write(`<!doctype html>\n${renderToString(page)}`);
});
