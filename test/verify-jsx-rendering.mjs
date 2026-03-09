import assert from 'node:assert/strict';
import { html, h } from '../scripts/jsx-runtime.mjs';
import { importJsxModule } from '../scripts/load-jsx.mjs';
import { renderToString } from '../scripts/render-html.mjs';

const escaped = renderToString(
  h(
    'div',
    { title: 'Quotes " & < >', hidden: true },
    '<unsafe>',
    false,
    null,
    undefined,
    html('<span>trusted</span>'),
  ),
);

assert.equal(
  escaped,
  '<div title="Quotes &quot; &amp; &lt; &gt;" hidden>&lt;unsafe&gt;<span>trusted</span></div>',
  'renderToString should escape text and attrs while preserving trusted HTML',
);

const { default: BaseLayout } = await importJsxModule('../templates/base.jsx');
const { default: ArticleLayout } = await importJsxModule('../templates/article.jsx');

const baseHtml = `<!doctype html>\n${renderToString(
  h(
    BaseLayout,
    {
      title: 'A < Title',
      description: 'Description & more',
      section: 'home',
    },
    html('<p>Rendered content</p>'),
  ),
)}`;

assert(baseHtml.includes('<title>A &lt; Title</title>'));
assert(baseHtml.includes('<meta name="description" content="Description &amp; more">'));
assert(baseHtml.includes('<main class="page"><p>Rendered content</p></main>'));

const noDescriptionHtml = renderToString(
  h(BaseLayout, {
    title: 'Untitled',
    section: 'home',
  }),
);

assert(noDescriptionHtml.includes('<meta name="description" content="">'));

const articleHtml = `<!doctype html>\n${renderToString(
  h(ArticleLayout, {
    title: 'Essay',
    description: 'Article page',
    section: 'writing',
    published: '2025-03-01',
    revised: '2025-03-02',
    words: 1234,
    note: 'Note <carefully>',
    contentHtml: '<p>Body copy</p>',
  }),
)}`;

assert(articleHtml.includes('<h1>Essay</h1>'));
assert(articleHtml.includes('<time datetime="2025-03-01">March 1, 2025</time>'));
assert(articleHtml.includes('<span class="revised">Revised <time datetime="2025-03-02">March 2, 2025</time></span>'));
assert(articleHtml.includes('<span class="word-count">1234 words</span>'));
assert(articleHtml.includes('<p class="author-note">Note &lt;carefully&gt;</p>'));
assert(articleHtml.includes('<div class="article-body"><p>Body copy</p></div>'));

console.log('JSX rendering verified: runtime, escaping, and JSX layouts render expected HTML.');
