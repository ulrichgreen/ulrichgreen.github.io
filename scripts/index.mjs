import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { h } from './jsx-runtime.mjs';
import { importJsxModule } from './load-jsx.mjs';
import { renderToString } from './render-html.mjs';

const writingDir = new URL('../content/writing', import.meta.url).pathname;

const articles = readdirSync(writingDir)
  .filter(f => f.endsWith('.md'))
  .map(file => {
    const raw = readFileSync(join(writingDir, file), 'utf8');
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, '');
    return { ...data, slug };
  })
  .filter(a => a.published && !isNaN(new Date(a.published).getTime()))
  .sort((a, b) => new Date(b.published) - new Date(a.published));

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

const meta = {
  title: 'Ulrich Green',
  description: 'Writing on design, engineering, and the considered web.',
  section: 'home',
};

const { default: BaseLayout } = await importJsxModule('../templates/base.jsx');

const content = h(
  'ul',
  { class: 'writing-list' },
  articles.map(article => {
    const iso = new Date(article.published).toISOString().slice(0, 10);

    return h(
      'li',
      null,
      h('a', { href: `/writing/${article.slug}.html` }, article.title || ''),
      ' ',
      h('time', { datetime: iso }, formatDate(article.published)),
    );
  }),
);

process.stdout.write(`<!doctype html>\n${renderToString(h(BaseLayout, meta, content))}`);
