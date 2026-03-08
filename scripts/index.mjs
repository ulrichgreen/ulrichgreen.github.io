import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import base from '../templates/base.mjs';

const writingDir = new URL('../content/writing', import.meta.url).pathname;

const articles = readdirSync(writingDir)
  .filter(f => f.endsWith('.md'))
  .map(file => {
    const raw = readFileSync(join(writingDir, file), 'utf8');
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, '');
    return { ...data, slug };
  })
  .filter(a => a.published)
  .sort((a, b) => new Date(b.published) - new Date(a.published));

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

const listItems = articles.map(a => {
  const iso = new Date(a.published).toISOString().slice(0, 10);
  return `
  <li>
    <a href="/writing/${a.slug}.html">${a.title}</a>
    <time datetime="${iso}">${formatDate(a.published)}</time>
  </li>`;
}).join('');

const content = `<ul class="writing-list">${listItems}\n</ul>`;

const meta = {
  title: 'Ulrich Green',
  description: 'Writing on design, engineering, and the considered web.',
  section: 'home',
};

process.stdout.write(base(meta, content));
