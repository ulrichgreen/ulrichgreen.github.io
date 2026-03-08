import base from './base.mjs';

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export default function article(data, content) {
  const revised = data.revised
    ? `<span class="revised">Revised <time datetime="${esc(new Date(data.revised).toISOString().slice(0, 10))}">${formatDate(data.revised)}</time></span>`
    : '';
  const wordCount = data.words ? `<span class="word-count">${esc(String(data.words))} words</span>` : '';
  const note = data.note ? `<p class="author-note">${esc(data.note)}</p>` : '';

  const body = `<article>
    <header class="article-header">
      <h1>${esc(data.title)}</h1>
      <div class="article-meta">
        <time datetime="${esc(data.published ? new Date(data.published).toISOString().slice(0, 10) : '')}">${formatDate(data.published)}</time>
        ${revised}
        ${wordCount}
      </div>
      ${note}
    </header>
    <div class="article-body">
      ${content}
    </div>
    <footer class="article-footer">
      <a href="/index.html">← All writing</a>
    </footer>
  </article>`;

  return base(data, body);
}
