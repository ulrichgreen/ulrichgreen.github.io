import { Fragment, h, html } from '../scripts/jsx-runtime.mjs';
import BaseLayout from './base.jsx';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function safeISODate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export default function ArticleLayout({
  title,
  description,
  section,
  published,
  revised,
  words,
  note,
  contentHtml,
}) {
  const publishedIso = safeISODate(published);
  const revisedIso = safeISODate(revised);
  const revisedDate = formatDate(revised);
  const publishedDate = formatDate(published);

  return (
    <BaseLayout title={title} description={description} section={section}>
      <article>
        <header class="article-header">
          <h1>{title}</h1>
          <div class="article-meta">
            <time datetime={publishedIso}>{publishedDate}</time>
            {revisedDate && (
              <span class="revised">
                Revised <time datetime={revisedIso}>{revisedDate}</time>
              </span>
            )}
            {words && <span class="word-count">{String(words)} words</span>}
          </div>
          {note && <p class="author-note">{note}</p>}
        </header>
        <div class="article-body">{html(contentHtml)}</div>
        <footer class="article-footer">
          <a href="/index.html">← All writing</a>
        </footer>
      </article>
    </BaseLayout>
  );
}
